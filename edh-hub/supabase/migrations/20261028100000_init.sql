-- EDH Hub: profiles, posts, decks, events.
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- The publishable key cannot create tables; this file has to run as the database owner.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name text,
  bio text,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  excerpt text,
  body text,
  deck_name text,
  kind text not null default 'post' check (kind in ('post', 'article')),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_kind_created_at_idx on public.posts (kind, created_at desc);

create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  format text not null check (format in ('EDH', 'cEDH')),
  commander text not null check (char_length(commander) between 1 and 120),
  moxfield_url text,
  created_at timestamptz not null default now()
);

create index if not exists decks_owner_id_idx on public.decks (owner_id);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  event_type text not null check (event_type in ('cEDH Tournament', 'EDH Tournament', 'Friday Night Magic', 'Casual Pod')),
  starts_at timestamptz not null,
  location text,
  created_at timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.decks enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.posts, public.decks, public.events, public.event_rsvps to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.posts, public.decks, public.events, public.event_rsvps to authenticated;

drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists posts_select_all on public.posts;
create policy posts_select_all on public.posts
  for select to anon, authenticated using (true);

drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own on public.posts
  for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists posts_update_own on public.posts;
create policy posts_update_own on public.posts
  for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists posts_delete_own on public.posts;
create policy posts_delete_own on public.posts
  for delete to authenticated using (auth.uid() = author_id);

drop policy if exists decks_select_all on public.decks;
create policy decks_select_all on public.decks
  for select to anon, authenticated using (true);

drop policy if exists decks_insert_own on public.decks;
create policy decks_insert_own on public.decks
  for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists decks_update_own on public.decks;
create policy decks_update_own on public.decks
  for update to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists decks_delete_own on public.decks;
create policy decks_delete_own on public.decks
  for delete to authenticated using (auth.uid() = owner_id);

drop policy if exists events_select_all on public.events;
create policy events_select_all on public.events
  for select to anon, authenticated using (true);

drop policy if exists events_insert_own on public.events;
create policy events_insert_own on public.events
  for insert to authenticated with check (auth.uid() = host_id);

drop policy if exists events_update_own on public.events;
create policy events_update_own on public.events
  for update to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

drop policy if exists events_delete_own on public.events;
create policy events_delete_own on public.events
  for delete to authenticated using (auth.uid() = host_id);

drop policy if exists event_rsvps_select_all on public.event_rsvps;
create policy event_rsvps_select_all on public.event_rsvps
  for select to anon, authenticated using (true);

drop policy if exists event_rsvps_insert_own on public.event_rsvps;
create policy event_rsvps_insert_own on public.event_rsvps
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists event_rsvps_delete_own on public.event_rsvps;
create policy event_rsvps_delete_own on public.event_rsvps
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned text;
begin
  cleaned := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(coalesce(new.email, 'player'), '@', 1)
  );
  cleaned := lower(regexp_replace(cleaned, '[^a-zA-Z0-9_]', '', 'g'));
  if cleaned is null or char_length(cleaned) < 3 then
    cleaned := 'player';
  end if;
  cleaned := left(cleaned, 20);

  if exists (
    select 1 from public.profiles where lower(username) = lower(cleaned)
  ) then
    cleaned := left(cleaned, 14) || '_' || substr(replace(new.id::text, '-', ''), 1, 5);
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, cleaned, cleaned);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
