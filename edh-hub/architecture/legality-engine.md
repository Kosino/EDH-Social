# Legality Engine — Taverna u Kosa

Samostatná čistá služba v `lib/deckbuilder/legality.ts`. Žádné DB volání — vstup = deck snapshot, výstup = report.

## Formáty

- `EDH` / `cEDH` — stejná struktura Commander (100 karet vč. commanderů).
- cEDH banlist může být přísnější (Modul 01: sdílený seed banlist).

## Pravidla (Modul 01)

1. **Velikost** — součet `quantity` na board `main` + `commander` = 100.
2. **Commander** — 1 karta na board `commander` (nebo 2 při partnerovi).
3. **Singleton** — mimo basic lands max 1× jméno v main+commander.
4. **Color identity** — každá karta ⊆ deck `color_identity` (z commanderů).
5. **Banlist** — karta na banlistu formátu → illegal.
6. **Commander legal** — karta v commander zóně musí být legendary creature / allowed commander (Modul 01: kontrolujeme ban + identity; strict type check volitelně soft-warning).

## Výstup

```ts
type LegalityIssue = {
  code: string;
  severity: "error" | "warning";
  message: string;
  cardName?: string;
};

type CardLegality = {
  name: string;
  board: string;
  legal: boolean;
  reasons: string[];
};

type LegalityReport = {
  legal: boolean;
  cardCount: number;
  issues: LegalityIssue[];
  cards: CardLegality[];
};
```

Nelegální karty v UI: CSS `deck-card--illegal` (červený pravý horní roh).
