-- Modul 03 — zapni mana curve / type stats
update public.feature_flags
set enabled = true,
    description = 'Modul 03 — mana curve / type stats',
    updated_at = now()
where key = 'deckbuilder_stats';

insert into public.feature_flags (key, enabled, description)
values (
  'deckbuilder_stats',
  true,
  'Modul 03 — mana curve / type stats'
)
on conflict (key) do update
set enabled = excluded.enabled,
    description = excluded.description,
    updated_at = now();
