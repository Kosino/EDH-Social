"use server";

import { redirect } from "next/navigation";
import { parseDeck, parseEvent, parsePost } from "@/lib/create/validate";
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
  const auth = await signedInUser("/posts/new");
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
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error("createPost", error?.code, error?.message);
    return { error: dbError(error?.message ?? "") };
  }

  redirect(`/posts/${data.id}`);
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
  const { error } = await supabase.from("events").insert({
    host_id: auth.user.id,
    title: parsed.value.title,
    event_type: parsed.value.eventType,
    starts_at: parsed.value.startsAt,
    location: parsed.value.location,
  });

  if (error) {
    console.error("createEvent", error.code, error.message);
    return { error: dbError(error.message) };
  }

  redirect("/events");
}

export async function toggleRsvp(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/events");

  const eventId = String(formData.get("eventId") ?? "");
  if (!UUID.test(eventId)) redirect("/events");

  const supabase = await createClient();
  const { data: existing, error: lookupError } = await supabase
    .from("event_rsvps")
    .select("event_id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    console.error("toggleRsvp lookup", lookupError.code, lookupError.message);
    redirect("/events?error=" + encodeURIComponent("Přihlášení k eventu se nepovedlo."));
  }

  if (existing) {
    const { error } = await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", user.id);
    if (error) redirect("/events?error=" + encodeURIComponent("Odhlášení z eventu se nepovedlo."));
  } else {
    const { error } = await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id });
    if (error) redirect("/events?error=" + encodeURIComponent("Přihlášení k eventu se nepovedlo."));
  }

  redirect("/events");
}
