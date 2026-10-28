# Cursor Prompt — Start Taverna u Kosa

Dokumentace:

- `architecture/data-models.sql`
- `architecture/legality-engine.md`
- `architecture/integration-edh-social.md`
- `docs/progressive-rollout.md`
- `modules/01-core-deck-crud.md`
- `modules/02-moxfield-import.md`
- `modules/03-deck-stats.md`
- `skeleton/lib/deckbuilder/legality.ts`

Implementace:

- Modul 01 — `lib/deckbuilder/*`, `app/decks/actions.ts`, `app/decks/v2/*`
- Modul 02 — `lib/deckbuilder/import.ts`, `ImportDecklistForm`, `/taverna/deckbuilder/import`
- Modul 03 — `lib/deckbuilder/stats.ts`, `DeckStatsPanel` (flag `deckbuilder_stats`)

Migrace: `20261029120000_taverna_u_kosa.sql`, `…130000_enable_deckbuilder_import.sql`, `…140000_enable_deckbuilder_stats.sql`.

**UX north star:** Moxfield-like — viz `docs/moxfield-ux.md` (toolbar, levý náhled, visual grid). Platí pro stávající i budoucí Taverna UI.
