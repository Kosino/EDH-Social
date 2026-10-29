import Link from "next/link";
import DataNotice from "@/components/DataNotice";
import DeckListGrid from "@/components/deckbuilder/DeckListGrid";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
import { listMyDecksV2 } from "@/lib/deckbuilder/queries";
import { getCurrentUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function DeckbuilderDashboardPage() {
  const [user, flagOn, playtestOn] = await Promise.all([
    getCurrentUser(),
    isFeatureEnabled("deckbuilder_core"),
    isFeatureEnabled("deckbuilder_playtest"),
  ]);

  const decksResult = user && flagOn ? await listMyDecksV2(user.id) : null;

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-4 text-sm text-foreground/50">
        <Link href="/taverna" className="text-primary hover:underline">
          Taverna
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground/70">Deckbuilder</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Taverna u Kosa</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Deckbuilder</h1>
          <p className="mt-2 text-sm text-foreground/55">
            Moxfield-like editor: visual grid, legality, import.
          </p>
        </div>
        {user && flagOn ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/taverna/deckbuilder/import"
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm text-foreground/85 hover:border-primary/40"
            >
              Importovat seznam
            </Link>
            <Link
              href="/decks/new"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              + Nový deck
            </Link>
          </div>
        ) : null}
      </div>

      {!flagOn ? (
        <DataNotice message="Feature flag deckbuilder_core je vypnutý. Zapni ho v tabulce feature_flags." />
      ) : null}

      {!user ? (
        <p className="rounded-xl border border-dashed border-white/15 bg-card/60 p-6 text-sm text-foreground/70">
          Pro Deckbuilder se{" "}
          <Link href="/login?next=/taverna/deckbuilder" className="text-primary hover:underline">
            přihlas
          </Link>
          .
        </p>
      ) : null}

      {decksResult?.status === "error" ? <DataNotice message={decksResult.message} /> : null}

      {decksResult?.status === "ok" ? (
        decksResult.data.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-card/60 p-6 text-sm text-foreground/70">
            Zatím žádný Taverna deck.{" "}
            <Link href="/decks/new" className="text-primary hover:underline">
              Vytvoř první
            </Link>
            .
          </p>
        ) : (
          <DeckListGrid decks={decksResult.data} playtestEnabled={playtestOn} />
        )
      ) : null}
    </div>
  );
}
