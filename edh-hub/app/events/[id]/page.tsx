import Link from "next/link";
import { notFound } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import EventKindIcon from "@/components/events/EventKindIcon";
import { deleteEvent, toggleRsvp } from "@/app/create/actions";
import { eventTypeStyle } from "@/lib/brand";
import { getCurrentUser } from "@/lib/supabase/session";
import {
  getEvent,
  getEventAttendees,
  getMyRsvpEventIds,
} from "@/lib/supabase/queries";
import { cn, formatEventCountdown, formatEventDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function textParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { id } = await params;
  const errorParam = textParam((await searchParams).error);
  const result = await getEvent(id);

  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-3xl">
        <DataNotice message={result.message} />
        <Link href="/events" className="text-sm text-primary hover:underline">
          Zpět na kalendář
        </Link>
      </div>
    );
  }

  if (result.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-3xl">
        <DataNotice message="Supabase ještě není nastavené." />
        <Link href="/events" className="text-sm text-primary hover:underline">
          Zpět na kalendář
        </Link>
      </div>
    );
  }

  if (!result.data) notFound();

  const event = result.data;
  const style = eventTypeStyle(event.eventType);
  const user = await getCurrentUser();
  const joined = user ? (await getMyRsvpEventIds(user.id)).includes(event.id) : false;
  const isHost = Boolean(user && event.hostId && user.id === event.hostId);
  const attendees = await getEventAttendees(event.id);
  const returnTo = `/events/${event.id}`;
  const countdown = formatEventCountdown(event.startsAt);
  const hostLabel = event.hostDisplayName ?? event.hostUsername;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/events" className="text-sm text-primary hover:underline">
        ← Kalendář eventů
      </Link>

      {errorParam ? <DataNotice message={errorParam} /> : null}

      <div className="mt-6 animate-fade-rise rounded-2xl border border-white/10 bg-card p-6">
        <div className="flex flex-wrap items-start gap-4">
          <EventKindIcon eventType={event.eventType} className="h-16 w-16 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold leading-tight">{event.title}</h1>
              <span className={cn("rounded px-2 py-0.5 text-xs", style.chip)}>{style.label}</span>
              {joined ? (
                <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">Jdeš</span>
              ) : null}
            </div>
            {event.description ? (
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{event.description}</p>
            ) : null}
            {event.location ? <p className="mt-2 text-sm text-foreground/60">{event.location}</p> : null}
            <p className="mt-2 text-sm text-foreground/50">
              {formatEventDate(event.startsAt)} · Europe/Prague
            </p>
            {countdown ? (
              <p className="mt-1 text-sm font-medium text-accent">{countdown}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div className="flex items-center gap-3">
            {hostLabel && event.hostUsername ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-casual text-sm font-semibold text-white">
                  {hostLabel.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-foreground/45">Host</p>
                  <Link
                    href={`/profile/${event.hostUsername}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    @{event.hostUsername}
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground/50">Host není uvedený</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {user ? (
              <form action={toggleRsvp}>
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button className={cn("rounded-lg border px-5 py-2 text-sm font-medium", style.border)}>
                  {joined ? "Odhlásit" : "Přidat se"}
                </button>
              </form>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(returnTo)}`}
                className="rounded-lg border border-white/15 px-5 py-2 text-sm text-foreground/75 hover:bg-white/5"
              >
                Přihlas se pro účast
              </Link>
            )}
            {isHost ? (
              <>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-foreground/80 hover:bg-white/5"
                >
                  Upravit
                </Link>
                <form action={deleteEvent}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
                  >
                    Smazat event
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">
          Kdo jde{attendees.length > 0 ? ` · ${attendees.length}` : ""}
        </h2>
        {attendees.length === 0 ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-card p-5 text-sm text-foreground/60">
            Zatím nikdo. Buď první.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-card">
            {attendees.map((person) => (
              <li key={person.username} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                  {person.displayName.slice(0, 1).toUpperCase()}
                </div>
                <Link href={`/profile/${person.username}`} className="hover:text-primary">
                  <span className="font-medium">{person.displayName}</span>
                  <span className="ml-2 text-sm text-foreground/45">@{person.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
