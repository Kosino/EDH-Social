import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateDeckLegality, hasPartnerAbility, identityContains } from "./legality";

function land(name: string, n = 1) {
  return {
    name,
    quantity: n,
    board: "main" as const,
    colorIdentity: [] as string[],
    isBasicLand: true,
  };
}

describe("identityContains", () => {
  it("allows subset", () => {
    assert.equal(identityContains(["U", "B"], ["U"]), true);
    assert.equal(identityContains(["U", "B"], ["U", "B", "R"]), false);
  });
});

describe("evaluateDeckLegality", () => {
  it("requires 100 cards and a commander", () => {
    const report = evaluateDeckLegality({
      format: "EDH",
      colorIdentity: ["G"],
      cards: [
        {
          name: "Kinnan, Bonder Prodigy",
          quantity: 1,
          board: "commander",
          colorIdentity: ["G", "U"],
        },
        land("Forest", 98),
      ],
    });
    assert.equal(report.cardCount, 99);
    assert.equal(report.legal, false);
    assert.ok(report.issues.some((i) => i.code === "deck_size"));
  });

  it("flags banned cards", () => {
    const report = evaluateDeckLegality({
      format: "EDH",
      colorIdentity: ["B"],
      cards: [
        {
          name: "K'rrik, Son of Yawgmoth",
          quantity: 1,
          board: "commander",
          colorIdentity: ["B"],
        },
        { name: "Mana Crypt", quantity: 1, board: "main", colorIdentity: [] },
        land("Swamp", 98),
      ],
    });
    assert.equal(report.legal, false);
    assert.ok(report.issues.some((i) => i.code === "banned"));
    const crypt = report.cards.find((c) => c.name === "Mana Crypt");
    assert.equal(crypt?.legal, false);
  });

  it("flags color identity breaks", () => {
    const report = evaluateDeckLegality({
      format: "EDH",
      colorIdentity: ["G"],
      cards: [
        {
          name: "Selvala, Heart of the Wilds",
          quantity: 1,
          board: "commander",
          colorIdentity: ["G"],
        },
        {
          name: "Counterspell",
          quantity: 1,
          board: "main",
          colorIdentity: ["U"],
        },
        land("Forest", 98),
      ],
    });
    assert.ok(report.issues.some((i) => i.code === "color_identity"));
  });

  it("allows basic land duplicates", () => {
    const report = evaluateDeckLegality({
      format: "EDH",
      colorIdentity: ["G"],
      cards: [
        {
          name: "Selvala, Heart of the Wilds",
          quantity: 1,
          board: "commander",
          colorIdentity: ["G"],
        },
        land("Forest", 99),
      ],
    });
    assert.equal(report.cardCount, 100);
    assert.ok(!report.issues.some((i) => i.code === "singleton"));
  });

  it("allows two partner commanders", () => {
    const report = evaluateDeckLegality({
      format: "EDH",
      colorIdentity: ["W", "B"],
      cards: [
        {
          name: "Tymna the Weaver",
          quantity: 1,
          board: "commander",
          colorIdentity: ["W", "B"],
          oracleText: "Partner\nAt the beginning of your postcombat main phase…",
        },
        {
          name: "Thrasios, Triton Hero",
          quantity: 1,
          board: "commander",
          colorIdentity: ["G", "U"],
          oracleText: "{4}: Scry 1…\nPartner",
        },
        land("Plains", 98),
      ],
    });
    assert.ok(!report.issues.some((i) => i.code === "partner_required"));
    assert.ok(!report.issues.some((i) => i.code === "too_many_commanders"));
  });

  it("flags dual commanders without partner", () => {
    const report = evaluateDeckLegality({
      format: "EDH",
      colorIdentity: ["G", "U"],
      cards: [
        {
          name: "Kinnan, Bonder Prodigy",
          quantity: 1,
          board: "commander",
          colorIdentity: ["G", "U"],
          oracleText: "Whenever you tap a nonland permanent…",
        },
        {
          name: "Selvala, Heart of the Wilds",
          quantity: 1,
          board: "commander",
          colorIdentity: ["G"],
          oracleText: "{G}: Add X mana…",
        },
        land("Forest", 98),
      ],
    });
    assert.ok(report.issues.some((i) => i.code === "partner_required"));
  });
});

describe("hasPartnerAbility", () => {
  it("detects Partner and Friends forever", () => {
    assert.equal(hasPartnerAbility("Partner"), true);
    assert.equal(hasPartnerAbility("Partner with Malcolm, Keen-Eyed Navigator"), true);
    assert.equal(hasPartnerAbility("Friends forever"), true);
    assert.equal(hasPartnerAbility("Just a dragon."), false);
  });
});
