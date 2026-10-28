import Link from "next/link";
import { redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import EventKindIcon from "@/components/events/EventKindIcon";
import MonthCalendar, { type DayMarker } from "@/components/events/MonthCalendar";
import SearchBar from "@/components/SearchBar";
import { toggleRsvp } from "@/app/create/actions";
import { eventTypeStyle } from "@/lib/brand";
import { eventsPath, formatDayLabel, pragueDateKey, pragueMonthRange, resolveCalendarQuery } from "@/lib/calendar";
import { EVENT_KINDS } from "@/lib/events";
import {
  filterEventsByQuery,
  getEventsInRange,
  getMyRsvpEventIds,
  getUpcomingEvents,
  normalizeSearchQuery,
  searchEvents,
  type HubEvent,
  type QueryResult,
} from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { cn, formatEventDate, pragueLocalToUtc } from "@/lib/utils";

export const dynamic = "force-dynamic";

function sampleEventsAround(now = new Date()): HubEvent[] {
  const today = pragueDateKey(now);
  if (!today) return [];
  const [y, m, d] = today.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dayOffset = (offset: number) => {
    const base = new Date(Date.UTC(y, m - 1, d + offset));
    return `${base.getUTCFullYear()}-${pad(base.getUTCMonth() + 1)}-${pad(base.getUTCDate())}`;
  };
  const at = (key: string, hour: string) => {
    const instant = pragueLocalToUtc(`${key}T${hour}`);
    return instant?.toISOString() ?? `${key}T${hour}:00.000Z`;
  };

  const sample = (
    partial: Omit<HubEvent, "description" | "hostId" | "hostUsername" | "hostDisplayName" | "location"> & {
      location?: string | null;
      description?: string | null;
      hostId?: string | null;
      hostUsername?: string | null;
      hostDisplayName?: string | null;
    }
  ): HubEvent => ({
    location: null,
    description: null,
    hostId: null,
    hostUsername: "kosino",
    hostDisplayName: "Kosino",
    ...partial,
  });

  return [
    sample({
      id: "sample-1",
      startsAt: at(dayOffset(0), "18:00"),
      title: "cEDH Tournament",
      eventType: "cEDH Tournament",
      location: "Most",
      description: "70-player Swiss + Top Cut",
    }),
    sample({
      id: "sample-2",
      startsAt: at(dayOffset(1), "19:00"),
      title: "Casual Pod",
      eventType: "Casual Pod",
      location: "Bílina",
      description: "Precons welcome · 4 players",
      hostUsername: "elf_brewer",
      hostDisplayName: "Elf_Brewer",
    }),
    sample({
      id: "sample-3",
      startsAt: at(dayOffset(2), "19:30"),
      title: "Friday Night Magic",
      eventType: "Friday Night Magic",
      location: "Praha",
      description: "Relaxed pods · prizes for fun",
    }),
    sample({
      id: "sample-4",
      startsAt: at(dayOffset(3), "17:00"),
      title: "EDH Tournament",
      eventType: "EDH Tournament",
      location: "Most",
      description: "Store champs",
    }),
    sample({
      id: "sample-5",
      startsAt: at(dayOffset(5), "20:00"),
      title: "Casual Pod",
      eventType: "Casual Pod",
      location: "Discord",
      description: "Online pod · camera optional",
    }),
    sample({
      id: "sample-6",
      startsAt: at(dayOffset(7), "18:00"),
      title: "cEDH Tournament",
      eventType: "cEDH Tournament",
      location: "Online",
      description: "Top Cut · MTGO",
    }),
  ];
}

function textParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function noticesFor(results: Array<QueryResult<unknown>>, error?: string) {
  const notices: string[] = [];
  for (const result of results) {
    if (result.status === "error" && !notices.includes(result.message)) notices.push(result.message);
  }
  if (error && !notices.includes(error)) notices.push(error);
  return notices;
}

function dateBlock(iso: string) {
  const parts = new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    month: "short",
    day: "numeric",
    weekday: "short",
  }).formatToParts(new Date(iso));
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    month: read("month").replace(".", "").toUpperCase(),
    day: read("day"),
    weekday: read("weekday").replace(".", "").toUpperCase(),
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    month?: string | string[];
    day?: string | string[];
    q?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const monthParam = textParam(params.month);
  const dayParam = textParam(params.day);
  const errorParam = textParam(params.error);
  const q = normalizeSearchQuery(textParam(params.q));
  const view = resolveCalendarQuery(monthParam, dayParam);

  if ((monthParam && monthParam !== view.month.key) || (dayParam && dayParam !== view.day)) {
    redirect(eventsPath({ month: view.month.key, day: view.day, error: errorParam, q }));
  }

  const range = pragueMonthRange(view.month);
  const [upcomingResult, monthResult, searchResult] = await Promise.all([
    getUpcomingEvents(),
    range
      ? getEventsInRange(range.start.toISOString(), range.end.toISOString())
      : Promise.resolve({ status: "error" as const, message: "Kalendář se nepodařilo sestavit." }),
    q ? searchEvents(q) : Promise.resolve({ status: "ok" as const, data: [] as HubEvent[] }),
  ]);

  const samples = sampleEventsAround();
  const offline = upcomingResult.status !== "ok" && monthResult.status !== "ok";
  const sampleMonth = samples.filter((event) => pragueDateKey(event.startsAt).startsWith(view.month.key));
  const monthEventsRaw = monthResult.status === "ok" ? monthResult.data : offline ? sampleMonth : [];
  const monthEvents = q ? filterEventsByQuery(monthEventsRaw, q) : monthEventsRaw;
  const dayPool = monthResult.status === "ok" ? monthResult.data : offline ? samples : [];
  const selectedEvents = view.day
    ? dayPool.filter((event) => pragueDateKey(event.startsAt) === view.day).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    : [];
  const upcomingEvents = upcomingResult.status === "ok" ? upcomingResult.data : offline ? samples : [];
  const searchHits =
    searchResult.status === "ok"
      ? searchResult.data
      : offline
        ? filterEventsByQuery(samples, q)
        : [];
  const listed = q
    ? view.day
      ? filterEventsByQuery(selectedEvents, q)
      : searchHits
    : view.day
      ? selectedEvents
      : upcomingEvents;
  const listIsLive = q
    ? searchResult.status === "ok" || (Boolean(view.day) && monthResult.status === "ok")
    : view.day
      ? monthResult.status === "ok"
      : upcomingResult.status === "ok";
  const user = listIsLive ? await getCurrentUser() : null;
  const joined = new Set(user ? await getMyRsvpEventIds(user.id) : []);
  const returnTo = eventsPath({ month: view.month.key, day: view.day, q });
  const markers: Record<string, DayMarker[]> = {};
  for (const event of monthEvents) {
    const key = pragueDateKey(event.startsAt);
    if (!markers[key]) markers[key] = [];
    markers[key].push({
      title: event.title,
      eventType: event.eventType,
      location: event.location,
    });
  }
  const monthHasEvents = monthEvents.length > 0;

  const listTitle = q
    ? `Hledání „${q}“`
    : view.day
      ? formatDayLabel(view.day)
      : "Nadcházející";

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Kalendář eventů</h1>
          <p className="mt-1 text-foreground/60">
            cEDH, EDH turnaje, FNM a casual pody · časy v Europe/Prague
          </p>
        </div>
        <Link
          href="/events/new"
          className="shrink-0 rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/10"
        >
          + Vytvořit event
        </Link>
      </div>

      <div className="mb-6">
        <SearchBar
          action="/events"
          defaultValue={q}
          placeholder="Hledat eventy…"
          preserve={{ month: view.month.key, ...(view.day ? { day: view.day } : {}) }}
        />
        {q ? (
          <p className="mt-2 text-xs text-foreground/50">
            Filtr aktivní ·{" "}
            <Link href={eventsPath({ month: view.month.key, day: view.day })} className="text-primary hover:underline">
              Zrušit hledání
            </Link>
          </p>
        ) : null}
      </div>

      <MonthCalendar
        month={view.month}
        selectedDay={view.day}
        todayKey={pragueDateKey(new Date())}
        markers={markers}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/55">
        <div className="flex flex-wrap gap-3">
          {EVENT_KINDS.map((kind) => (
            <LegendKind key={kind} eventType={kind} />
          ))}
        </div>
        <p>Všechny časy jsou v Europe/Prague</p>
      </div>

      {!monthHasEvents && listIsLive && !q ? (
        <p className="mb-6 text-sm text-foreground/50">
          V tomto měsíci zatím nejsou žádné eventy.{" "}
          <Link href="/events/new" className="text-primary hover:underline">
            Přidej první
          </Link>
          .
        </p>
      ) : null}

      {noticesFor([upcomingResult, monthResult, searchResult], errorParam).map((message) => (
        <DataNotice key={message} message={message} />
      ))}
      {offline && upcomingResult.status === "unconfigured" ? (
        <DataNotice message="Supabase ještě není nastavené. Níže je náhled kalendáře." />
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold">{listTitle}</h2>
        {view.day ? (
          <Link
            href={eventsPath({ month: view.month.key, q })}
            className="shrink-0 text-sm text-primary hover:underline"
          >
            Zrušit výběr dne
          </Link>
        ) : null}
      </div>

      {listed.length === 0 ? (
        q ? (
          <p className="rounded-xl border border-white/10 bg-card p-5 text-sm text-foreground/60">
            Pro „{q}“ žádný event.
          </p>
        ) : view.day ? (
          <p className="rounded-xl border border-white/10 bg-card p-5 text-sm text-foreground/60">
            V tento den není žádný event.{" "}
            <Link href="/events/new" className="text-primary hover:underline">
              Vytvoř event
            </Link>
            .
          </p>
        ) : (
          <p className="rounded-xl border border-white/10 bg-card p-5 text-sm text-foreground/60">
            Žádné nadcházející eventy.{" "}
            <Link href="/events/new" className="text-primary hover:underline">
              Vytvoř první
            </Link>
            .
          </p>
        )
      ) : (
        <div className="space-y-3" data-testid="event-list">
          {listed.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              joined={joined.has(event.id)}
              signedIn={Boolean(user)}
              live={listIsLive}
              returnTo={returnTo}
              monthKey={view.month.key}
              dayKey={view.day}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LegendKind({ eventType }: { eventType: string }) {
  const style = eventTypeStyle(eventType);
  return (
    <span className="inline-flex items-center gap-2">
      <EventKindIcon eventType={eventType} className="h-5 w-5 rounded-md" />
      <span className={cn("h-2 w-2 rounded-full", style.dot)} aria-hidden />
      {style.label}
    </span>
  );
}

function EventItem({
  event,
  joined,
  signedIn,
  live,
  returnTo,
  monthKey,
  dayKey,
}: {
  event: HubEvent;
  joined: boolean;
  signedIn: boolean;
  live: boolean;
  returnTo: string;
  monthKey: string;
  dayKey: string | null;
}) {
  const style = eventTypeStyle(event.eventType);
  const block = dateBlock(event.startsAt);

  const detailHref = live ? `/events/${event.id}` : null;

  return (
    <div className="animate-fade-rise flex items-center gap-3 rounded-xl border border-white/10 bg-card p-4 sm:gap-4">
      <div className="w-14 shrink-0 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/45">{block.month}</p>
        <p className="font-display text-2xl font-bold leading-none">{block.day}</p>
        <p className="mt-0.5 text-[10px] uppercase text-foreground/45">{block.weekday}</p>
      </div>
      {detailHref ? (
        <Link href={detailHref} className="shrink-0">
          <EventKindIcon eventType={event.eventType} className="h-12 w-12 rounded-xl sm:h-14 sm:w-14" />
        </Link>
      ) : (
        <EventKindIcon eventType={event.eventType} className="h-12 w-12 rounded-xl sm:h-14 sm:w-14" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {detailHref ? (
            <Link href={detailHref} className="font-medium hover:text-primary">
              {event.title}
            </Link>
          ) : (
            <h3 className="font-medium">{event.title}</h3>
          )}
          <span className={cn("rounded px-2 py-0.5 text-xs", style.chip)}>{style.label}</span>
          {joined ? (
            <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">Jdeš</span>
          ) : null}
        </div>
        {event.description ? (
          <p className="mt-1 text-sm text-foreground/60">{event.description}</p>
        ) : event.location ? (
          <p className="mt-1 text-sm text-foreground/60">{event.location}</p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/45">
          <span>{formatEventDate(event.startsAt)} · Europe/Prague</span>
          {event.hostUsername ? (
            <Link href={`/profile/${event.hostUsername}`} className="hover:text-primary">
              @{event.hostUsername}
            </Link>
          ) : null}
        </div>
      </div>
      {live && signedIn ? (
        <form action={toggleRsvp} className="shrink-0">
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="month" value={monthKey} />
          {dayKey ? <input type="hidden" name="day" value={dayKey} /> : null}
          <button className={cn("rounded-lg border px-4 py-1.5 text-sm", style.border)}>
            {joined ? "Odhlásit" : "Přidat se"}
          </button>
        </form>
      ) : (
        <Link
          href={`/login?next=${encodeURIComponent(returnTo)}`}
          className={cn("shrink-0 rounded-lg border px-4 py-1.5 text-sm", style.border)}
        >
          Přidat se
        </Link>
      )}
    </div>
  );
}
