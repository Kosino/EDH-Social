"use client";

import type { ReactNode } from "react";
import DeckVisualBrowser, {
  type DeckBrowserCard,
} from "@/components/deckbuilder/DeckVisualBrowser";

export type EditorCard = DeckBrowserCard;

/** Editor wrapper — Moxfield-like visual browser with remove-on-hover. */
export default function DeckEditorWorkbench({
  deckId,
  cards,
  sidebarExtra,
}: {
  deckId: string;
  cards: EditorCard[];
  sidebarExtra?: ReactNode;
}) {
  return (
    <DeckVisualBrowser
      deckId={deckId}
      cards={cards}
      mode="edit"
      emptyMessage="Zatím žádné karty — přidej je v řádku nahoře."
      sidebarExtra={sidebarExtra}
    />
  );
}
