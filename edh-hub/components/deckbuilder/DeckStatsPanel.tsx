import {
  MANA_CURVE_BUCKETS,
  TYPE_CATEGORIES,
  type DeckStats,
} from "@/lib/deckbuilder/stats";
import { cn } from "@/lib/utils";

export default function DeckStatsPanel({ stats }: { stats: DeckStats }) {
  const curveMax = Math.max(1, ...MANA_CURVE_BUCKETS.map((b) => stats.manaCurve[b]));
  const typeEntries = TYPE_CATEGORIES.map((cat) => ({
    cat,
    count: stats.types[cat],
  })).filter((e) => e.count > 0);
  const typeMax = Math.max(1, ...typeEntries.map((e) => e.count));

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Statistiky</h2>
        <p className="text-xs text-foreground/50">
          {stats.totalCards} karet
          {stats.averageCmc != null ? ` · avg CMC ${stats.averageCmc}` : ""}
          {stats.nonLandMain ? ` · ${stats.nonLandMain} non-land` : ""}
        </p>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground/45">
          Mana curve
        </p>
        <div className="flex h-28 items-end gap-1.5 sm:gap-2">
          {MANA_CURVE_BUCKETS.map((bucket) => {
            const n = stats.manaCurve[bucket];
            const h = Math.round((n / curveMax) * 100);
            return (
              <div key={bucket} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-foreground/55">{n || ""}</span>
                <div className="flex h-20 w-full items-end justify-center">
                  <div
                    className={cn(
                      "w-full max-w-[2rem] rounded-t-sm transition-[height]",
                      n > 0 ? "bg-accent/80" : "bg-white/5"
                    )}
                    style={{ height: `${Math.max(n > 0 ? 8 : 2, h)}%` }}
                    title={`CMC ${bucket}: ${n}`}
                  />
                </div>
                <span className="text-[10px] text-foreground/45">{bucket}</span>
              </div>
            );
          })}
        </div>
      </div>

      {typeEntries.length > 0 ? (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground/45">
            Typy karet
          </p>
          <ul className="space-y-2">
            {typeEntries.map(({ cat, count }) => (
              <li key={cat} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-2 text-sm">
                <span className="truncate text-foreground/70">{cat}</span>
                <div className="h-2 overflow-hidden rounded-sm bg-white/5">
                  <div
                    className="h-full rounded-sm bg-casual/70"
                    style={{ width: `${Math.round((count / typeMax) * 100)}%` }}
                  />
                </div>
                <span className="text-right tabular-nums text-foreground/55">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-foreground/45">Zatím žádná data pro statistiky.</p>
      )}
    </section>
  );
}
