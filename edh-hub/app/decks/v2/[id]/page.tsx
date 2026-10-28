import Link from "next/link";
import { notFound } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import DeckCardTile from "@/components/deckbuilder/DeckCardTile";
import DeckStatsPanel from "@/components/deckbuilder/DeckStatsPanel";
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
      <div className="mx-auto max-w-3xl">
        <DataNotice message={result.message} />
      </div>
    );
  }
  if (result.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-3xl">
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
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/profile/${deck.ownerUsername}`}
        className="text-sm text-primary hover:underline"
      >
        ← Profil @{deck.ownerUsername}
      </Link>

      <header className="mt-6 mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">Taverna u Kosa</p>
        <h1 className="mt-1 font-display text-3xl font-bold">{deck.name}</h1>
        <p className="mt-2 text-sm text-foreground/60">
          {deck.format} · {deck.commanderName}
          {deck.colorIdentity.length ? ` · ${deck.colorIdentity.join("")}` : ""}
          {" · "}
          {formatRelativePrague(deck.updatedAt)}
        </p>
        {isOwner ? (
          <Link
            href={`/decks/v2/${deck.id}/edit`}
            className="mt-4 inline-block rounded-lg border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10"
          >
            Upravit / importovat seznam
          </Link>
        ) : null}
      </header>

      <section
        className={cn(
          "mb-8 rounded-xl border px-4 py-3 text-sm",
          report.legal ? "border-casual/40 bg-casual/10" : "border-red-400/40 bg-red-400/10"
        )}
      >
        <p className="font-medium">
          Legality: {report.legal ? "OK" : "Nelegální"} · {report.cardCount}/100 karet
        </p>
        {report.issues.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/75">
            {report.issues.slice(0, 8).map((issue, i) => (
              <li key={`${issue.code}-${i}`}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {stats ? (
        <div className="mb-8">
          <DeckStatsPanel stats={stats} />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {deck.cards.map((card) => {
          const status = illegal.get(card.name.toLowerCase());
          return (
            <DeckCardTile
              key={card.id}
              name={card.name}
              quantity={card.quantity}
              manaCost={card.manaCost}
              typeLine={card.typeLine}
              imageUrl={card.imageUrl}
              illegal={Boolean(status && !status.legal)}
              reasons={status?.reasons}
            />
          );
        })}
      </div>
    </div>
  );
}
