import Link from "next/link";
import DataNotice from "@/components/DataNotice";
import EventKindIcon from "@/components/events/EventKindIcon";
import { BRAND_NAME } from "@/lib/brand";
import { eventTypeStyle } from "@/lib/brand";
import {
  getArticles,
  getUpcomingEvents,
  type FeedPost,
  type HubEvent,
} from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { cn, formatEventDate, formatRelativePrague } from "@/lib/utils";

export default async function HomeDashboard() {
  const [articlesResult, eventsResult, user] = await Promise.all([
    getArticles(),
    getUpcomingEvents(),
    getCurrentUser(),
  ]);

  const articles =
    articlesResult.status === "ok" ? articlesResult.data.slice(0, 5) : [];
  const events =
    eventsResult.status === "ok" ? eventsResult.data.slice(0, 6) : [];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-primary">{BRAND_NAME}</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Komunita Commander hráčů
        </h1>
        <p className="mt-3 text-base leading-relaxed text-foreground/60">
          Články, eventy a stoly na jednom místě — od casual podů po cEDH.
        </p>
      </header>

      {(articlesResult.status === "error" || eventsResult.status === "error") && (
        <div className="mb-6 space-y-2">
          {articlesResult.status === "error" ? (
            <DataNotice message={articlesResult.message} />
          ) : null}
          {eventsResult.status === "error" ? (
            <DataNotice message={eventsResult.message} />
          ) : null}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
        <section aria-labelledby="dash-articles">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="dash-articles" className="font-display text-2xl font-semibold">
              Články
            </h2>
            <Link href="/articles" className="text-sm text-primary hover:underline">
              Všechny
            </Link>
          </div>
          {articles.length === 0 ? (
            <p className="border-t border-white/10 pt-4 text-sm text-foreground/55">
              Zatím žádné články.{" "}
              <Link href="/articles" className="text-primary hover:underline">
                Podívej se na přehled
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-white/10 border-t border-white/10">
              {articles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="dash-events">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="dash-events" className="font-display text-2xl font-semibold">
              Eventy
            </h2>
            <Link href="/events" className="text-sm text-primary hover:underline">
              Kalendář
            </Link>
          </div>
          {events.length === 0 ? (
            <p className="border-t border-white/10 pt-4 text-sm text-foreground/55">
              Žádné nadcházející eventy.{" "}
              <Link href="/events" className="text-primary hover:underline">
                Otevři kalendář
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-white/10 border-t border-white/10">
              {events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section
        aria-labelledby="dash-community"
        className="mt-14 border-t border-white/10 pt-10"
      >
        <h2 id="dash-community" className="font-display text-2xl font-semibold">
          O komunitě
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
          {BRAND_NAME} spojuje hráče EDH a cEDH v Česku: sdílíme decky, tipy a termíny stolů.
          Veřejně si prohlédneš články a kalendář. Po přihlášení odemkneš zbytek.
        </p>

        <ul className="mt-6 grid gap-3 text-sm text-foreground/75 sm:grid-cols-2">
          <li className="border-l-2 border-primary/50 pl-3">
            <span className="font-medium text-foreground">Feed</span> — příspěvky a diskuze z komunity
          </li>
          <li className="border-l-2 border-accent/50 pl-3">
            <span className="font-medium text-foreground">Profil</span> — avatar, bio, Moxfield odkaz
          </li>
          <li className="border-l-2 border-primary/50 pl-3">
            <span className="font-medium text-foreground">Eventy</span> — vytvoř termín a RSVP ke stolům
          </li>
          <li className="border-l-2 border-accent/50 pl-3">
            <span className="font-medium text-foreground">Decky</span> — seznam decků na tvém profilu
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <>
              <Link
                href="/feed"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                Otevřít Feed
              </Link>
              {user.username ? (
                <Link
                  href={`/profile/${user.username}`}
                  className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-foreground/85 hover:bg-white/5"
                >
                  Můj profil
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                Registrace
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-foreground/85 hover:bg-white/5"
              >
                Přihlásit se
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ArticleRow({ article }: { article: FeedPost }) {
  return (
    <li>
      <Link href={`/articles/${article.id}`} className="group block py-4">
        <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary">
          {article.title}
        </h3>
        {article.excerpt ? (
          <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{article.excerpt}</p>
        ) : null}
        <p className="mt-2 text-xs text-foreground/40">
          {article.author} · {formatRelativePrague(article.createdAt)}
        </p>
      </Link>
    </li>
  );
}

function EventRow({ event }: { event: HubEvent }) {
  const style = eventTypeStyle(event.eventType);
  return (
    <li>
      <Link href={`/events/${event.id}`} className="group flex items-start gap-3 py-4">
        <EventKindIcon eventType={event.eventType} className="mt-0.5 h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium group-hover:text-primary">{event.title}</h3>
            <span className={cn("rounded px-1.5 py-0.5 text-[10px]", style.chip)}>{style.label}</span>
          </div>
          <p className="mt-1 text-xs text-foreground/45">
            {formatEventDate(event.startsAt)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}
