import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cleanCardName, parseDecklistText } from "./import";

describe("cleanCardName", () => {
  it("strips set codes", () => {
    assert.equal(cleanCardName("Sol Ring (C21)"), "Sol Ring");
    assert.equal(cleanCardName("Sol Ring [C21]"), "Sol Ring");
  });
});

describe("parseDecklistText", () => {
  it("parses quantities and sections", () => {
    const cards = parseDecklistText(`
Commander
1 Selvala, Heart of the Wilds
Deck
1 Sol Ring (C21)
99 Forest
`);
    assert.equal(cards[0]?.board, "commander");
    assert.equal(cards[1]?.name, "Sol Ring");
    assert.equal(cards[2]?.quantity, 99);
  });
});
