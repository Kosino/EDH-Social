/**
 * Modul 03 — pure deck stats (mana curve + type breakdown).
 * Enable with feature flag `deckbuilder_stats`.
 */

export type ManaCurveBucket = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7+";

export const MANA_CURVE_BUCKETS: ManaCurveBucket[] = ["0", "1", "2", "3", "4", "5", "6", "7+"];

export type CardTypeCategory =
  | "Creature"
  | "Instant"
  | "Sorcery"
  | "Artifact"
  | "Enchantment"
  | "Planeswalker"
  | "Battle"
  | "Land"
  | "Other";

export const TYPE_CATEGORIES: CardTypeCategory[] = [
  "Creature",
  "Instant",
  "Sorcery",
  "Artifact",
  "Enchantment",
  "Planeswalker",
  "Battle",
  "Land",
  "Other",
];

export type StatsCardInput = {
  name: string;
  quantity: number;
  board: "main" | "commander" | "sideboard";
  manaCost?: string | null;
  typeLine?: string | null;
  isBasicLand?: boolean;
};

export type DeckStats = {
  totalCards: number;
  nonLandMain: number;
  averageCmc: number | null;
  manaCurve: Record<ManaCurveBucket, number>;
  types: Record<CardTypeCategory, number>;
};

/** Parse Scryfall mana_cost (e.g. `{2}{U}{G}`) into converted mana cost. X/Y/Z = 0. */
export function cmcFromManaCost(manaCost: string | null | undefined): number {
  if (!manaCost) return 0;
  let total = 0;
  const re = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(manaCost)) !== null) {
    const sym = match[1].toUpperCase();
    if (sym === "X" || sym === "Y" || sym === "Z") continue;
    if (/^\d+$/.test(sym)) {
      total += Number(sym);
      continue;
    }
    // Hybrid like 2/W — CMC is the numeric half.
    const numericHybrid = /^(\d+)\/[WUBRGC]$/.exec(sym);
    if (numericHybrid) {
      total += Number(numericHybrid[1]);
      continue;
    }
    // Half mana (½, HW) — count as 0.5 rounded up later via ceil on display; store as 0.5
    if (sym === "1/2" || sym === "½" || sym === "HW" || sym === "HR") {
      total += 0.5;
      continue;
    }
    total += 1;
  }
  return total;
}

export function bucketForCmc(cmc: number): ManaCurveBucket {
  const n = Math.floor(cmc);
  if (n <= 0) return "0";
  if (n >= 7) return "7+";
  return String(n) as ManaCurveBucket;
}

/** Mutually exclusive type for charts. Artifact Creatures → Creature; lands → Land. */
export function classifyTypeLine(
  typeLine: string | null | undefined,
  isBasicLand = false
): CardTypeCategory {
  if (isBasicLand) return "Land";
  const t = (typeLine ?? "").toLowerCase();
  if (!t.trim()) return "Other";
  if (/\bland\b/.test(t)) return "Land";
  if (/\bcreature\b/.test(t)) return "Creature";
  if (/\bplaneswalker\b/.test(t)) return "Planeswalker";
  if (/\bbattle\b/.test(t)) return "Battle";
  if (/\binstant\b/.test(t)) return "Instant";
  if (/\bsorcery\b/.test(t)) return "Sorcery";
  if (/\benchantment\b/.test(t)) return "Enchantment";
  if (/\bartifact\b/.test(t)) return "Artifact";
  return "Other";
}

function emptyCurve(): Record<ManaCurveBucket, number> {
  return { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7+": 0 };
}

function emptyTypes(): Record<CardTypeCategory, number> {
  return {
    Creature: 0,
    Instant: 0,
    Sorcery: 0,
    Artifact: 0,
    Enchantment: 0,
    Planeswalker: 0,
    Battle: 0,
    Land: 0,
    Other: 0,
  };
}

/**
 * Stats for a deck:
 * - Mana curve / avg CMC: main-board non-lands (commander board excluded)
 * - Type counts: main + commander (sideboard excluded)
 */
export function computeDeckStats(cards: StatsCardInput[]): DeckStats {
  const manaCurve = emptyCurve();
  const types = emptyTypes();
  let totalCards = 0;
  let nonLandMain = 0;
  let cmcSum = 0;

  for (const card of cards) {
    if (card.board === "sideboard") continue;
    const qty = Math.max(0, Math.floor(card.quantity) || 0);
    if (qty <= 0) continue;

    if (card.board === "main" || card.board === "commander") {
      totalCards += qty;
      const category = classifyTypeLine(card.typeLine, card.isBasicLand);
      types[category] += qty;
    }

    if (card.board !== "main") continue;

    const isLand =
      card.isBasicLand || classifyTypeLine(card.typeLine, card.isBasicLand) === "Land";
    if (isLand) continue;

    const cmc = cmcFromManaCost(card.manaCost);
    nonLandMain += qty;
    cmcSum += cmc * qty;
    manaCurve[bucketForCmc(cmc)] += qty;
  }

  return {
    totalCards,
    nonLandMain,
    averageCmc: nonLandMain > 0 ? Math.round((cmcSum / nonLandMain) * 100) / 100 : null,
    manaCurve,
    types,
  };
}
