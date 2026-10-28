import { publicName } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type QueryResult<T> =
  | { status: "unconfigured" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

export type PostKind = "post" | "article";

export type FeedPost = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  deckName: string | null;
  kind: PostKind;
  author: string;
  authorUsername: string;
  createdAt: string;
};

export type ProfileDeck = {
  id: string;
  name: string;
  format: string;
  commander: string;
  moxfieldUrl: string | null;
};

export type ProfileView = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  decks: ProfileDeck[];
};

export type HubEvent = {
  id: string;
  title: string;
  eventType: string;
  startsAt: string;
  location: string | null;
};

const MIGRATION_MESSAGE =
  "Tabulky ještě neexistují. V Supabase SQL editoru spusť supabase/migrations/20261028100000_init.sql a 20261028120000_posts_kind.sql.";

type PostgrestError = { code?: string; message?: string };

function isMissingTable(error: PostgrestError) {
  return error.code === "PGRST205" || error.code === "42P01";
}

function isMissingKindColumn(error: PostgrestError) {
  return (
    error.code === "42703" ||
    Boolean(error.message?.toLowerCase().includes("kind"))
  );
}

function failure(error: PostgrestError): QueryResult<never> {
  if (isMissingTable(error)) {
    return { status: "error", message: MIGRATION_MESSAGE };
  }
  if (isMissingKindColumn(error)) {
    return {
      status: "error",
      message:
        "Chybí sloupec posts.kind. V Supabase SQL editoru spusť supabase/migrations/20261028120000_posts_kind.sql.",
    };
  }
  console.error("Supabase query failed", error.code, error.message);
  return { status: "error", message: "Data ze Supabase se nepodařilo načíst." };
}

function usernameFrom(author: { username: string } | { username: string }[] | null): string {
  if (!author) return "hráč";
  if (Array.isArray(author)) return author[0]?.username ?? "hráč";
  return author.username;
}

type PostRow = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  deck_name: string | null;
  kind?: string | null;
  created_at: string;
  author: { username: string } | { username: string }[] | null;
};

function mapPost(row: PostRow): FeedPost {
  const username = usernameFrom(row.author);
  const kind: PostKind = row.kind === "article" ? "article" : "post";
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    deckName: row.deck_name,
    kind,
    author: publicName(username),
    authorUsername: username,
    createdAt: row.created_at,
  };
}

const POST_SELECT =
  "id, title, excerpt, body, deck_name, kind, created_at, author:profiles!posts_author_id_fkey(username)";

async function listPostsByKind(kind: PostKind): Promise<QueryResult<FeedPost[]>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("kind", kind)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return failure(error);

  return {
    status: "ok",
    data: ((data ?? []) as PostRow[]).map(mapPost),
  };
}

export async function getFeedPosts(): Promise<QueryResult<FeedPost[]>> {
  return listPostsByKind("post");
}

export async function getArticles(): Promise<QueryResult<FeedPost[]>> {
  return listPostsByKind("article");
}

export async function getPost(id: string): Promise<QueryResult<FeedPost | null>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();

  if (error) return failure(error);
  if (!data) return { status: "ok", data: null };

  return { status: "ok", data: mapPost(data as PostRow) };
}

export async function getProfile(username: string): Promise<QueryResult<ProfileView | null>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, decks(id, name, format, commander, moxfield_url, created_at)")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) return failure(error);
  if (!data) return { status: "ok", data: null };

  const row = data as {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    decks:
      | Array<{
          id: string;
          name: string;
          format: string;
          commander: string;
          moxfield_url: string | null;
          created_at: string;
        }>
      | null;
  };

  const decks = [...(row.decks ?? [])].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return {
    status: "ok",
    data: {
      id: row.id,
      username: row.username,
      displayName: publicName(row.username, row.display_name),
      bio: row.bio,
      decks: decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        format: deck.format,
        commander: deck.commander,
        moxfieldUrl: deck.moxfield_url,
      })),
    },
  };
}

export async function getMyRsvpEventIds(userId: string): Promise<string[]> {
  if (!getSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("event_rsvps").select("event_id").eq("user_id", userId);
  if (error) {
    console.error("RSVP lookup failed", error.code, error.message);
    return [];
  }
  return ((data ?? []) as Array<{ event_id: string }>).map((row) => row.event_id);
}

export async function getRsvpCount(userId: string): Promise<number> {
  if (!getSupabaseEnv()) return 0;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("event_rsvps")
    .select("event_id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) {
    console.error("RSVP count failed", error.code, error.message);
    return 0;
  }
  return count ?? 0;
}

type EventRow = {
  id: string;
  title: string;
  event_type: string;
  starts_at: string;
  location: string | null;
};

function mapEvents(rows: EventRow[]): HubEvent[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    eventType: row.event_type,
    startsAt: row.starts_at,
    location: row.location,
  }));
}

export async function getUpcomingEvents(): Promise<QueryResult<HubEvent[]>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, event_type, starts_at, location")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(20);

  if (error) return failure(error);
  return { status: "ok", data: mapEvents((data ?? []) as EventRow[]) };
}

export async function getEventsInRange(startIso: string, endIso: string): Promise<QueryResult<HubEvent[]>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, event_type, starts_at, location")
    .gte("starts_at", startIso)
    .lt("starts_at", endIso)
    .order("starts_at", { ascending: true });

  if (error) return failure(error);
  return { status: "ok", data: mapEvents((data ?? []) as EventRow[]) };
}
