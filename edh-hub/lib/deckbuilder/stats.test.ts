import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bucketForCmc,
  classifyTypeLine,
  cmcFromManaCost,
  computeDeckStats,
} from "./stats";

describe("cmcFromManaCost", () => {
  it("sums generic and colored symbols", () => {
    assert.equal(cmcFromManaCost("{2}{U}{G}"), 4);
    assert.equal(cmcFromManaCost("{W}{U}{B}{R}{G}"), 5);
  });

  it("treats X as zero", () => {
    assert.equal(cmcFromManaCost("{X}{X}{R}"), 1);
  });

  it("handles numeric hybrid", () => {
    assert.equal(cmcFromManaCost("{2/W}"), 2);
  });

  it("returns 0 for empty", () => {
    assert.equal(cmcFromManaCost(null), 0);
    assert.equal(cmcFromManaCost(""), 0);
  });
});

describe("bucketForCmc", () => {
  it("clamps to 0 and 7+", () => {
    assert.equal(bucketForCmc(0), "0");
    assert.equal(bucketForCmc(3), "3");
    assert.equal(bucketForCmc(7), "7+");
    assert.equal(bucketForCmc(12), "7+");
  });
});

describe("classifyTypeLine", () => {
  it("prefers Creature over Artifact", () => {
    assert.equal(classifyTypeLine("Artifact Creature — Construct"), "Creature");
  });

  it("detects lands and basics", () => {
    assert.equal(classifyTypeLine("Basic Land — Forest", true), "Land");
    assert.equal(classifyTypeLine("Land — Gate"), "Land");
  });
});

describe("computeDeckStats", () => {
  it("builds mana curve for non-land mainboard", () => {
    const stats = computeDeckStats([
      {
        name: "Kinnan, Bonder Prodigy",
        quantity: 1,
        board: "commander",
        manaCost: "{G}{U}",
        typeLine: "Legendary Creature — Elf Druid",
      },
      {
        name: "Sol Ring",
        quantity: 1,
        board: "main",
        manaCost: "{1}",
        typeLine: "Artifact",
      },
      {
        name: "Cultivate",
        quantity: 2,
        board: "main",
        manaCost: "{2}{G}",
        typeLine: "Sorcery",
      },
      {
        name: "Forest",
        quantity: 10,
        board: "main",
        manaCost: null,
        typeLine: "Basic Land — Forest",
        isBasicLand: true,
      },
      {
        name: "Side Spell",
        quantity: 1,
        board: "sideboard",
        manaCost: "{1}{U}",
        typeLine: "Instant",
      },
    ]);

    assert.equal(stats.totalCards, 14); // commander + 1 + 2 + 10
    assert.equal(stats.nonLandMain, 3);
    assert.equal(stats.manaCurve["1"], 1);
    assert.equal(stats.manaCurve["3"], 2);
    assert.equal(stats.types.Creature, 1);
    assert.equal(stats.types.Artifact, 1);
    assert.equal(stats.types.Sorcery, 2);
    assert.equal(stats.types.Land, 10);
    assert.equal(stats.types.Instant, 0); // sideboard ignored
    assert.equal(stats.averageCmc, Math.round(((1 + 3 + 3) / 3) * 100) / 100);
  });
});
