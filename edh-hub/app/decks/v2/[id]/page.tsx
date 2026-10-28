import Link from "next/link";
import { notFound } from "next/navigation";
import DataNotice from "@/components/DataNotice";
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/profile/${deck.ownerUsername}`}
            className="text-sm text-primary hover:underline"
          >
            ← @{deck.ownerUsername}
          </Link>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-accent">
            Taverna u Kosa
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold">{deck.name}</h1>
          <p className="mt-2 text-sm text-foreground/60">
            {deck.format} · {deck.commanderName}
            {deck.partnerName ? ` + ${deck.partnerName}` : ""}
            {deck.colorIdentity.length ? ` · ${deck.colorIdentity.join("")}` : ""}
            {" · "}
            {formatRelativePrague(deck.updatedAt)}
          </p>
        </div>
        {isOwner ? (
          <div className="flex flex-wrap gap-2 pt-8">
            <Link
              href={`/decks/v2/${deck.id}/edit`}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              Upravit deck
            </Link>
            <Link
              href="/taverna/deckbuilder/import"
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-foreground/85 hover:border-primary/40"
            >
              Import
            </Link>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-5 rounded-xl border px-4 py-3 text-sm",
          report.legal ? "border-casual/40 bg-casual/10" : "border-red-400/40 bg-red-400/10"
        )}
      >
        <p className="font-medium">
          Legality: {report.legal ? "OK" : "Nelegální"} · {report.cardCount}/100
        </p>
        {report.issues.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/75">
            {report.issues.slice(0, 6).map((issue, i) => (
              <li key={`${issue.code}-${i}`}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {deck.description ? (
        <p className="mt-4 max-w-3xl text-sm text-foreground/60">{deck.description}</p>
      ) : null}

      <div className="mt-6">
        <DeckVisualBrowser
          cards={browserCards}
          mode="view"
          sidebarExtra={stats ? <DeckStatsPanel stats={stats} /> : null}
        />
      </div>
    </div>
  );
}
