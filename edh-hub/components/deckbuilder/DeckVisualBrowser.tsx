"use client";

import { useMemo, useState, type ReactNode } from "react";
import DeckCardTile from "@/components/deckbuilder/DeckCardTile";
import RemoveCardButton from "@/components/deckbuilder/RemoveCardButton";
import { toReadableCardImage } from "@/lib/deckbuilder/card-image";
import { classifyTypeLine, type CardTypeCategory } from "@/lib/deckbuilder/stats";
import { cn } from "@/lib/utils";

export type DeckBrowserCard = {
  id: string;
  name: string;
  quantity: number;
  board: "main" | "commander" | "sideboard";
  manaCost: string | null;
  typeLine: string | null;
  imageUrl: string | null;
  isBasicLand: boolean;
  illegal: boolean;
  reasons?: string[];
};

const GROUP_ORDER: Array<CardTypeCategory | "Commander" | "Sideboard"> = [
  "Commander",
  "Creature",
  "Planeswalker",
  "Instant",
  "Sorcery",
  "Artifact",
  "Enchantment",
  "Battle",
  "Land",
  "Other",
  "Sideboard",
];

function groupKey(card: DeckBrowserCard): CardTypeCategory | "Commander" | "Sideboard" {
  if (card.board === "commander") return "Commander";
  if (card.board === "sideboard") return "Sideboard";
  return classifyTypeLine(card.typeLine, card.isBasicLand);
}

export default function DeckVisualBrowser({
  cards,
  deckId,
  mode = "view",
  emptyMessage = "Zatím žádné karty.",
  sidebarExtra,
}: {
  cards: DeckBrowserCard[];
  deckId?: string;
  mode?: "view" | "edit";
  emptyMessage?: string;
  sidebarExtra?: ReactNode;
}) {
  const preferred =
    cards.find((c) => c.board === "commander") ?? cards[0] ?? null;
  const [previewId, setPreviewId] = useState<string | null>(preferred?.id ?? null);

  const preview = useMemo(() => {
    if (!cards.length) return null;
    return cards.find((c) => c.id === previewId) ?? preferred;
  }, [cards, previewId, preferred]);

  const groups = useMemo(() => {
    const map = new Map<string, DeckBrowserCard[]>();
    for (const card of cards) {
      const key = groupKey(card);
      const list = map.get(key) ?? [];
      list.push(card);
      map.set(key, list);
    }
    return GROUP_ORDER.map((key) => ({
      key,
      cards: map.get(key) ?? [],
      count: (map.get(key) ?? []).reduce((s, c) => s + c.quantity, 0),
    })).filter((g) => g.cards.length > 0);
  }, [cards]);

  const previewSrc = toReadableCardImage(preview?.imageUrl);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-card/80 p-3">
          <div className="relative mx-auto aspect-[5/7] w-full max-w-[260px] overflow-hidden rounded-xl bg-gradient-to-b from-primary/20 to-white/[0.03]">
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt={preview?.name ?? ""}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-foreground/40">
                {preview ? preview.name : "Najedi myší na kartu"}
              </div>
            )}
          </div>
          {preview ? (
            <div className="mt-3 space-y-1 px-1">
              <p className="font-display text-sm font-semibold leading-snug">{preview.name}</p>
              {preview.manaCost ? (
                <p className="text-xs text-foreground/50">{preview.manaCost}</p>
              ) : null}
              {preview.typeLine ? (
                <p className="text-xs text-foreground/45">{preview.typeLine}</p>
              ) : null}
              {preview.illegal ? (
                <p className="text-xs text-red-300">{preview.reasons?.[0] ?? "Nelegální"}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-xs text-foreground/40">Žádný náhled.</p>
          )}
        </div>
        {sidebarExtra}
      </aside>

      <div className="min-w-0 space-y-7">
        {cards.length === 0 ? (
          <p className="text-sm text-foreground/55">{emptyMessage}</p>
        ) : (
          groups.map((group) => (
            <section key={group.key}>
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-white/10 pb-2">
                <h3 className="font-display text-sm font-semibold text-foreground/85">
                  {group.key}{" "}
                  <span className="font-sans font-normal text-foreground/40">({group.count})</span>
                </h3>
              </div>
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {group.cards.map((card) => (
                  <li key={card.id}>
                    <div
                      className={cn(
                        "group relative rounded-xl transition",
                        previewId === card.id && "ring-2 ring-primary/55"
                      )}
                      onMouseEnter={() => setPreviewId(card.id)}
                      onFocus={() => setPreviewId(card.id)}
                    >
                      <DeckCardTile
                        name={card.name}
                        quantity={card.quantity}
                        manaCost={card.manaCost}
                        typeLine={card.typeLine}
                        imageUrl={card.imageUrl}
                        illegal={card.illegal}
                        reasons={card.reasons}
                        visual
                      />
                      {mode === "edit" && deckId ? (
                        <div className="absolute right-1.5 top-1.5 z-10 opacity-0 transition group-hover:opacity-100">
                          <div className="rounded-md bg-black/75 px-1.5 py-1">
                            <RemoveCardButton deckId={deckId} cardId={card.id} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
