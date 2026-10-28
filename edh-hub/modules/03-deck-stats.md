# Modul 03 — Deck stats (mana curve + types)

## Scope

- Feature flag `deckbuilder_stats`
- Pure engine `lib/deckbuilder/stats.ts` (CMC z `mana_cost`, typy z `type_line`)
- Unit testy `lib/deckbuilder/stats.test.ts`
- UI `DeckStatsPanel` na detailu a editoru decku (`/decks/v2/[id]`, `/edit`)

## Depends on

- Modul 01 (`decks_v2`, `deck_cards` s `mana_cost` / `type_line`)

## Rules

- Mana curve + avg CMC: main-board non-lands (commander board vyloučen)
- Type counts: main + commander (sideboard vyloučen)
- Artifact Creature → Creature; Land → Land

## Acceptance

1. Flag vypnutý = žádný stats panel.
2. Flag zapnutý = curve 0–6 / 7+ + type bars.
3. `npm run test:deckbuilder` prochází včetně stats testů.

## Enable

```sql
-- supabase/migrations/20261029140000_enable_deckbuilder_stats.sql
update public.feature_flags set enabled = true, updated_at = now()
where key = 'deckbuilder_stats';
```
