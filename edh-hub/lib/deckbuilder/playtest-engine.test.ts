import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createInitialState,
  playtestReducer,
  startingLife,
} from "./playtest-engine";
import type { PlaytestDeckCard } from "./playtest-types";

const sample: PlaytestDeckCard[] = [
  {
    id: "cmd",
    name: "Tymna the Weaver",
    quantity: 1,
    board: "commander",
    imageUrl: null,
  },
  {
    id: "sol",
    name: "Sol Ring",
    quantity: 1,
    board: "main",
    imageUrl: null,
  },
  {
    id: "land",
    name: "Island",
    quantity: 10,
    board: "main",
    imageUrl: null,
  },
  {
    id: "sb",
    name: "Force of Will",
    quantity: 1,
    board: "sideboard",
    imageUrl: null,
  },
];

describe("playtest-engine", () => {
  it("starts EDH at 40 life with command zone and 7-card hand", () => {
    assert.equal(startingLife("EDH"), 40);
    const state = createInitialState(sample, "EDH");
    assert.equal(state.life, 40);
    assert.equal(state.zones.command.length, 1);
    assert.equal(state.zones.hand.length, 7);
    assert.equal(state.zones.exile.length, 0);
    // 1 commander + 11 main - 7 drawn = 4 in library; sideboard excluded
    assert.equal(state.zones.library.length, 4);
    assert.ok(!state.zones.library.some((c) => c.name === "Force of Will"));
  });

  it("draw moves one card from library to hand", () => {
    const state = createInitialState(sample, "EDH");
    const next = playtestReducer(state, { type: "DRAW" });
    assert.equal(next.zones.hand.length, state.zones.hand.length + 1);
    assert.equal(next.zones.library.length, state.zones.library.length - 1);
  });

  it("undo restores prior snapshot", () => {
    const state = createInitialState(sample, "EDH");
    const after = playtestReducer(state, { type: "LIFE", delta: -1 });
    assert.equal(after.life, 39);
    const undone = playtestReducer(after, { type: "UNDO" });
    assert.equal(undone.life, 40);
  });

  it("move puts selected card onto battlefield", () => {
    const state = createInitialState(sample, "EDH");
    const card = state.zones.hand[0];
    assert.ok(card);
    const next = playtestReducer(state, {
      type: "MOVE",
      instanceId: card.instanceId,
      to: "battlefield",
    });
    assert.ok(next.zones.battlefield.some((c) => c.instanceId === card.instanceId));
    assert.ok(!next.zones.hand.some((c) => c.instanceId === card.instanceId));
  });
});
