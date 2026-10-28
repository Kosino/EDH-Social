import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import DeckForm from "@/components/forms/DeckForm";
import { getDeck } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function EditDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/decks/${id}/edit`)}`);

  const result = await getDeck(id);
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
  if (result.data.ownerId !== user.id) redirect(`/decks/${id}`);

  const deck = result.data;

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/decks/${id}`} className="text-sm text-primary hover:underline">
        ← Zpět na deck
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Upravit deck</h1>
      <DeckForm
        mode="edit"
        deckId={deck.id}
        defaults={{
          name: deck.name,
          format: deck.format,
          commander: deck.commander,
          moxfieldUrl: deck.moxfieldUrl,
        }}
      />
    </div>
  );
}
