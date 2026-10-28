"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
import { parseDecklistText } from "@/lib/deckbuilder/import";
import { normalizeColorIdentity } from "@/lib/deckbuilder/legality";
import { resolveCardByName } from "@/lib/deckbuilder/scryfall-card";
import { safeNext } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export type FormState = { error: string; message?: string } | null;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireBuilderUser(returnPath: string) {
  const enabled = await isFeatureEnabled("deckbuilder_core");
  if (!enabled) {
    return { user: null, error: "Taverna u Kosa (deckbuilder_core) není zapnutá." };
  }

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeNext(returnPath))}`);
  if (!user.username) {
    return { user: null, error: "Profil se ještě nezaložil. Odhlás se a přihlas znovu." };
  }
  return { user, error: null };
}

function dbError(message: string) {
  if (message.includes("row-level security") || message.includes("permission")) {
    return "Uložení se nepovedlo. Zkus se přihlásit znovu.";
  }
  if (message.includes("decks_v2") || message.includes("PGRST")) {
    return "Chybí migrace Taverny. Spusť 20261029120000_taverna_u_kosa.sql v Supabase.";
  }
  return "Uložení se nepovedlo. Zkus to znovu.";
}

export async function createDeck(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireBuilderUser("/decks/new");
  if (!auth.user) return { error: auth.error ?? "Nejdřív se přihlas." };

  const name = String(formData.get("name") ?? "").trim();
  const format = String(formData.get("format") ?? "EDH").trim();
  const commanderName = String(formData.get("commander") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (name.length < 1 || name.length > 120) return { error: "Název: 1–120 znaků." };
  if (format !== "EDH" && format !== "cEDH") return { error: "Neplatný formát." };
  if (commanderName.length < 1 || commanderName.length > 160) {
    return { error: "Commander: 1–160 znaků." };
  }

  const commander = await resolveCardByName(commanderName);
  if (!commander) return { error: "Commandera se nepodařilo najít." };

  const colorIdentity = normalizeColorIdentity(commander.colorIdentity);
  const supabase = await createClient();

  const { data: deck, error } = await supabase
    .from("decks_v2")
    .insert({
      owner_id: auth.user.id,
      name,
      format,
      description,
      commander_name: commander.name,
      commander_scryfall_id: commander.scryfallId,
      color_identity: colorIdentity,
      is_public: true,
    })
    .select("id")
    .single();

  if (error || !deck?.id) {
    console.error("createDeck v2", error?.code, error?.message);
    return { error: dbError(error?.message ?? "") };
  }

  const { error: cardError } = await supabase.from("deck_cards").insert({
    deck_id: deck.id,
    scryfall_id: commander.scryfallId,
    name: commander.name,
    quantity: 1,
    board: "commander",
    mana_cost: commander.manaCost,
    type_line: commander.typeLine,
    oracle_text: commander.oracleText,
    color_identity: commander.colorIdentity,
    image_url: commander.imageUrl,
    is_basic_land: false,
  });

  if (cardError) {
    console.error("createDeck commander card", cardError.code, cardError.message);
    return { error: dbError(cardError.message) };
  }

  if (commander.scryfallId) {
    await supabase.from("card_cache").upsert({
      scryfall_id: commander.scryfallId,
      name: commander.name,
      mana_cost: commander.manaCost,
      type_line: commander.typeLine,
      oracle_text: commander.oracleText,
      color_identity: commander.colorIdentity,
      image_url: commander.imageUrl,
      is_basic_land: false,
      legalities: commander.legalities,
      updated_at: new Date().toISOString(),
    });
  }

  redirect(`/decks/v2/${deck.id}/edit`);
}

export async function addCardToDeck(_prev: FormState, formData: FormData): Promise<FormState> {
  const deckId = String(formData.get("deckId") ?? "");
  if (!UUID.test(deckId)) return { error: "Neplatný deck." };

  const auth = await requireBuilderUser(`/decks/v2/${deckId}/edit`);
  if (!auth.user) return { error: auth.error ?? "Nejdřív se přihlas." };

  const cardQuery = String(formData.get("cardName") ?? "").trim();
  const quantity = Math.min(99, Math.max(1, Number(formData.get("quantity") ?? 1) || 1));
  const boardRaw = String(formData.get("board") ?? "main");
  const board = boardRaw === "commander" || boardRaw === "sideboard" ? boardRaw : "main";

  if (!cardQuery) return { error: "Zadej jméno karty." };

  const resolved = await resolveCardByName(cardQuery);
  if (!resolved) return { error: "Kartu se nepodařilo najít." };

  const supabase = await createClient();
  const { data: deck, error: deckError } = await supabase
    .from("decks_v2")
    .select("id, owner_id")
    .eq("id", deckId)
    .maybeSingle();

  if (deckError || !deck) return { error: "Deck nenalezen." };
  if (deck.owner_id !== auth.user.id) return { error: "Nemáš oprávnění upravovat tento deck." };

  const { data: existing } = await supabase
    .from("deck_cards")
    .select("id, quantity")
    .eq("deck_id", deckId)
    .eq("name", resolved.name)
    .eq("board", board)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("deck_cards")
      .update({ quantity: Math.min(99, Number(existing.quantity) + quantity) })
      .eq("id", existing.id);
    if (error) return { error: dbError(error.message) };
  } else {
    const { error } = await supabase.from("deck_cards").insert({
      deck_id: deckId,
      scryfall_id: resolved.scryfallId,
      name: resolved.name,
      quantity,
      board,
      mana_cost: resolved.manaCost,
      type_line: resolved.typeLine,
      oracle_text: resolved.oracleText,
      color_identity: resolved.colorIdentity,
      image_url: resolved.imageUrl,
      is_basic_land: resolved.isBasicLand,
    });
    if (error) return { error: dbError(error.message) };
  }

  if (resolved.scryfallId) {
    await supabase.from("card_cache").upsert({
      scryfall_id: resolved.scryfallId,
      name: resolved.name,
      mana_cost: resolved.manaCost,
      type_line: resolved.typeLine,
      oracle_text: resolved.oracleText,
      color_identity: resolved.colorIdentity,
      image_url: resolved.imageUrl,
      is_basic_land: resolved.isBasicLand,
      legalities: resolved.legalities,
      updated_at: new Date().toISOString(),
    });
  }

  await supabase
    .from("decks_v2")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", deckId);

  revalidatePath(`/decks/v2/${deckId}`);
  revalidatePath(`/decks/v2/${deckId}/edit`);
  return null;
}

export async function removeCardFromDeck(_prev: FormState, formData: FormData): Promise<FormState> {
  const deckId = String(formData.get("deckId") ?? "");
  const cardId = String(formData.get("cardId") ?? "");
  if (!UUID.test(deckId) || !UUID.test(cardId)) return { error: "Neplatný požadavek." };

  const auth = await requireBuilderUser(`/decks/v2/${deckId}/edit`);
  if (!auth.user) return { error: auth.error ?? "Nejdřív se přihlas." };

  const supabase = await createClient();
  const { data: deck } = await supabase
    .from("decks_v2")
    .select("owner_id")
    .eq("id", deckId)
    .maybeSingle();

  if (!deck || deck.owner_id !== auth.user.id) {
    return { error: "Nemáš oprávnění upravovat tento deck." };
  }

  const { error } = await supabase.from("deck_cards").delete().eq("id", cardId).eq("deck_id", deckId);
  if (error) return { error: dbError(error.message) };

  await supabase
    .from("decks_v2")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", deckId);

  revalidatePath(`/decks/v2/${deckId}`);
  revalidatePath(`/decks/v2/${deckId}/edit`);
  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Modul 02 — import textového decklistu (Arena / Moxfield export).
 * Vyžaduje feature flag `deckbuilder_import`.
 */
export async function importDecklist(_prev: FormState, formData: FormData): Promise<FormState> {
  const deckId = String(formData.get("deckId") ?? "");
  if (!UUID.test(deckId)) return { error: "Neplatný deck." };

  const importOn = await isFeatureEnabled("deckbuilder_import");
  if (!importOn) {
    return {
      error:
        "Import je vypnutý (flag deckbuilder_import). V SQL: update feature_flags set enabled = true where key = 'deckbuilder_import';",
    };
  }

  const auth = await requireBuilderUser(`/decks/v2/${deckId}/edit`);
  if (!auth.user) return { error: auth.error ?? "Nejdřív se přihlas." };

  const raw = String(formData.get("decklist") ?? "");
  if (raw.trim().length < 3) return { error: "Vlož textový decklist." };

  const replaceMain = formData.get("replaceMain") === "on" || formData.get("replaceMain") === "true";

  const parsed = parseDecklistText(raw);
  if (parsed.length === 0) return { error: "V listu nejsou žádné karty." };

  const merged = new Map<string, (typeof parsed)[number]>();
  for (const line of parsed) {
    const key = `${line.board}::${line.name.toLowerCase()}`;
    const prev = merged.get(key);
    if (prev) prev.quantity = Math.min(99, prev.quantity + line.quantity);
    else merged.set(key, { ...line });
  }
  const lines = Array.from(merged.values());
  if (lines.length > 120) {
    return { error: `List má ${lines.length} unikátních řádků — max 120 na jeden import.` };
  }

  const supabase = await createClient();
  const { data: deck } = await supabase
    .from("decks_v2")
    .select("owner_id")
    .eq("id", deckId)
    .maybeSingle();

  if (!deck || deck.owner_id !== auth.user.id) {
    return { error: "Nemáš oprávnění upravovat tento deck." };
  }

  if (replaceMain) {
    const { error } = await supabase
      .from("deck_cards")
      .delete()
      .eq("deck_id", deckId)
      .eq("board", "main");
    if (error) return { error: dbError(error.message) };
  }

  let imported = 0;
  let failed = 0;

  for (const line of lines) {
    const resolved = await resolveCardByName(line.name);
    await sleep(55);
    if (!resolved) {
      failed += 1;
      continue;
    }

    const { data: existing } = await supabase
      .from("deck_cards")
      .select("id, quantity")
      .eq("deck_id", deckId)
      .eq("name", resolved.name)
      .eq("board", line.board)
      .maybeSingle();

    if (existing?.id) {
      const nextQty = replaceMain
        ? line.quantity
        : Math.min(99, Number(existing.quantity) + line.quantity);
      const { error } = await supabase
        .from("deck_cards")
        .update({ quantity: nextQty })
        .eq("id", existing.id);
      if (error) failed += 1;
      else imported += 1;
    } else {
      const { error } = await supabase.from("deck_cards").insert({
        deck_id: deckId,
        scryfall_id: resolved.scryfallId,
        name: resolved.name,
        quantity: line.quantity,
        board: line.board,
        mana_cost: resolved.manaCost,
        type_line: resolved.typeLine,
        oracle_text: resolved.oracleText,
        color_identity: resolved.colorIdentity,
        image_url: resolved.imageUrl,
        is_basic_land: resolved.isBasicLand,
      });
      if (error) failed += 1;
      else imported += 1;
    }

    if (resolved.scryfallId) {
      await supabase.from("card_cache").upsert({
        scryfall_id: resolved.scryfallId,
        name: resolved.name,
        mana_cost: resolved.manaCost,
        type_line: resolved.typeLine,
        oracle_text: resolved.oracleText,
        color_identity: resolved.colorIdentity,
        image_url: resolved.imageUrl,
        is_basic_land: resolved.isBasicLand,
        legalities: resolved.legalities,
        updated_at: new Date().toISOString(),
      });
    }
  }

  await supabase
    .from("decks_v2")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", deckId);

  revalidatePath(`/decks/v2/${deckId}`);
  revalidatePath(`/decks/v2/${deckId}/edit`);

  if (imported === 0) {
    return { error: `Import selhal (0 karet). Neúspěšných: ${failed}.` };
  }

  redirect(`/decks/v2/${deckId}/edit`);
}

