import Link from "next/link";
import { redirect } from "next/navigation";
import EventForm from "@/components/forms/EventForm";
import { getCurrentUser } from "@/lib/supabase/session";

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/events/new");

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/events" className="text-sm text-primary hover:underline">
        ← Eventy
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nový event</h1>
      <p className="mt-1 text-foreground/60">Turnaj, casual pod nebo online hra.</p>
      <EventForm />
    </div>
  );
}