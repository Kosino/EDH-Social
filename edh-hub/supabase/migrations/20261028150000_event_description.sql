-- Optional event description for detail pages (mock "Swiss + Top Cut" line).
-- Run after 20261028100000_init.sql in the Supabase SQL editor.

alter table public.events
  add column if not exists description text;

alter table public.events
  drop constraint if exists events_description_length;

alter table public.events
  add constraint events_description_length
  check (description is null or char_length(description) <= 500);
