import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fetchCardNameSuggestions } from "./scryfall-autocomplete";

describe("fetchCardNameSuggestions", () => {
  it("returns [] for short queries", async () => {
    assert.deepEqual(await fetchCardNameSuggestions("a"), []);
    assert.deepEqual(await fetchCardNameSuggestions(" "), []);
  });

  it("autocomplete mode finds Sol Ring", async () => {
    const names = await fetchCardNameSuggestions("sol r", "any");
    assert.ok(names.some((n) => n.toLowerCase().includes("sol ring")));
  });

  it("commander mode prefers name matches over oracle text", async () => {
    const names = await fetchCardNameSuggestions("tym", "commander");
    assert.ok(names.includes("Tymna the Weaver"));
    assert.ok(!names.includes("Photon, Mighty Marvel"));
  });
});
