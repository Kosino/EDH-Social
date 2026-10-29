-- Playtest sandbox — goldfish against decks_v2
insert into public.feature_flags (key, enabled, description)
values (
  'deckbuilder_playtest',
  true,
  'Taverna playtest sandbox (Moxfield-like goldfish)'
)
on conflict (key) do update
set enabled = excluded.enabled,
    description = excluded.description,
    updated_at = now();
