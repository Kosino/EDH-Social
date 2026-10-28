-- Part 2 one-paste bundle for live Supabase project dbkaununwsckijzgdvjy.
-- Safe to re-run: IF NOT EXISTS / drop-if-exists where needed.
-- Order: posts.kind → event_kinds remap → events.description

-- 1) posts.kind (articles MVP)
alter table public.posts
  add column if not exists kind text not null default 'post'
  check (kind in ('post', 'article'));

create index if not exists posts_kind_created_at_idx
  on public.posts (kind, created_at desc);

-- 2) event kinds (icon-backed four values)
update public.events set event_type = 'cEDH Tournament' where event_type = 'Competitive';
update public.events set event_type = 'Casual Pod' where event_type = 'Casual';
update public.events set event_type = 'Friday Night Magic' where event_type = 'Online';

alter table public.events drop constraint if exists events_event_type_check;

alter table public.events
  add constraint events_event_type_check
  check (event_type in ('cEDH Tournament', 'EDH Tournament', 'Friday Night Magic', 'Casual Pod'));

-- 3) event description (detail page)
alter table public.events
  add column if not exists description text;

alter table public.events
  drop constraint if exists events_description_length;

alter table public.events
  add constraint events_description_length
  check (description is null or char_length(description) <= 500);
