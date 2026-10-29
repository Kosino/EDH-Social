import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import PlaytestSandbox from "@/components/deckbuilder/PlaytestSandbox";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
import { getDeckV2 } from "@/lib/deckbuilder/queries";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function DeckPlaytestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playtestOn = await isFeatureEnabled("deckbuilder_playtest");
  if (!playtestOn) {
    redirect(`/decks/v2/${id}`);
  }

  const coreOn = await isFeatureEnabled("deckbuilder_core");
  if (!coreOn) {
    redirect(`/decks/${id}`);
  }

  const result = await getDeckV2(id);
  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-6xl px-1">
        <DataNotice message={result.message} />
      </div>
    );
  }
  if (result.status === "unconfigured" || !result.data) notFound();

  const deck = result.data;
  const user = await getCurrentUser();
  const canView = deck.isPublic || (user && user.id === deck.ownerId);
  if (!canView) {
    redirect(`/decks/v2/${id}`);
  }

  const playtestCards = deck.cards.map((c) => ({
    id: c.id,
    name: c.name,
    quantity: c.quantity,
    board: c.board,
    imageUrl: c.imageUrl,
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/decks/v2/${deck.id}`} className="text-sm text-primary hover:underline">
          ← {deck.name}
        </Link>
        <p className="text-xs text-foreground/40">Lokální sandbox — stav se neukládá</p>
      </div>
      <PlaytestSandbox deckName={deck.name} format={deck.format} cards={playtestCards} />
    </div>
  );
}
