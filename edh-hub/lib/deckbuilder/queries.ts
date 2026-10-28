import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { publicName } from "@/lib/admin";
import type { DeckFormat } from "@/lib/deckbuilder/legality";
import type { DeckCardBoard, DeckV2, DeckV2Card } from "@/lib/deckbuilder/types";
import type { QueryResult } from "@/lib/supabase/queries";

function failure(error: { code?: string; message?: string } | null): QueryResult<never> {
  return {
    status: "error",
    message: error?.message || "Dotaz na deck selhal.",
  };
}

function mapCard(row: Record<string, unknown>): DeckV2Card {
  return {
    id: String(row.id),
    deckId: String(row.deck_id),
    scryfallId: (row.scryfall_id as string | null) ?? null,
    name: String(row.name),
    quantity: Number(row.quantity) || 1,
    board: (row.board as DeckCardBoard) || "main",
    manaCost: (row.mana_cost as string | null) ?? null,
    typeLine: (row.type_line as string | null) ?? null,
    oracleText: (row.oracle_text as string | null) ?? null,
    colorIdentity: (row.color_identity as string[]) ?? [],
    imageUrl: (row.image_url as string | null) ?? null,
    isBasicLand: Boolean(row.is_basic_land),
  };
}

export async function getDeckV2(id: string): Promise<QueryResult<DeckV2 | null>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks_v2")
    .select(
      "id, owner_id, name, format, description, commander_name, commander_scryfall_id, partner_name, partner_scryfall_id, color_identity, is_public, created_at, updated_at, owner:profiles!decks_v2_owner_id_fkey(username, display_name)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("decks_v2")) {
      return {
        status: "error",
        message:
          "Chybí tabulky Taverny. V Supabase SQL editoru spusť supabase/migrations/20261029120000_taverna_u_kosa.sql.",
      };
    }
    return failure(error);
  }
  if (!data) return { status: "ok", data: null };

  const { data: cards, error: cardsError } = await supabase
    .from("deck_cards")
    .select("*")
    .eq("deck_id", id)
    .order("board", { ascending: true })
    .order("name", { ascending: true });

  if (cardsError) return failure(cardsError);

  const owner = data.owner as
    | { username?: string; display_name?: string | null }
    | { username?: string; display_name?: string | null }[]
    | null;
  const ownerRow = Array.isArray(owner) ? owner[0] : owner;
  const username = ownerRow?.username ?? "hráč";

  return {
    status: "ok",
    data: {
      id: data.id as string,
      ownerId: data.owner_id as string,
      name: data.name as string,
      format: data.format as DeckFormat,
      description: (data.description as string | null) ?? null,
      commanderName: data.commander_name as string,
      commanderScryfallId: (data.commander_scryfall_id as string | null) ?? null,
      partnerName: (data.partner_name as string | null) ?? null,
      partnerScryfallId: (data.partner_scryfall_id as string | null) ?? null,
      colorIdentity: (data.color_identity as string[]) ?? [],
      isPublic: Boolean(data.is_public),
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
      ownerUsername: username,
      ownerDisplayName: publicName(username, ownerRow?.display_name),
      cards: (cards ?? []).map((row) => mapCard(row as Record<string, unknown>)),
    },
  };
}
