import Link from "next/link";
import { redirect } from "next/navigation";
import DataNotice from "@/components/DataNotice";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
import { listMyDecksV2 } from "@/lib/deckbuilder/queries";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatRelativePrague } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TavernaPlaytestHubPage() {
  const playtestOn = await isFeatureEnabled("deckbuilder_playtest");
  if (!playtestOn) {
    redirect("/taverna/deckbuilder");
  }

  const [user, coreOn] = await Promise.all([
    getCurrentUser(),
    isFeatureEnabled("deckbuilder_core"),
  ]);

  const decksResult = user && coreOn ? await listMyDecksV2(user.id) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-4 text-sm text-foreground/50">
        <Link href="/taverna" className="text-primary hover:underline">
          Taverna
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground/70">Playtest</span>
      </nav>

      <p className="text-xs font-medium uppercase tracking-wider text-accent">Taverna u Kosa</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Playtest</h1>
      <p className="mt-2 text-sm text-foreground/55">
        Vyber deck a spusť lokální goldfish sandbox (stav se neukládá).
      </p>

      {!coreOn ? (
        <div className="mt-6">
          <DataNotice message="Feature flag deckbuilder_core je vypnutý." />
        </div>
      ) : null}

      {!user ? (
        <p className="mt-6 rounded-xl border border-dashed border-white/15 bg-card/60 p-6 text-sm text-foreground/70">
          Pro Playtest se{" "}
          <Link href="/login?next=/taverna/playtest" className="text-primary hover:underline">
            přihlas
          </Link>
          .
        </p>
      ) : null}

      {decksResult?.status === "error" ? (
        <div className="mt-6">
          <DataNotice message={decksResult.message} />
        </div>
      ) : null}

      {decksResult?.status === "ok" ? (
        decksResult.data.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/15 bg-card/60 p-6 text-sm text-foreground/70">
            Zatím žádný Taverna deck.{" "}
            <Link href="/decks/new" className="text-primary hover:underline">
              Vytvoř první
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {decksResult.data.map((deck) => (
              <li
                key={deck.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{deck.name}</p>
                  <p className="mt-0.5 truncate text-xs text-foreground/50">
                    {deck.format} · {deck.commanderName}
                    {deck.partnerName ? ` + ${deck.partnerName}` : ""} ·{" "}
                    {formatRelativePrague(deck.updatedAt)}
                  </p>
                </div>
                <Link
                  href={`/decks/${deck.id}/playtest`}
                  className="shrink-0 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Playtest
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
