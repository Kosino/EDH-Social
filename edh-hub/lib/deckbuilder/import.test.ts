import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDecklistText } from "./import";

describe("parseDecklistText", () => {
  it("parses quantities and sections", () => {
    const cards = parseDecklistText(`
Commander
1 Selvala, Heart of the Wilds
Deck
1 Sol Ring
99 Forest
`);
    assert.equal(cards[0]?.board, "commander");
    assert.equal(cards[1]?.name, "Sol Ring");
    assert.equal(cards[2]?.quantity, 99);
  });
});
