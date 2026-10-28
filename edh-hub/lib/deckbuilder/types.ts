import type { DeckFormat } from "@/lib/deckbuilder/legality";

export type DeckCardBoard = "main" | "commander" | "sideboard";

export type DeckV2Card = {
  id: string;
  deckId: string;
  scryfallId: string | null;
  name: string;
  quantity: number;
  board: DeckCardBoard;
  manaCost: string | null;
  typeLine: string | null;
  oracleText: string | null;
  colorIdentity: string[];
  imageUrl: string | null;
  isBasicLand: boolean;
};

export type DeckV2 = {
  id: string;
  ownerId: string;
  name: string;
  format: DeckFormat;
  description: string | null;
  commanderName: string;
  commanderScryfallId: string | null;
  partnerName: string | null;
  partnerScryfallId: string | null;
  colorIdentity: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  ownerUsername: string;
  ownerDisplayName: string;
  cards: DeckV2Card[];
};
