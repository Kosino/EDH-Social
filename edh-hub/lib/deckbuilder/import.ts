/**
 * Modul 02 — Moxfield / text list import (skeleton).
 * Enable with feature flag `deckbuilder_import`.
 */

export type ImportedCardLine = {
  quantity: number;
  name: string;
  board: "main" | "commander" | "sideboard";
};

/** Parse lines like `1 Sol Ring` or `Sol Ring`. */
export function parseDecklistText(raw: string): ImportedCardLine[] {
  const lines = raw.split(/\r?\n/);
  const out: ImportedCardLine[] = [];
  let board: ImportedCardLine["board"] = "main";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) continue;
    const lower = trimmed.toLowerCase();
    if (lower === "commander" || lower === "commanders:") {
      board = "commander";
      continue;
    }
    if (lower === "sideboard" || lower === "sideboard:") {
      board = "sideboard";
      continue;
    }
    if (lower === "deck" || lower === "mainboard" || lower === "main:") {
      board = "main";
      continue;
    }

    const m = trimmed.match(/^(\d+)\s*[xX]?\s+(.+)$/);
    if (m) {
      out.push({ quantity: Math.min(99, Number(m[1]) || 1), name: m[2].trim(), board });
    } else {
      out.push({ quantity: 1, name: trimmed, board });
    }
  }

  return out;
}
