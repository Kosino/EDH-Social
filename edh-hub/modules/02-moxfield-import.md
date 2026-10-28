# Modul 02 — Moxfield / list import (next)

## Scope (po Modulu 01)

- Feature flag `deckbuilder_import`
- Import deck listu (text / Moxfield URL když API dostupné)
- Mapování řádků → `deck_cards` + legality refresh
- UI: „Importovat seznam“ v editoru

## Depends on

- Modul 01 (`decks_v2`, legality, feature flags)

## Started

- Parser skeleton: `lib/deckbuilder/import.ts` + unit test
- Flag `deckbuilder_import` (default off) in migraci
- Editor hint na `/decks/v2/[id]/edit`

## Next implementation steps

1. Server Action `importDecklist` (text → resolve Scryfall → `deck_cards`)
2. Optional Moxfield deck URL fetch when API reachable
3. UI form behind `isFeatureEnabled('deckbuilder_import')`
