/**
 * Modul 02 — text / Arena-style decklist import.
 * Enable with feature flag `deckbuilder_import`.
 */

export type ImportedCardLine = {
  quantity: number;
  name: string;
  board: "main" | "commander" | "sideboard";
};

/** Strip set codes / collectors: `Sol Ring (C21)`, `Sol Ring [C21] #123`. */
export function cleanCardName(raw: string): string {
  return raw
    .replace(/\s*[\[(][A-Za-z0-9]+[\])]\s*$/g, "")
    .replace(/\s*#\d+\s*$/g, "")
    .replace(/\s*\/+\s*$/g, "")
    .trim();
}

/** Parse lines like `1 Sol Ring`, `1x Sol Ring`, or section headers. */
export function parseDecklistText(raw: string): ImportedCardLine[] {
  const lines = raw.split(/\r?\n/);
  const out: ImportedCardLine[] = [];
  let board: ImportedCardLine["board"] = "main";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) continue;

    const lower = trimmed.toLowerCase().replace(/:$/, "");
    if (
      lower === "commander" ||
      lower === "commanders" ||
      lower === "commander (1)" ||
      lower.startsWith("commander (")
    ) {
      board = "commander";
      continue;
    }
    if (lower === "sideboard" || lower === "maybeboard" || lower.startsWith("sideboard")) {
      board = "sideboard";
      continue;
    }
    if (
      lower === "deck" ||
      lower === "mainboard" ||
      lower === "main" ||
      lower === "main deck" ||
      lower.startsWith("deck (")
    ) {
      board = "main";
      continue;
    }

    // Moxfield sometimes exports "About" / blank metadata — skip non-card noise
    if (lower.startsWith("https://") || lower.startsWith("http://")) continue;

    const m = trimmed.match(/^(\d+)\s*[xX]?\s+(.+)$/);
    if (m) {
      const name = cleanCardName(m[2]);
      if (name) out.push({ quantity: Math.min(99, Number(m[1]) || 1), name, board });
    } else {
      const name = cleanCardName(trimmed);
      if (name) out.push({ quantity: 1, name, board });
    }
  }

  return out;
}

export function isMoxfieldDeckUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    const host = u.hostname.toLowerCase();
    if (host !== "moxfield.com" && host !== "www.moxfield.com") return false;
    return /^\/decks\/[A-Za-z0-9_-]+\/?$/.test(u.pathname);
  } catch {
    return false;
  }
}
