-- Modul 02 — zapnout textový import decklistu
update public.feature_flags
set enabled = true,
    description = 'Modul 02 — import textového decklistu (Arena / Moxfield export)',
    updated_at = now()
where key = 'deckbuilder_import';

insert into public.feature_flags (key, enabled, description)
values (
  'deckbuilder_import',
  true,
  'Modul 02 — import textového decklistu (Arena / Moxfield export)'
)
on conflict (key) do update
set enabled = excluded.enabled,
    description = excluded.description,
    updated_at = now();
