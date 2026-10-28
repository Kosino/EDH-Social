import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import AddCardForm from "@/components/deckbuilder/AddCardForm";
import DeckChrome from "@/components/deckbuilder/DeckChrome";
import DeckEditorWorkbench from "@/components/deckbuilder/DeckEditorWorkbench";
import DeckMetaForm from "@/components/deckbuilder/DeckMetaForm";
import DeckStatsPanel from "@/components/deckbuilder/DeckStatsPanel";
import ImportDecklistForm from "@/components/deckbuilder/ImportDecklistForm";
import PartnerForm from "@/components/deckbuilder/PartnerForm";
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
      <div className="mx-auto max-w-6xl">
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
      oracleText: c.oracleText,
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

  const editorCards = deck.cards.map((card) => {
    const status = illegal.get(card.name.toLowerCase());
    return {
      id: card.id,
      name: card.name,
      quantity: card.quantity,
      board: card.board,
      manaCost: card.manaCost,
      typeLine: card.typeLine,
      imageUrl: card.imageUrl,
      isBasicLand: card.isBasicLand,
      illegal: Boolean(status && !status.legal),
      reasons: status?.reasons,
    };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/taverna/deckbuilder" className="text-sm text-primary hover:underline">
        ← Deckbuilder
      </Link>

      <div className="mt-4">
        <DeckChrome
          deckId={deck.id}
          name={deck.name}
          format={deck.format}
          commanderName={deck.commanderName}
          partnerName={deck.partnerName}
          colorIdentity={deck.colorIdentity}
          cardCount={report.cardCount}
          legal={report.legal}
          active="edit"
          isOwner
        />
      </div>

      <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-white/10 bg-card/70 p-3 lg:flex-row lg:items-start">
        <AddCardForm deckId={deck.id} />
        <PartnerForm deckId={deck.id} partnerName={deck.partnerName} />
      </div>

      {report.issues.length > 0 ? (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm">
          <ul className="list-disc space-y-1 pl-5">
            {report.issues.slice(0, 6).map((issue, i) => (
              <li key={`${issue.code}-${i}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6">
        <DeckEditorWorkbench
          deckId={deck.id}
          cards={editorCards}
          sidebarExtra={
            <div className="space-y-4">
              {stats ? <DeckStatsPanel stats={stats} /> : null}
              <DeckMetaForm
                deckId={deck.id}
                name={deck.name}
                format={deck.format}
                description={deck.description}
                isPublic={deck.isPublic}
              />
            </div>
          }
        />
      </div>

      <details className="mt-8 rounded-2xl border border-white/10 bg-card/50 open:pb-4">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground/80 marker:content-none [&::-webkit-details-marker]:hidden">
          Importovat seznam{" "}
          <span className="text-foreground/40">(text / Arena / Moxfield export)</span>
        </summary>
        <div className="border-t border-white/10 px-4 pt-4">
          {importOn ? (
            <ImportDecklistForm deckId={deck.id} showTitle={false} />
          ) : (
            <p className="text-xs text-foreground/45">
              Flag <code className="text-foreground/60">deckbuilder_import</code> je vypnutý.
            </p>
          )}
        </div>
      </details>
    </div>
  );
}
