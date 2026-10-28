import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";

export const dynamic = "force-dynamic";

export default async function TavernaDashboardPage() {
  const deckbuilderOn = await isFeatureEnabled("deckbuilder_core");

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">Taverna u Kosa</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Taverna</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/60">
        Deckbuilding hub uvnitř {BRAND_NAME}. Stavěj Commandery, kontroluj legalitu a později
        importuj listy z Moxfieldu.
      </p>

      <ul className="mt-10 space-y-3">
        <li>
          <Link
            href="/taverna/deckbuilder"
            className="block rounded-2xl border border-white/10 bg-card p-5 transition hover:border-primary/40"
          >
            <h2 className="font-display text-xl font-semibold">Deckbuilder</h2>
            <p className="mt-1 text-sm text-foreground/55">
              Tvoje decky, nový deck a editor s legality enginem.
              {!deckbuilderOn ? " (feature flag zatím vypnutý)" : ""}
            </p>
            <span className="mt-3 inline-block text-sm text-primary">Otevřít →</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
