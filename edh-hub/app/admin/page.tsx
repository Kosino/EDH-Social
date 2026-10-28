import Link from "next/link";
import { requireSuperuser } from "@/lib/require-superuser";
import { BRAND_NAME, eventTypeStyle } from "@/lib/brand";
import { getAdminOverview } from "@/lib/supabase/admin-queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { cn, formatEventDate, formatRelativePrague } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const user = await requireSuperuser();
  const overview = await getAdminOverview();
  const envOk = Boolean(getSupabaseEnv());

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Přehled {BRAND_NAME}
          </h1>
          <p className="mt-2 text-sm text-foreground/55">
            Přihlášen jako @{user.username} · jen pro tebe
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickLink href="/articles/new" label="Nový článek" />
          <QuickLink href="/events/new" label="Nový event" />
          <QuickLink href="/posts/new" label="Nový post" />
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Uživatelé" value={overview?.counts.profiles ?? "—"} href={null} />
        <Stat label="Posty" value={overview?.counts.posts ?? "—"} href="/feed" />
        <Stat label="Články" value={overview?.counts.articles ?? "—"} href="/articles" />
        <Stat label="Eventy" value={overview?.counts.events ?? "—"} href="/events" />
        <Stat label="Decky" value={overview?.counts.decks ?? "—"} href={null} />
        <Stat label="RSVP" value={overview?.counts.rsvps ?? "—"} href={null} />
      </section>

      <section className="mb-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
        <p className="text-foreground/70">
          Supabase:{" "}
          <span className={envOk ? "text-casual" : "text-red-400"}>
            {envOk ? "napojené" : "chybí env"}
          </span>
          {" · "}
          Data:{" "}
          <span className={overview ? "text-casual" : "text-accent"}>
            {overview ? "načtená" : "nedostupná / offline"}
          </span>
        </p>
      </section>

      {!overview ? (
        <p className="text-sm text-foreground/60">
          Bez databáze nejde načíst živá data. Zkontroluj Vercel env a migrace.
        </p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <Panel title="Nedávní uživatelé">
            {overview.recentProfiles.length === 0 ? (
              <Empty />
            ) : (
              <ul className="divide-y divide-white/10">
                {overview.recentProfiles.map((profile) => (
                  <li key={profile.id}>
                    <Link
                      href={`/profile/${profile.username}`}
                      className="flex items-center justify-between gap-3 py-3 hover:text-primary"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {profile.displayName || profile.username}
                        </span>
                        <span className="text-xs text-foreground/45">@{profile.username}</span>
                      </span>
                      <span className="shrink-0 text-xs text-foreground/40">
                        {formatRelativePrague(profile.createdAt)}
                        {profile.moxfieldUserUrl ? " · Moxfield" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Nedávný obsah">
            {overview.recentPosts.length === 0 ? (
              <Empty />
            ) : (
              <ul className="divide-y divide-white/10">
                {overview.recentPosts.map((post) => {
                  const href =
                    post.kind === "article" ? `/articles/${post.id}` : `/posts/${post.id}`;
                  return (
                    <li key={post.id}>
                      <Link
                        href={href}
                        className="flex items-start justify-between gap-3 py-3 hover:text-primary"
                      >
                        <span className="min-w-0">
                          <span className="mb-1 inline-block rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground/50">
                            {post.kind === "article" ? "článek" : "post"}
                          </span>
                          <span className="block truncate font-medium">{post.title}</span>
                          <span className="text-xs text-foreground/45">
                            {post.authorUsername ? `@${post.authorUsername}` : "—"}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-foreground/40">
                          {formatRelativePrague(post.createdAt)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Nadcházející eventy">
            {overview.upcomingEvents.length === 0 ? (
              <Empty />
            ) : (
              <ul className="divide-y divide-white/10">
                {overview.upcomingEvents.map((event) => {
                  const style = eventTypeStyle(event.eventType);
                  return (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.id}`}
                        className="flex items-start justify-between gap-3 py-3 hover:text-primary"
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{event.title}</span>
                            <span className={cn("rounded px-1.5 py-0.5 text-[10px]", style.chip)}>
                              {style.label}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs text-foreground/45">
                            {formatEventDate(event.startsAt)}
                            {event.location ? ` · ${event.location}` : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Nedávné decky">
            {overview.recentDecks.length === 0 ? (
              <Empty />
            ) : (
              <ul className="divide-y divide-white/10">
                {overview.recentDecks.map((deck) => (
                  <li key={deck.id}>
                    <Link
                      href={`/decks/${deck.id}`}
                      className="flex items-start justify-between gap-3 py-3 hover:text-primary"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{deck.name}</span>
                        <span className="text-xs text-foreground/45">
                          {deck.commander} · {deck.format}
                          {deck.ownerUsername ? ` · @${deck.ownerUsername}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-foreground/40">
                        {formatRelativePrague(deck.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string | null;
}) {
  const inner = (
    <>
      <p className="text-xs uppercase tracking-wide text-foreground/45">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl border border-white/10 bg-card px-3 py-3 transition hover:border-primary/40"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-xl border border-white/10 bg-card px-3 py-3">{inner}</div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-card p-5">
      <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="py-4 text-sm text-foreground/50">Zatím nic.</p>;
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-white/15 px-3 py-2 text-sm text-foreground/85 transition hover:border-primary/40 hover:text-primary"
    >
      {label}
    </Link>
  );
}
