import Link from "next/link";
import { redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import MonthCalendar, { type DayMarker } from "@/components/events/MonthCalendar";
import { toggleRsvp } from "@/app/create/actions";
import { eventTypeStyle } from "@/lib/brand";
import { eventsPath, formatDayLabel, pragueDateKey, pragueMonthRange, resolveCalendarQuery } from "@/lib/calendar";
import { getEventsInRange, getMyRsvpEventIds, getUpcomingEvents, type HubEvent, type QueryResult } from "@/lib/supabase/queries";
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

  return [
    {
      id: "sample-1",
      startsAt: at(dayOffset(2), "18:00"),
      title: "cEDH Tournament",
      eventType: "Competitive",
      location: "Most",
    },
    {
      id: "sample-2",
      startsAt: at(dayOffset(4), "19:00"),
      title: "Friday Night EDH",
      eventType: "Casual",
      location: "Bílina",
    },
    {
      id: "sample-3",
      startsAt: at(dayOffset(9), "20:00"),
      title: "Online Casual Pod",
      eventType: "Online",
      location: "Discord",
    },
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
  searchParams: Promise<{ error?: string | string[]; month?: string | string[]; day?: string | string[] }>;
}) {
  const params = await searchParams;
  const monthParam = textParam(params.month);
  const dayParam = textParam(params.day);
  const errorParam = textParam(params.error);
  const view = resolveCalendarQuery(monthParam, dayParam);

  if ((monthParam && monthParam !== view.month.key) || (dayParam && dayParam !== view.day)) {
    redirect(eventsPath({ month: view.month.key, day: view.day, error: errorParam }));
  }

  const range = pragueMonthRange(view.month);
  const [upcomingResult, monthResult] = await Promise.all([
    getUpcomingEvents(),
    range
      ? getEventsInRange(range.start.toISOString(), range.end.toISOString())
      : Promise.resolve({ status: "error" as const, message: "Kalendář se nepodařilo sestavit." }),
  ]);

  const samples = sampleEventsAround();
  const offline = upcomingResult.status !== "ok" && monthResult.status !== "ok";
  const sampleMonth = samples.filter((event) => pragueDateKey(event.startsAt).startsWith(view.month.key));
  const monthEvents = monthResult.status === "ok" ? monthResult.data : offline ? sampleMonth : [];
  const dayPool = monthResult.status === "ok" ? monthResult.data : offline ? samples : [];
  const selectedEvents = view.day
    ? dayPool.filter((event) => pragueDateKey(event.startsAt) === view.day).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    : [];
  const upcomingEvents = upcomingResult.status === "ok" ? upcomingResult.data : offline ? samples : [];
  const listed = view.day ? selectedEvents : upcomingEvents;
  const listIsLive = view.day ? monthResult.status === "ok" : upcomingResult.status === "ok";
  const user = listIsLive ? await getCurrentUser() : null;
  const joined = new Set(user ? await getMyRsvpEventIds(user.id) : []);
  const returnTo = eventsPath({ month: view.month.key, day: view.day });
  const markers: Record<string, DayMarker[]> = {};
  for (const event of monthEvents) {
    const key = pragueDateKey(event.startsAt);
    if (!markers[key]) markers[key] = [];
    markers[key].push({ title: event.title, eventType: event.eventType });
  }
  const monthHasEvents = monthEvents.length > 0;

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Kalendář eventů</h1>
          <p className="mt-1 text-foreground/60">
            Turnaje, casual setkání a online pody · časy v Europe/Prague
          </p>
        </div>
        <Link
          href="/events/new"
          className="shrink-0 rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/10"
        >
          + Vytvořit event
        </Link>
      </div>

      <MonthCalendar
        month={view.month}
        selectedDay={view.day}
        todayKey={pragueDateKey(new Date())}
        markers={markers}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/55">
        <div className="flex flex-wrap gap-4">
          <LegendDot className="bg-primary" label="Competitive" />
          <LegendDot className="bg-casual" label="Casual" />
          <LegendDot className="bg-accent" label="Online" />
        </div>
        <p>Všechny časy jsou v Europe/Prague</p>
      </div>

      {!monthHasEvents && listIsLive ? (
        <p className="mb-6 text-sm text-foreground/50">
          V tomto měsíci zatím nejsou žádné eventy.{" "}
          <Link href="/events/new" className="text-primary hover:underline">
            Přidej první
          </Link>
          .
        </p>
      ) : null}

      {noticesFor([upcomingResult, monthResult], errorParam).map((message) => (
        <DataNotice key={message} message={message} />
      ))}
      {offline && upcomingResult.status === "unconfigured" ? (
        <DataNotice message="Supabase ještě není nastavené. Níže je náhled kalendáře." />
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold">{view.day ? formatDayLabel(view.day) : "Nadcházející"}</h2>
        {view.day ? (
          <Link href={eventsPath({ month: view.month.key })} className="shrink-0 text-sm text-primary hover:underline">
            Zrušit výběr dne
          </Link>
        ) : null}
      </div>

      {listed.length === 0 ? (
        view.day ? (
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

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", className)} />
      {label}
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

  return (
    <div className="animate-fade-rise flex items-center gap-4 rounded-xl border border-white/10 bg-card p-4">
      <div className="w-14 shrink-0 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/45">{block.month}</p>
        <p className="font-display text-2xl font-bold leading-none">{block.day}</p>
        <p className="mt-0.5 text-[10px] uppercase text-foreground/45">{block.weekday}</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium">{event.title}</h3>
          <span className={cn("rounded px-2 py-0.5 text-xs", style.chip)}>{style.label}</span>
          {joined ? (
            <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">Jdeš</span>
          ) : null}
        </div>
        {event.location ? <p className="mt-1 text-sm text-foreground/60">{event.location}</p> : null}
        <p className="mt-1 text-xs text-foreground/45">{formatEventDate(event.startsAt)} · Europe/Prague</p>
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
