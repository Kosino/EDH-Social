-- Replace legacy event_type values with the four icon-backed kinds.
-- Run after 20261028100000_init.sql in the Supabase SQL editor.
-- Drop the old check FIRST — updates to new labels otherwise violate it.

alter table public.events drop constraint if exists events_event_type_check;

update public.events set event_type = 'cEDH Tournament' where event_type = 'Competitive';
update public.events set event_type = 'Casual Pod' where event_type = 'Casual';
update public.events set event_type = 'Friday Night Magic' where event_type = 'Online';

alter table public.events
  add constraint events_event_type_check
  check (event_type in ('cEDH Tournament', 'EDH Tournament', 'Friday Night Magic', 'Casual Pod'));
