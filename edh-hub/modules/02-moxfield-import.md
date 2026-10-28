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

## Implemented

1. Server Action `importDecklist` — text → Scryfall resolve → `deck_cards`
2. UI `ImportDecklistForm` na `/decks/v2/[id]/edit` (za flagem)
3. SQL `20261029130000_enable_deckbuilder_import.sql`

## Later

- Přímý fetch Moxfield deck URL (API často Cloudflare-blocked)
- Import z profile Moxfield user URL
