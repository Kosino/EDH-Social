"use client";

import PlaytestSandbox from "@/components/deckbuilder/PlaytestSandbox";
import type { PlaytestDeckCard } from "@/lib/deckbuilder/playtest-types";

/** Local/QA playtest without auth or feature flags. */
const SAMPLE: PlaytestDeckCard[] = [
  {
    id: "cmd",
    name: "Tymna the Weaver",
    quantity: 1,
    board: "commander",
    imageUrl:
      "https://cards.scryfall.io/normal/front/b/c/bc7cbe9b-324e-42b8-94e2-36e91cb32163.jpg",
  },
  {
    id: "p",
    name: "Thrasios, Triton Hero",
    quantity: 1,
    board: "commander",
    imageUrl:
      "https://cards.scryfall.io/normal/front/2/1/21e27b91-c7f1-4709-aa0d-8b5d81b22a0a.jpg",
  },
  {
    id: "sol",
    name: "Sol Ring",
    quantity: 1,
    board: "main",
    imageUrl:
      "https://cards.scryfall.io/normal/front/f/c/fc817e07-c1f3-469f-9cf7-0945dea7400f.jpg",
  },
  {
    id: "bolt",
    name: "Lightning Bolt",
    quantity: 1,
    board: "main",
    imageUrl:
      "https://cards.scryfall.io/normal/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.jpg",
  },
  {
    id: "island",
    name: "Island",
    quantity: 20,
    board: "main",
    imageUrl:
      "https://cards.scryfall.io/normal/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.jpg",
  },
  {
    id: "plains",
    name: "Plains",
    quantity: 15,
    board: "main",
    imageUrl:
      "https://cards.scryfall.io/normal/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.jpg",
  },
];

export default function PlaytestPreviewPage() {
  return (
    <div className="mx-auto max-w-7xl px-2 py-6">
      <h1 className="mb-4 font-display text-2xl font-bold">Playtest preview</h1>
      <PlaytestSandbox deckName="Sample Tymna / Thrasios" format="cEDH" cards={SAMPLE} />
    </div>
  );
}
