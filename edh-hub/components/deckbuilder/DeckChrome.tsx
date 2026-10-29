import Link from "next/link";
import ColorIdentityPips from "@/components/deckbuilder/ColorIdentityPips";
import { cn } from "@/lib/utils";

type Tab = "view" | "edit" | "import" | "playtest";

export default function DeckChrome({
  deckId,
  name,
  format,
  commanderName,
  partnerName,
  colorIdentity,
  cardCount,
  legal,
  active,
  isOwner,
  meta,
  playtestEnabled = false,
}: {
  deckId: string;
  name: string;
  format: string;
  commanderName: string;
  partnerName: string | null;
  colorIdentity: string[];
  cardCount: number;
  legal: boolean;
  active: Tab;
  isOwner: boolean;
  meta?: string;
  playtestEnabled?: boolean;
}) {
  const tabs: Array<{ id: Tab; href: string; label: string; ownerOnly?: boolean }> = [
    { id: "view", href: `/decks/v2/${deckId}`, label: "Přehled" },
    { id: "edit", href: `/decks/v2/${deckId}/edit`, label: "Editor", ownerOnly: true },
    {
      id: "import",
      href: `/taverna/deckbuilder/import`,
      label: "Import",
      ownerOnly: true,
    },
    ...(playtestEnabled
      ? [{ id: "playtest" as const, href: `/decks/${deckId}/playtest`, label: "Playtest" }]
      : []),
  ];

  return (
    <header className="mb-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Taverna u Kosa</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/60">
            <span>{format}</span>
            <span>
              {commanderName}
              {partnerName ? ` + ${partnerName}` : ""}
            </span>
            <ColorIdentityPips colors={colorIdentity} />
            <span>
              {cardCount}/100 ·{" "}
              <span className={legal ? "text-casual" : "text-red-300"}>
                {legal ? "legální" : "nelegální"}
              </span>
            </span>
            {meta ? <span className="text-foreground/40">{meta}</span> : null}
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-card/70 p-1">
        {tabs
          .filter((t) => !t.ownerOnly || isOwner)
          .map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm transition",
                active === tab.id
                  ? "bg-primary font-medium text-white"
                  : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        <Link
          href="/taverna/deckbuilder"
          className="ml-auto rounded-lg px-3.5 py-2 text-sm text-foreground/50 hover:bg-white/5 hover:text-foreground"
        >
          Moje decky
        </Link>
      </nav>
    </header>
  );
}
