import Link from "next/link";
import DataNotice from "@/components/DataNotice";
import { toggleRsvp } from "@/app/create/actions";
import { getMyRsvpEventIds, getUpcomingEvents, type HubEvent } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatEventDate } from "@/lib/utils";

const samples: HubEvent[] = [
  { id: "1", startsAt: "2026-05-16T18:00:00.000Z", title: "cEDH Tournament", eventType: "Competitive", location: null },
  { id: "2", startsAt: "2026-05-18T18:00:00.000Z", title: "Friday Night EDH", eventType: "Casual", location: null },
  { id: "3", startsAt: "2026-05-22T18:00:00.000Z", title: "Casual Pod", eventType: "Casual", location: null },
];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const result = await getUpcomingEvents();
  const events = result.status === "ok" ? result.data : samples;
  const live = result.status === "ok";
  const user = live ? await getCurrentUser() : null;
  const joined = new Set(user ? await getMyRsvpEventIds(user.id) : []);

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kalendář eventů</h1>
          <p className="mt-1 text-foreground/60">Turnaje, casual setkání a online pody</p>
        </div>
        <Link href="/events/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent/90">
          + Vytvořit event
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-card p-6">
        <div className="mb-4 grid grid-cols-7 gap-2 text-center text-sm text-foreground/50">
          {["Ne", "Po", "Út", "St", "Čt", "Pá", "So"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              className="relative flex aspect-square items-center justify-center rounded-lg bg-white/5 text-sm"
            >
              {i + 1}
              {!live && (i === 4 || i === 15 || i === 22) && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </div>

      {result.status === "error" && <DataNotice message={result.message} />}
      {params.error && <DataNotice message={params.error} />}

      <h2 className="mb-4 text-xl font-semibold">Nadcházející</h2>
      {events.length === 0 ? (
        <p className="text-sm text-foreground/60">
          Žádné nadcházející eventy.{" "}
          <Link href="/events/new" className="text-primary hover:underline">
            Vytvoř první
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventItem key={event.id} event={event} joined={joined.has(event.id)} signedIn={Boolean(user)} live={live} />
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
}: {
  event: HubEvent;
  joined: boolean;
  signedIn: boolean;
  live: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-card p-4">
      <div>
        <p className="text-xs text-foreground/50">{formatEventDate(event.startsAt)}</p>
        <h3 className="font-medium">{event.title}</h3>
        {event.location && <p className="text-sm text-foreground/60">{event.location}</p>}
        <span className="mt-1 inline-block rounded bg-white/10 px-2 py-0.5 text-xs">{event.eventType}</span>
      </div>
      {live && signedIn ? (
        <form action={toggleRsvp}>
          <input type="hidden" name="eventId" value={event.id} />
          <button className="rounded-lg border border-primary px-4 py-1.5 text-sm text-primary hover:bg-primary/10">
            {joined ? "Jdu" : "Přidat se"}
          </button>
        </form>
      ) : (
        <Link href="/login?next=/events" className="rounded-lg border border-primary px-4 py-1.5 text-sm text-primary hover:bg-primary/10">
          Přidat se
        </Link>
      )}
    </div>
  );
}
