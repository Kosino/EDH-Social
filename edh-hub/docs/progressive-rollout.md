# Progressive rollout — Taverna u Kosa

1. **Modul 01** — Core CRUD + legality (`deckbuilder_core`)
2. **Modul 02** — Import (`deckbuilder_import`)
3. **Modul 03** — Stats (`deckbuilder_stats`) — mana curve + type breakdown

Flag vypnutý = legacy `/decks` UX beze změny. Zapnutí per-key v `feature_flags`.

UX směr (všechny Taverna obrazovky): `docs/moxfield-ux.md`.

| Flag | Migrace enable |
| --- | --- |
| `deckbuilder_core` | `20261029120000_taverna_u_kosa.sql` (default on) |
| `deckbuilder_import` | `20261029130000_enable_deckbuilder_import.sql` |
| `deckbuilder_stats` | `20261029140000_enable_deckbuilder_stats.sql` |
