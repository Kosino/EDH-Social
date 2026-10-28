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
  authorId: string;
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

export type DeckView = ProfileDeck & {
  ownerId: string;
  ownerUsername: string;
  ownerDisplayName: string;
  createdAt: string;
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
  description: string | null;
  hostId: string | null;
  hostUsername: string | null;
  hostDisplayName: string | null;
};

export type EventAttendee = {
  username: string;
  displayName: string;
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
  if (error.message?.toLowerCase().includes("description")) {
    return {
      status: "error",
      message:
        "Chybí sloupec events.description. V Supabase SQL editoru spusť supabase/migrations/20261028150000_event_description.sql.",
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
  author_id: string;
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
    authorId: row.author_id,
    author: publicName(username),
    authorUsername: username,
    createdAt: row.created_at,
  };
}

const POST_SELECT =
  "id, title, excerpt, body, deck_name, kind, created_at, author_id, author:profiles!posts_author_id_fkey(username)";

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

/** Sanitize user query for PostgREST `ilike` filters. */
export function normalizeSearchQuery(raw: string | null | undefined) {
  if (!raw) return "";
  return raw
    .trim()
    .slice(0, 80)
    .replace(/[%_,.()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesSearchHaystack(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export function filterPostsByQuery(posts: FeedPost[], query: string) {
  const q = normalizeSearchQuery(query);
  if (!q) return posts;
  return posts.filter((post) =>
    matchesSearchHaystack(
      `${post.title} ${post.excerpt ?? ""} ${post.body ?? ""} ${post.deckName ?? ""} ${post.author}`,
      q
    )
  );
}

export function filterEventsByQuery(events: HubEvent[], query: string) {
  const q = normalizeSearchQuery(query);
  if (!q) return events;
  return events.filter((event) =>
    matchesSearchHaystack(
      `${event.title} ${event.location ?? ""} ${event.description ?? ""} ${event.eventType} ${event.hostUsername ?? ""}`,
      q
    )
  );
}

export async function searchPosts(
  kind: PostKind,
  query: string
): Promise<QueryResult<FeedPost[]>> {
  const q = normalizeSearchQuery(query);
  if (!q) return listPostsByKind(kind);
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const pattern = `"%${q}%"`;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("kind", kind)
    .or(`title.ilike.${pattern},excerpt.ilike.${pattern},body.ilike.${pattern},deck_name.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return failure(error);
  return { status: "ok", data: ((data ?? []) as PostRow[]).map(mapPost) };
}

export async function searchEvents(query: string): Promise<QueryResult<HubEvent[]>> {
  const q = normalizeSearchQuery(query);
  if (!q) return getUpcomingEvents();
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const pattern = `"%${q}%"`;
  const supabase = await createClient();
  const full = await supabase
    .from("events")
    .select(EVENT_SELECT_FULL)
    .or(`title.ilike.${pattern},location.ilike.${pattern},description.ilike.${pattern}`)
    .order("starts_at", { ascending: true })
    .limit(30);

  if (!full.error) {
    return { status: "ok", data: mapEvents((full.data ?? []) as EventRow[]) };
  }
  if (!isMissingDescriptionColumn(full.error)) return failure(full.error);

  const base = await supabase
    .from("events")
    .select(EVENT_SELECT_BASE)
    .or(`title.ilike.${pattern},location.ilike.${pattern}`)
    .order("starts_at", { ascending: true })
    .limit(30);

  if (base.error) return failure(base.error);
  return { status: "ok", data: mapEvents((base.data ?? []) as EventRow[]) };
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

export async function getDeck(id: string): Promise<QueryResult<DeckView | null>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks")
    .select(
      "id, name, format, commander, moxfield_url, created_at, owner_id, owner:profiles!decks_owner_id_fkey(username, display_name)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return failure(error);
  if (!data) return { status: "ok", data: null };

  const row = data as {
    id: string;
    name: string;
    format: string;
    commander: string;
    moxfield_url: string | null;
    created_at: string;
    owner_id: string;
    owner: { username: string; display_name: string | null } | { username: string; display_name: string | null }[] | null;
  };
  const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
  const ownerUsername = owner?.username ?? "hráč";

  return {
    status: "ok",
    data: {
      id: row.id,
      name: row.name,
      format: row.format,
      commander: row.commander,
      moxfieldUrl: row.moxfield_url,
      ownerId: row.owner_id,
      ownerUsername,
      ownerDisplayName: publicName(ownerUsername, owner?.display_name),
      createdAt: row.created_at,
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

type ProfileRef = { username: string; display_name: string | null } | { username: string; display_name: string | null }[] | null;

type EventRow = {
  id: string;
  title: string;
  event_type: string;
  starts_at: string;
  location: string | null;
  description?: string | null;
  host_id?: string | null;
  host?: ProfileRef;
};

const EVENT_SELECT_FULL =
  "id, title, event_type, starts_at, location, description, host_id, host:profiles!events_host_id_fkey(username, display_name)";
const EVENT_SELECT_BASE =
  "id, title, event_type, starts_at, location, host_id, host:profiles!events_host_id_fkey(username, display_name)";

function profileFrom(ref: ProfileRef): { username: string | null; displayName: string | null } {
  if (!ref) return { username: null, displayName: null };
  const row = Array.isArray(ref) ? ref[0] : ref;
  if (!row?.username) return { username: null, displayName: null };
  return {
    username: row.username,
    displayName: publicName(row.username, row.display_name),
  };
}

function mapEvent(row: EventRow): HubEvent {
  const host = profileFrom(row.host ?? null);
  return {
    id: row.id,
    title: row.title,
    eventType: row.event_type,
    startsAt: row.starts_at,
    location: row.location,
    description: row.description ?? null,
    hostId: row.host_id ?? null,
    hostUsername: host.username,
    hostDisplayName: host.displayName,
  };
}

function mapEvents(rows: EventRow[]): HubEvent[] {
  return rows.map(mapEvent);
}

function isMissingDescriptionColumn(error: PostgrestError) {
  return (
    error.code === "42703" ||
    Boolean(error.message?.toLowerCase().includes("description"))
  );
}

async function queryEventRows(
  build: (select: string) => PromiseLike<{ data: unknown; error: PostgrestError | null }>
): Promise<QueryResult<EventRow[]>> {
  const full = await build(EVENT_SELECT_FULL);
  if (!full.error) {
    const rows = full.data == null ? [] : Array.isArray(full.data) ? full.data : [full.data];
    return { status: "ok", data: rows as EventRow[] };
  }
  if (!isMissingDescriptionColumn(full.error)) return failure(full.error);

  const base = await build(EVENT_SELECT_BASE);
  if (base.error) return failure(base.error);
  const rows = base.data == null ? [] : Array.isArray(base.data) ? base.data : [base.data];
  return { status: "ok", data: rows as EventRow[] };
}

export async function getUpcomingEvents(): Promise<QueryResult<HubEvent[]>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const result = await queryEventRows((select) =>
    supabase
      .from("events")
      .select(select)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(20)
  );
  if (result.status !== "ok") return result;
  return { status: "ok", data: mapEvents(result.data) };
}

export async function getEventsInRange(startIso: string, endIso: string): Promise<QueryResult<HubEvent[]>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const result = await queryEventRows((select) =>
    supabase
      .from("events")
      .select(select)
      .gte("starts_at", startIso)
      .lt("starts_at", endIso)
      .order("starts_at", { ascending: true })
  );
  if (result.status !== "ok") return result;
  return { status: "ok", data: mapEvents(result.data) };
}

export async function getEvent(id: string): Promise<QueryResult<HubEvent | null>> {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const supabase = await createClient();
  const result = await queryEventRows((select) =>
    supabase.from("events").select(select).eq("id", id).maybeSingle()
  );
  if (result.status !== "ok") return result;
  const row = result.data[0];
  if (!row) return { status: "ok", data: null };
  return { status: "ok", data: mapEvent(row) };
}

export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  if (!getSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_rsvps")
    .select("created_at, profile:profiles!event_rsvps_user_id_fkey(username, display_name)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .limit(40);

  if (error) {
    console.error("Event attendees lookup failed", error.code, error.message);
    return [];
  }

  return ((data ?? []) as Array<{ profile: ProfileRef }>).flatMap((row) => {
    const host = profileFrom(row.profile);
    if (!host.username) return [];
    return [{ username: host.username, displayName: host.displayName ?? host.username }];
  });
}
