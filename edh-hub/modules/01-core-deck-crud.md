# Modul 01 — Core Deck CRUD + Legality Engine

## Scope

- SQL migrace `decks_v2`, `deck_cards`, `card_cache`, `feature_flags`
- `lib/deckbuilder/legality.ts` — čistý engine + unit testy
- `lib/deckbuilder/feature-flags.ts` — `isFeatureEnabled('deckbuilder_core')`
- Server Actions v `app/decks/actions.ts`: `createDeck`, `addCardToDeck`, `removeCardFromDeck`
- UI: create + editor + illegal corner

## Out of scope

- Moxfield import (Modul 02)
- Stats / mana curve (Modul 03)
- Partner commander UI (schema ready, UI later)

## Acceptance

1. Po migraci existují tabulky a flag `deckbuilder_core`.
2. Owner vytvoří deck, přidá/odebere karty.
3. Legality report sedí s pravidly v `architecture/legality-engine.md`.
4. Nelegální karty mají červený roh.
5. Při vypnutém flagu `/decks/new` zůstane legacy formulář.
