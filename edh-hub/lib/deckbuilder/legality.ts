/** Pure Commander / EDH legality engine (Taverna u Kosa Modul 01). */

export type DeckFormat = "EDH" | "cEDH";

export type DeckCardInput = {
  name: string;
  quantity: number;
  board: "main" | "commander" | "sideboard";
  colorIdentity?: string[];
  isBasicLand?: boolean;
  typeLine?: string | null;
  oracleText?: string | null;
};

/** Partner / Partner with / Friends forever (command zone dual commanders). */
export function hasPartnerAbility(oracleText: string | null | undefined): boolean {
  const t = (oracleText ?? "").toLowerCase();
  if (!t.trim()) return false;
  if (/\bfriends forever\b/.test(t)) return true;
  if (/\bpartner with\b/.test(t)) return true;
  // Keyword line "Partner" (avoid "partnership", "partners")
  return /(^|\n)\s*partner\s*(\n|$|\.|;)/.test(t) || /\bpartner\b(?!\s*with)/.test(t);
}

export type DeckSnapshot = {
  format: DeckFormat;
  colorIdentity: string[];
  cards: DeckCardInput[];
};

export type LegalityIssue = {
  code: string;
  severity: "error" | "warning";
  message: string;
  cardName?: string;
};

export type CardLegality = {
  name: string;
  board: DeckCardInput["board"];
  legal: boolean;
  reasons: string[];
};

export type LegalityReport = {
  legal: boolean;
  cardCount: number;
  issues: LegalityIssue[];
  cards: CardLegality[];
};

/** Seed banlist — Modul 01. Rozšiřitelný bez DB. */
export const EDH_BANNED = new Set(
  [
    "Ancestral Recall",
    "Balance",
    "Biorhythm",
    "Black Lotus",
    "Channel",
    "Chaos Orb",
    "Dockside Extortionist",
    "Emrakul, the Aeons Torn",
    "Erayo, Soratami Ascendant",
    "Falling Star",
    "Fastbond",
    "Flash",
    "Golos, Tireless Pilgrim",
    "Griselbrand",
    "Hullbreacher",
    "Iona, Shield of Emeria",
    "Jeweled Lotus",
    "Karakas",
    "Leovold, Emissary of Trest",
    "Library of Alexandria",
    "Limited Resources",
    "Lutri, the Spellchaser",
    "Mana Crypt",
    "Mox Emerald",
    "Mox Jet",
    "Mox Pearl",
    "Mox Ruby",
    "Mox Sapphire",
    "Nadu, Winged Wisdom",
    "Paradox Engine",
    "Primeval Titan",
    "Prophet of Kruphix",
    "Recurring Nightmare",
    "Rofellos, Llanowar Emissary",
    "Shahrazad",
    "Sundering Titan",
    "Sylvan Primordial",
    "Time Vault",
    "Tinker",
    "Tolarian Academy",
    "Trade Secrets",
    "Upheaval",
    "Yawgmoth's Bargain",
  ].map((n) => n.toLowerCase())
);

const COLOR_ORDER = ["W", "U", "B", "R", "G"] as const;

export function normalizeColorIdentity(colors: string[] | null | undefined): string[] {
  const set = new Set((colors ?? []).map((c) => c.toUpperCase()));
  return COLOR_ORDER.filter((c) => set.has(c));
}

export function identityContains(deckIdentity: string[], cardIdentity: string[]): boolean {
  const deck = new Set(normalizeColorIdentity(deckIdentity));
  return normalizeColorIdentity(cardIdentity).every((c) => deck.has(c));
}

function countedBoards(card: DeckCardInput) {
  return card.board === "main" || card.board === "commander";
}

/**
 * Evaluate a deck snapshot. Sideboard is ignored for size / singleton / identity
 * (Modul 01: sideboard not used in EDH play, still flagged if banned).
 */
export function evaluateDeckLegality(deck: DeckSnapshot): LegalityReport {
  const issues: LegalityIssue[] = [];
  const cardReports: CardLegality[] = [];
  const counted = deck.cards.filter(countedBoards);
  const cardCount = counted.reduce((sum, c) => sum + Math.max(0, c.quantity), 0);

  if (cardCount !== 100) {
    issues.push({
      code: "deck_size",
      severity: "error",
      message: `Deck má ${cardCount} karet (main+commander), musí mít přesně 100.`,
    });
  }

  const commanders = deck.cards.filter((c) => c.board === "commander");
  const commanderQty = commanders.reduce((s, c) => s + c.quantity, 0);
  if (commanderQty < 1) {
    issues.push({
      code: "missing_commander",
      severity: "error",
      message: "Chybí commander.",
    });
  } else if (commanderQty > 2) {
    issues.push({
      code: "too_many_commanders",
      severity: "error",
      message: `Commander zóna má ${commanderQty} karet (max 2 při partnerovi).`,
    });
  } else if (commanderQty === 2) {
    const withOracle = commanders.filter((c) => (c.oracleText ?? "").trim().length > 0);
    if (withOracle.length === commanders.length) {
      const missing = withOracle.filter((c) => !hasPartnerAbility(c.oracleText));
      if (missing.length > 0) {
        issues.push({
          code: "partner_required",
          severity: "error",
          message:
            "Dva commandeři vyžadují Partner / Partner with / Friends forever na obou kartách.",
        });
      }
    }
  }

  const nameCounts = new Map<string, { qty: number; basic: boolean }>();
  for (const card of counted) {
    const key = card.name.trim().toLowerCase();
    const prev = nameCounts.get(key) ?? { qty: 0, basic: Boolean(card.isBasicLand) };
    prev.qty += card.quantity;
    prev.basic = prev.basic || Boolean(card.isBasicLand);
    nameCounts.set(key, prev);
  }

  for (const [name, { qty, basic }] of nameCounts) {
    if (!basic && qty > 1) {
      issues.push({
        code: "singleton",
        severity: "error",
        message: `„${name}“ je ${qty}× — v Commandoru platí singleton (kromě basic lands).`,
        cardName: name,
      });
    }
  }

  for (const card of deck.cards) {
    const reasons: string[] = [];
    const banned = EDH_BANNED.has(card.name.trim().toLowerCase());
    if (banned) {
      reasons.push("Karta je na banlistu Commandoru.");
      issues.push({
        code: "banned",
        severity: "error",
        message: `„${card.name}“ je banned.`,
        cardName: card.name,
      });
    }

    if (countedBoards(card) && card.colorIdentity) {
      if (!identityContains(deck.colorIdentity, card.colorIdentity)) {
        reasons.push("Color identity mimo commandera.");
        issues.push({
          code: "color_identity",
          severity: "error",
          message: `„${card.name}“ porušuje color identity.`,
          cardName: card.name,
        });
      }
    }

    if (!card.isBasicLand && countedBoards(card) && card.quantity > 1) {
      reasons.push("Singleton: max 1 kopie.");
    }

    cardReports.push({
      name: card.name,
      board: card.board,
      legal: reasons.length === 0,
      reasons,
    });
  }

  const legal = !issues.some((i) => i.severity === "error");
  return { legal, cardCount, issues, cards: cardReports };
}

/** Map of card name → illegal (for UI corner badge). */
export function illegalCardNames(report: LegalityReport): Set<string> {
  return new Set(report.cards.filter((c) => !c.legal).map((c) => c.name.toLowerCase()));
}
