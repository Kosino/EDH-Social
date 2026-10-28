import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import EventForm from "@/components/forms/EventForm";
import { getEvent } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { toPragueDatetimeLocal } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/events/${id}/edit`)}`);

  const result = await getEvent(id);
  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-xl">
        <DataNotice message={result.message} />
      </div>
    );
  }
  if (result.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-xl">
        <DataNotice message="Supabase ještě není nastavené." />
      </div>
    );
  }
  if (!result.data) notFound();
  if (!result.data.hostId || result.data.hostId !== user.id) redirect(`/events/${id}`);

  const event = result.data;

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/events/${id}`} className="text-sm text-primary hover:underline">
        ← Zpět na event
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Upravit event</h1>
      <EventForm
        mode="edit"
        eventId={event.id}
        defaults={{
          title: event.title,
          eventType: event.eventType,
          startsAt: toPragueDatetimeLocal(event.startsAt),
          location: event.location,
          description: event.description,
        }}
      />
    </div>
  );
}
