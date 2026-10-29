/** Client-side playtest (goldfish) — no server persistence. */

export type PlaytestZone =
  | "library"
  | "hand"
  | "battlefield"
  | "graveyard"
  | "exile"
  | "command";

export type PlaytestCard = {
  /** Unique copy in this game (quantity expands to many instances). */
  instanceId: string;
  /** Source `deck_cards.id` (shared across copies). */
  sourceId: string;
  name: string;
  imageUrl: string | null;
  tapped: boolean;
};

export type PlaytestSnapshot = {
  zones: Record<PlaytestZone, PlaytestCard[]>;
  life: number;
  selectedId: string | null;
  rightStack: "graveyard" | "exile";
  lastDice: number | null;
};

export type PlaytestState = PlaytestSnapshot & {
  past: PlaytestSnapshot[];
};

export type PlaytestDeckCard = {
  id: string;
  name: string;
  quantity: number;
  board: "main" | "commander" | "sideboard";
  imageUrl: string | null;
};

export type PlaytestAction =
  | { type: "REPLACE"; state: PlaytestState }
  | { type: "DRAW"; count?: number }
  | { type: "MULLIGAN" }
  | { type: "MOVE"; instanceId: string; to: PlaytestZone; index?: number }
  | { type: "TOGGLE_TAP"; instanceId: string }
  | { type: "SELECT"; instanceId: string | null }
  | { type: "LIFE"; delta: number }
  | { type: "SET_LIFE"; value: number }
  | { type: "DICE" }
  | { type: "UNDO" }
  | { type: "SET_RIGHT_STACK"; stack: "graveyard" | "exile" };
