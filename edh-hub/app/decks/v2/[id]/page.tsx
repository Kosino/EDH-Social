import Link from "next/link";
import { notFound } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import DeckChrome from "@/components/deckbuilder/DeckChrome";
import DeckStatsPanel from "@/components/deckbuilder/DeckStatsPanel";
import DeckVisualBrowser from "@/components/deckbuilder/DeckVisualBrowser";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
import { evaluateDeckLegality } from "@/lib/deckbuilder/legality";
import { getDeckV2 } from "@/lib/deckbuilder/queries";
import { computeDeckStats } from "@/lib/deckbuilder/stats";
import { getCurrentUser } from "@/lib/supabase/session";
import { cn, formatRelativePrague } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DeckV2DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [result, statsOn] = await Promise.all([getDeckV2(id), isFeatureEnabled("deckbuilder_stats")]);

  if (result.status === "error") {
    return (
      <div className="mx-auto max-w-6xl">
        <DataNotice message={result.message} />
      </div>
    );
  }
  if (result.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-6xl">
        <DataNotice message="Supabase ještě není nastavené." />
      </div>
    );
  }
  if (!result.data) notFound();

  const deck = result.data;
  const user = await getCurrentUser();
  const isOwner = Boolean(user && user.id === deck.ownerId);
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

  const browserCards = deck.cards.map((card) => {
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
      <Link
        href={`/profile/${deck.ownerUsername}`}
        className="text-sm text-primary hover:underline"
      >
        ← @{deck.ownerUsername}
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
          active="view"
          isOwner={isOwner}
          meta={formatRelativePrague(deck.updatedAt)}
        />
      </div>

      {!report.legal ? (
        <div
          className={cn(
            "mb-5 rounded-xl border px-4 py-3 text-sm",
            "border-red-400/40 bg-red-400/10"
          )}
        >
          <ul className="list-disc space-y-1 pl-5 text-foreground/75">
            {report.issues.slice(0, 6).map((issue, i) => (
              <li key={`${issue.code}-${i}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {deck.description ? (
        <p className="mb-5 max-w-3xl text-sm text-foreground/60">{deck.description}</p>
      ) : null}

      <DeckVisualBrowser
        cards={browserCards}
        mode="view"
        sidebarExtra={stats ? <DeckStatsPanel stats={stats} /> : null}
      />
    </div>
  );
}
