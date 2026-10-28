"use server";

import { redirect } from "next/navigation";
import { parseDeck, parseEvent, parsePost } from "@/lib/create/validate";
import { rsvpRedirectPath } from "@/lib/calendar";
import { safeNext } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

export type FormState = { error: string } | null;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function signedInUser(returnPath: string) {
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
  return "Uložení se nepovedlo. Zkus to znovu.";
}

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const kindHint = String(formData.get("kind") ?? "post") === "article" ? "article" : "post";
  const returnPath = kindHint === "article" ? "/articles/new" : "/posts/new";
  const auth = await signedInUser(returnPath);
  if (!auth.user) return { error: auth.error ?? "Nejdřív se přihlas." };

  const parsed = parsePost(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: auth.user.id,
      title: parsed.value.title,
      body: parsed.value.body,
      excerpt: parsed.value.excerpt,
      deck_name: parsed.value.deckName,
      kind: parsed.value.kind,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error("createPost", error?.code, error?.message);
    if (error?.message?.toLowerCase().includes("kind")) {
      return {
        error:
          "Chybí sloupec posts.kind. V Supabase SQL editoru spusť supabase/migrations/20261028120000_posts_kind.sql.",
      };
    }
    return { error: dbError(error?.message ?? "") };
  }

  redirect(parsed.value.kind === "article" ? `/articles/${data.id}` : `/posts/${data.id}`);
}

export async function createDeck(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await signedInUser("/decks/new");
  if (!auth.user) return { error: auth.error ?? "Nejdřív se přihlas." };

  const parsed = parseDeck(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("decks").insert({
    owner_id: auth.user.id,
    name: parsed.value.name,
    format: parsed.value.format,
    commander: parsed.value.commander,
    moxfield_url: parsed.value.moxfieldUrl,
  });

  if (error) {
    console.error("createDeck", error.code, error.message);
    return { error: dbError(error.message) };
  }

  redirect(`/profile/${auth.user.username}`);
}

export async function createEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await signedInUser("/events/new");
  if (!auth.user) return { error: auth.error ?? "Nejdřív se přihlas." };

  const parsed = parseEvent(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const baseRow = {
    host_id: auth.user.id,
    title: parsed.value.title,
    event_type: parsed.value.eventType,
    starts_at: parsed.value.startsAt,
    location: parsed.value.location,
  };
  let insert = await supabase
    .from("events")
    .insert({ ...baseRow, description: parsed.value.description })
    .select("id")
    .single();

  if (insert.error?.message?.toLowerCase().includes("description")) {
    insert = await supabase.from("events").insert(baseRow).select("id").single();
  }

  const { data, error } = insert;
  if (error || !data?.id) {
    console.error("createEvent", error?.code, error?.message);
    return { error: dbError(error?.message ?? "") };
  }

  const { error: rsvpError } = await supabase
    .from("event_rsvps")
    .insert({ event_id: data.id, user_id: auth.user.id });
  if (rsvpError) {
    console.error("createEvent host RSVP", rsvpError.code, rsvpError.message);
  }

  redirect(`/events/${data.id}`);
}

function eventsReturn(formData: FormData, error?: string) {
  const returnTo = formData.get("returnTo");
  if (typeof returnTo === "string" && returnTo.startsWith("/events")) {
    const url = new URL(returnTo, "http://local");
    if (error) url.searchParams.set("error", error);
    return `${url.pathname}${url.search}`;
  }
  const month = formData.get("month");
  const day = formData.get("day");
  return rsvpRedirectPath(
    typeof month === "string" ? month : undefined,
    typeof day === "string" ? day : undefined,
    error
  );
}

export async function toggleRsvp(formData: FormData) {
  const back = eventsReturn(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);

  const eventId = String(formData.get("eventId") ?? "");
  if (!UUID.test(eventId)) redirect(back);

  const supabase = await createClient();
  const { data: existing, error: lookupError } = await supabase
    .from("event_rsvps")
    .select("event_id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    console.error("toggleRsvp lookup", lookupError.code, lookupError.message);
    redirect(eventsReturn(formData, "Přihlášení k eventu se nepovedlo."));
  }

  if (existing) {
    const { error } = await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", user.id);
    if (error) redirect(eventsReturn(formData, "Odhlášení z eventu se nepovedlo."));
  } else {
    const { error } = await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id });
    if (error) redirect(eventsReturn(formData, "Přihlášení k eventu se nepovedlo."));
  }

  redirect(back);
}
