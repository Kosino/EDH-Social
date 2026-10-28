import Link from "next/link";
import { redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import MonthCalendar from "@/components/events/MonthCalendar";
import { toggleRsvp } from "@/app/create/actions";
import { eventsPath, formatDayLabel, pragueDateKey, pragueMonthRange, resolveCalendarQuery } from "@/lib/calendar";
import { getEventsInRange, getMyRsvpEventIds, getUpcomingEvents, type HubEvent, type QueryResult } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatEventDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const samples: HubEvent[] = [
  { id: "1", startsAt: "2026-05-16T18:00:00.000Z", title: "cEDH Tournament", eventType: "Competitive", location: "Most" },
  { id: "2", startsAt: "2026-05-18T18:00:00.000Z", title: "Friday Night EDH", eventType: "Casual", location: "Bílina" },
  { id: "3", startsAt: "2026-05-22T18:00:00.000Z", title: "Casual Pod", eventType: "Casual", location: null },
];

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
  const counts: Record<string, number> = {};
  for (const event of monthEvents) {
    const key = pragueDateKey(event.startsAt);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kalendář eventů</h1>
          <p className="mt-1 text-foreground/60">Turnaje, casual setkání a online pody</p>
        </div>
        <Link href="/events/new" className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent/90">
          + Vytvořit event
        </Link>
      </div>

      <MonthCalendar
        month={view.month}
        selectedDay={view.day}
        todayKey={pragueDateKey(new Date())}
        counts={counts}
      />

      {noticesFor([upcomingResult, monthResult], errorParam).map((message) => (
        <DataNotice key={message} message={message} />
      ))}

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{view.day ? formatDayLabel(view.day) : "Nadcházející"}</h2>
        {view.day ? (
          <Link href={eventsPath({ month: view.month.key })} className="shrink-0 text-sm text-primary hover:underline">
            Zrušit výběr
          </Link>
        ) : null}
      </div>

      {listed.length === 0 ? (
        view.day ? (
          <p className="text-sm text-foreground/60">V tento den není žádný event.</p>
        ) : (
          <p className="text-sm text-foreground/60">
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
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-card p-4">
      <div>
        <p className="text-xs text-foreground/50">{formatEventDate(event.startsAt)}</p>
        <h3 className="font-medium">{event.title}</h3>
        {event.location && <p className="text-sm text-foreground/60">{event.location}</p>}
        <span className="mt-1 inline-block rounded bg-white/10 px-2 py-0.5 text-xs">{event.eventType}</span>
      </div>
      {live && signedIn ? (
        <form action={toggleRsvp}>
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="month" value={monthKey} />
          {dayKey ? <input type="hidden" name="day" value={dayKey} /> : null}
          <button className="rounded-lg border border-primary px-4 py-1.5 text-sm text-primary hover:bg-primary/10">
            {joined ? "Jdu" : "Přidat se"}
          </button>
        </form>
      ) : (
        <Link
          href={`/login?next=${encodeURIComponent(returnTo)}`}
          className="rounded-lg border border-primary px-4 py-1.5 text-sm text-primary hover:bg-primary/10"
        >
          Přidat se
        </Link>
      )}
    </div>
  );
}
