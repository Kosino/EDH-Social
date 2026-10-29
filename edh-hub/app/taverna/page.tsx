import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { isFeatureEnabled } from "@/lib/deckbuilder/feature-flags";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TavernaDashboardPage() {
  const deckbuilderOn = await isFeatureEnabled("deckbuilder_core");

  const links = [
    {
      href: "/taverna/deckbuilder",
      label: "Deckbuilder",
      hint: "Seznam decků · visual editor",
      primary: true,
    },
    {
      href: "/decks/new",
      label: "Nový deck",
      hint: "Commander + partner",
      primary: false,
    },
    {
      href: "/taverna/deckbuilder/import",
      label: "Importovat seznam",
      hint: "Arena / Moxfield text",
      primary: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <p className="page-kicker text-accent">{BRAND_NAME} · Taverna u Kosa</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Taverna</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/60">
        Deckbuilding hub v {BRAND_NAME} — UX ve stylu Moxfieldu: rychlé přidávání karet, velký
        náhled a visual grid.
        {!deckbuilderOn ? " (deckbuilder_core je zatím vypnutý)" : ""}
      </p>

      <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-card/80 p-2 shadow-panel">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "min-w-[10rem] flex-1 rounded-xl px-4 py-3 transition duration-200",
              item.primary
                ? "bg-primary text-white shadow-card-hover hover:bg-primary/90"
                : "bg-white/[0.03] text-foreground/90 hover:bg-white/[0.06]"
            )}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span
              className={cn(
                "mt-0.5 block text-xs",
                item.primary ? "text-white/75" : "text-foreground/45"
              )}
            >
              {item.hint}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
