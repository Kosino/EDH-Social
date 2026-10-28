# Integrace Taverna u Kosa → EDH Social

## Auth

- Session přes existující Supabase Auth (`getCurrentUser()` → `user.id` = `profiles.id`).
- Server Actions stejný pattern jako `app/create/actions.ts`.
- RLS: owner CRUD na `decks_v2` / `deck_cards`; veřejné čtení `is_public = true`.

## Legacy decks

- Tabulka `public.decks` **beze změny** (profilové dlaždice, Moxfield odkaz).
- Taverna používá `decks_v2` + `deck_cards`.
- Feature flag `deckbuilder_core` přepíná `/decks/new` mezi legacy formulářem a Taverna create.

## Feature flags

- Tabulka `feature_flags`, helper `lib/deckbuilder/feature-flags.ts`.
- Klíč Modul 01: `deckbuilder_core`.

## Routy (Modul 01)

| Route | Účel |
| --- | --- |
| `/decks/new` | Create (flag → Taverna / legacy) |
| `/decks/v2/[id]` | Detail + legality report |
| `/decks/v2/[id]/edit` | Editor (add/remove cards) |

## Scryfall

- Lookup při add card přes `lib/scryfall.ts` + zápis do `card_cache` (best-effort).
