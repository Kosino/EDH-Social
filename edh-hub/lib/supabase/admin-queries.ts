import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type AdminCounts = {
  profiles: number;
  posts: number;
  articles: number;
  decks: number;
  events: number;
  rsvps: number;
};

export type AdminProfileRow = {
  id: string;
  username: string;
  displayName: string | null;
  moxfieldUserUrl: string | null;
  createdAt: string;
};

export type AdminContentRow = {
  id: string;
  title: string;
  kind: string;
  createdAt: string;
  authorUsername: string | null;
};

export type AdminEventRow = {
  id: string;
  title: string;
  eventType: string;
  startsAt: string;
  location: string | null;
};

export type AdminDeckRow = {
  id: string;
  name: string;
  commander: string;
  format: string;
  ownerUsername: string | null;
  createdAt: string;
};

export type AdminOverview = {
  counts: AdminCounts;
  recentProfiles: AdminProfileRow[];
  recentPosts: AdminContentRow[];
  upcomingEvents: AdminEventRow[];
  recentDecks: AdminDeckRow[];
};

async function countExact(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  filter?: { column: string; value: string }
): Promise<number> {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.column, filter.value);
  const { count, error } = await q;
  if (error) {
    console.error(`Admin count ${table} failed`, error.code, error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getAdminOverview(): Promise<AdminOverview | null> {
  if (!getSupabaseEnv()) return null;

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [profiles, posts, articles, decks, events, rsvps] = await Promise.all([
    countExact(supabase, "profiles"),
    countExact(supabase, "posts", { column: "kind", value: "post" }),
    countExact(supabase, "posts", { column: "kind", value: "article" }),
    countExact(supabase, "decks"),
    countExact(supabase, "events"),
    countExact(supabase, "event_rsvps"),
  ]);

  const [profilesRes, postsRes, eventsRes, decksRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, moxfield_user_url, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("posts")
      .select("id, title, kind, created_at, author:profiles!posts_author_id_fkey(username)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("events")
      .select("id, title, event_type, starts_at, location")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(6),
    supabase
      .from("decks")
      .select(
        "id, name, commander, format, created_at, owner:profiles!decks_owner_id_fkey(username)"
      )
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const recentProfiles: AdminProfileRow[] = (profilesRes.data ?? []).map((row) => ({
    id: row.id as string,
    username: row.username as string,
    displayName: (row.display_name as string | null) ?? null,
    moxfieldUserUrl: (row.moxfield_user_url as string | null) ?? null,
    createdAt: row.created_at as string,
  }));

  const recentPosts: AdminContentRow[] = (postsRes.data ?? []).map((row) => {
    const author = row.author as { username?: string } | { username?: string }[] | null;
    const authorUsername = Array.isArray(author)
      ? author[0]?.username ?? null
      : author?.username ?? null;
    return {
      id: row.id as string,
      title: row.title as string,
      kind: row.kind as string,
      createdAt: row.created_at as string,
      authorUsername,
    };
  });

  const upcomingEvents: AdminEventRow[] = (eventsRes.data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    eventType: row.event_type as string,
    startsAt: row.starts_at as string,
    location: (row.location as string | null) ?? null,
  }));

  const recentDecks: AdminDeckRow[] = (decksRes.data ?? []).map((row) => {
    const owner = row.owner as { username?: string } | { username?: string }[] | null;
    const ownerUsername = Array.isArray(owner)
      ? owner[0]?.username ?? null
      : owner?.username ?? null;
    return {
      id: row.id as string,
      name: row.name as string,
      commander: row.commander as string,
      format: row.format as string,
      ownerUsername,
      createdAt: row.created_at as string,
    };
  });

  return {
    counts: { profiles, posts, articles, decks, events, rsvps },
    recentProfiles,
    recentPosts,
    upcomingEvents,
    recentDecks,
  };
}
