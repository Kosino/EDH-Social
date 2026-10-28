import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import AddCardForm from "@/components/deckbuilder/AddCardForm";
import DeckCardTile from "@/components/deckbuilder/DeckCardTile";
import DeckStatsPanel from "@/components/deckbuilder/DeckStatsPanel";
import ImportDecklistForm from "@/components/deckbuilder/ImportDecklistForm";
import RemoveCardButton from "@/components/deckbuilder/RemoveCardButton";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
import { evaluateDeckLegality } from "@/lib/deckbuilder/legality";
import { getDeckV2 } from "@/lib/deckbuilder/queries";
import { computeDeckStats } from "@/lib/deckbuilder/stats";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function DeckV2EditPage({ params }: { params: Promise<{ id: string }> }) {
  const enabled = await isFeatureEnabled("deckbuilder_core");
  if (!enabled) redirect("/decks/new");

  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/decks/v2/${id}/edit`)}`);

  const [importOn, statsOn] = await Promise.all([
    isFeatureEnabled("deckbuilder_import"),
    isFeatureEnabled("deckbuilder_stats"),
  ]);
  const result = await getDeckV2(id);
  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-4xl">
        <DataNotice message={result.message} />
      </div>
    );
  }
  if (result.status !== "ok" || !result.data) notFound();

  const deck = result.data;
  if (deck.ownerId !== user.id) redirect(`/decks/v2/${deck.id}`);

  const report = evaluateDeckLegality({
    format: deck.format,
    colorIdentity: deck.colorIdentity,
    cards: deck.cards.map((c) => ({
      name: c.name,
      quantity: c.quantity,
      board: c.board,
      colorIdentity: c.colorIdentity,
      isBasicLand: c.isBasicLand,
      typeLine: c.typeLine,
    })),
  });
  const illegal = new Map(report.cards.map((c) => [c.name.toLowerCase(), c]));
  const stats = statsOn
    ? computeDeckStats(
        deck.cards.map((c) => ({
          name: c.name,
          quantity: c.quantity,
          board: c.board,
          manaCost: c.manaCost,
          typeLine: c.typeLine,
          isBasicLand: c.isBasicLand,
        }))
      )
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/decks/v2/${deck.id}`} className="text-sm text-primary hover:underline">
        ← Detail decku
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Editor: {deck.name}</h1>
      <p className="mt-1 text-sm text-foreground/55">
        {deck.format} · {deck.commanderName} · {report.cardCount}/100 ·{" "}
        <span className={report.legal ? "text-casual" : "text-red-300"}>
          {report.legal ? "legální" : "nelegální"}
        </span>
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <AddCardForm deckId={deck.id} />
          {importOn ? (
            <ImportDecklistForm deckId={deck.id} />
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 px-3 py-3 text-xs text-foreground/45">
              Import decklistu (Modul 02) je vypnutý. Zapni flag{" "}
              <code className="text-foreground/60">deckbuilder_import</code> v{" "}
              <code className="text-foreground/60">feature_flags</code>.
            </p>
          )}
          {stats ? <DeckStatsPanel stats={stats} /> : null}
        </div>
        <div className="space-y-3">
          {report.issues.length > 0 ? (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm">
              <ul className="list-disc space-y-1 pl-5">
                {report.issues.slice(0, 6).map((issue, i) => (
                  <li key={`${issue.code}-${i}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {deck.cards.length === 0 ? (
            <p className="text-sm text-foreground/55">Zatím žádné karty.</p>
          ) : (
            deck.cards.map((card) => {
              const status = illegal.get(card.name.toLowerCase());
              return (
                <div key={card.id} className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <DeckCardTile
                      name={card.name}
                      quantity={card.quantity}
                      manaCost={card.manaCost}
                      typeLine={card.typeLine}
                      imageUrl={card.imageUrl}
                      illegal={Boolean(status && !status.legal)}
                      reasons={status?.reasons}
                    />
                  </div>
                  <div className="pt-4">
                    <RemoveCardButton deckId={deck.id} cardId={card.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
