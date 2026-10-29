import { toReadableCardImage } from "@/lib/deckbuilder/card-image";
import type {
  PlaytestAction,
  PlaytestCard,
  PlaytestDeckCard,
  PlaytestSnapshot,
  PlaytestState,
  PlaytestZone,
} from "@/lib/deckbuilder/playtest-types";

const ZONES: PlaytestZone[] = [
  "library",
  "hand",
  "battlefield",
  "graveyard",
  "exile",
  "command",
];

const MAX_UNDO = 40;

export function startingLife(format: string): number {
  const f = format.toLowerCase();
  if (f === "edh" || f === "cedh" || f === "brawl" || f === "commander") return 40;
  return 20;
}

export function hasCommandZone(format: string): boolean {
  return startingLife(format) === 40;
}

function emptyZones(): Record<PlaytestZone, PlaytestCard[]> {
  return {
    library: [],
    hand: [],
    battlefield: [],
    graveyard: [],
    exile: [],
    command: [],
  };
}

function newInstanceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function expandDeck(cards: PlaytestDeckCard[], includeCommand: boolean): {
  library: PlaytestCard[];
  command: PlaytestCard[];
} {
  const library: PlaytestCard[] = [];
  const command: PlaytestCard[] = [];

  for (const card of cards) {
    if (card.board === "sideboard") continue;
    const qty = Math.max(1, Math.min(99, Number(card.quantity) || 1));
    const imageUrl = toReadableCardImage(card.imageUrl);
    for (let i = 0; i < qty; i++) {
      const instance: PlaytestCard = {
        instanceId: newInstanceId(),
        sourceId: card.id,
        name: card.name,
        imageUrl,
        tapped: false,
      };
      if (includeCommand && card.board === "commander") {
        command.push(instance);
      } else if (card.board === "main") {
        library.push(instance);
      } else if (card.board === "commander" && !includeCommand) {
        // Non-command formats: treat as main for goldfish.
        library.push(instance);
      }
    }
  }

  return { library: shuffleInPlace(library), command };
}

function snapshotOf(state: PlaytestSnapshot): PlaytestSnapshot {
  const zones = emptyZones();
  for (const z of ZONES) {
    zones[z] = state.zones[z].map((c) => ({ ...c }));
  }
  return {
    zones,
    life: state.life,
    selectedId: state.selectedId,
    rightStack: state.rightStack,
    lastDice: state.lastDice,
  };
}

function pushPast(state: PlaytestState): PlaytestState {
  const past = [...state.past, snapshotOf(state)].slice(-MAX_UNDO);
  return { ...state, past };
}

function drawFromLibrary(zones: Record<PlaytestZone, PlaytestCard[]>, count: number) {
  const n = Math.min(count, zones.library.length);
  if (n <= 0) return zones;
  const drawn = zones.library.slice(0, n);
  return {
    ...zones,
    library: zones.library.slice(n),
    hand: [...zones.hand, ...drawn.map((c) => ({ ...c, tapped: false }))],
  };
}

export function createInitialState(
  cards: PlaytestDeckCard[],
  format: string
): PlaytestState {
  const includeCommand = hasCommandZone(format);
  const { library, command } = expandDeck(cards, includeCommand);
  const zones = emptyZones();
  zones.library = library;
  zones.command = command;
  const afterDraw = drawFromLibrary(zones, 7);
  return {
    zones: afterDraw,
    life: startingLife(format),
    selectedId: null,
    rightStack: "graveyard",
    lastDice: null,
    past: [],
  };
}

function findCard(
  zones: Record<PlaytestZone, PlaytestCard[]>,
  instanceId: string
): { zone: PlaytestZone; index: number; card: PlaytestCard } | null {
  for (const zone of ZONES) {
    const index = zones[zone].findIndex((c) => c.instanceId === instanceId);
    if (index >= 0) return { zone, index, card: zones[zone][index] };
  }
  return null;
}

function moveCard(
  zones: Record<PlaytestZone, PlaytestCard[]>,
  instanceId: string,
  to: PlaytestZone,
  index?: number
): Record<PlaytestZone, PlaytestCard[]> | null {
  const found = findCard(zones, instanceId);
  if (!found) return null;
  const next = emptyZones();
  for (const z of ZONES) {
    next[z] = [...zones[z]];
  }
  const [card] = next[found.zone].splice(found.index, 1);
  if (!card) return null;
  const moved = {
    ...card,
    tapped: to === "battlefield" ? card.tapped : false,
  };
  const at =
    typeof index === "number"
      ? Math.max(0, Math.min(index, next[to].length))
      : next[to].length;
  next[to].splice(at, 0, moved);
  return next;
}

export function playtestReducer(state: PlaytestState, action: PlaytestAction): PlaytestState {
  switch (action.type) {
    case "UNDO": {
      if (!state.past.length) return state;
      const past = [...state.past];
      const prev = past.pop()!;
      return { ...prev, past };
    }
    case "SELECT":
      return { ...state, selectedId: action.instanceId };
    case "SET_RIGHT_STACK":
      return { ...state, rightStack: action.stack };
    case "SET_LIFE":
      return { ...pushPast(state), life: Math.max(0, action.value), lastDice: state.lastDice };
    case "LIFE":
      return {
        ...pushPast(state),
        life: Math.max(0, state.life + action.delta),
      };
    case "DICE":
      return {
        ...state,
        lastDice: 1 + Math.floor(Math.random() * 6),
      };
    case "TOGGLE_TAP": {
      const found = findCard(state.zones, action.instanceId);
      if (!found || found.zone !== "battlefield") return state;
      const withPast = pushPast(state);
      const battlefield = withPast.zones.battlefield.map((c) =>
        c.instanceId === action.instanceId ? { ...c, tapped: !c.tapped } : c
      );
      return {
        ...withPast,
        zones: { ...withPast.zones, battlefield },
      };
    }
    case "DRAW": {
      const count = action.count ?? 1;
      if (state.zones.library.length === 0) return state;
      const withPast = pushPast(state);
      return {
        ...withPast,
        zones: drawFromLibrary(withPast.zones, count),
        selectedId: null,
      };
    }
    case "MULLIGAN": {
      const withPast = pushPast(state);
      // Put hand + battlefield + GY + exile back to library, keep command, reshuffle, draw 7.
      const pool = [
        ...withPast.zones.library,
        ...withPast.zones.hand,
        ...withPast.zones.battlefield,
        ...withPast.zones.graveyard,
        ...withPast.zones.exile,
      ].map((c) => ({ ...c, tapped: false }));
      shuffleInPlace(pool);
      const zones = emptyZones();
      zones.command = withPast.zones.command.map((c) => ({ ...c, tapped: false }));
      zones.library = pool;
      return {
        ...withPast,
        zones: drawFromLibrary(zones, 7),
        selectedId: null,
        lastDice: null,
      };
    }
    case "MOVE": {
      const nextZones = moveCard(state.zones, action.instanceId, action.to, action.index);
      if (!nextZones) return state;
      const withPast = pushPast(state);
      return {
        ...withPast,
        zones: nextZones,
        selectedId: action.instanceId,
      };
    }
    case "REPLACE":
      return action.state;
    default:
      return state;
  }
}

export function zoneLabel(zone: PlaytestZone): string {
  switch (zone) {
    case "library":
      return "Library";
    case "hand":
      return "Hand";
    case "battlefield":
      return "Battlefield";
    case "graveyard":
      return "Graveyard";
    case "exile":
      return "Exile";
    case "command":
      return "Command";
  }
}
