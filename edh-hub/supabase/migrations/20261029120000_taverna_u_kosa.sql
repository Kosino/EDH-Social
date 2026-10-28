-- Taverna u Kosa — Modul 01 (decks_v2 + legality support tables)
-- Legacy public.decks remains unchanged.

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

insert into public.feature_flags (key, enabled, description)
values
  ('deckbuilder_core', true, 'Taverna u Kosa — core deck CRUD + legality'),
  ('deckbuilder_import', false, 'Modul 02 — import Moxfield/Arena'),
  ('deckbuilder_stats', false, 'Modul 03 — mana curve / type stats')
on conflict (key) do nothing;

create table if not exists public.decks_v2 (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  format text not null check (format in ('EDH', 'cEDH')),
  description text check (description is null or char_length(description) <= 1000),
  commander_name text not null check (char_length(commander_name) between 1 and 160),
  commander_scryfall_id text,
  partner_name text check (partner_name is null or char_length(partner_name) <= 160),
  partner_scryfall_id text,
  color_identity text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists decks_v2_owner_id_idx on public.decks_v2 (owner_id);
create index if not exists decks_v2_updated_at_idx on public.decks_v2 (updated_at desc);

create table if not exists public.deck_cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks_v2 (id) on delete cascade,
  scryfall_id text,
  name text not null check (char_length(name) between 1 and 200),
  quantity integer not null default 1 check (quantity between 1 and 99),
  board text not null default 'main' check (board in ('main', 'commander', 'sideboard')),
  mana_cost text,
  type_line text,
  oracle_text text,
  color_identity text[] not null default '{}',
  image_url text,
  is_basic_land boolean not null default false,
  created_at timestamptz not null default now(),
  unique (deck_id, name, board)
);

create index if not exists deck_cards_deck_id_idx on public.deck_cards (deck_id);

create table if not exists public.card_cache (
  scryfall_id text primary key,
  name text not null,
  mana_cost text,
  type_line text,
  oracle_text text,
  color_identity text[] not null default '{}',
  image_url text,
  is_basic_land boolean not null default false,
  legalities jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;
alter table public.decks_v2 enable row level security;
alter table public.deck_cards enable row level security;
alter table public.card_cache enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.feature_flags to anon, authenticated;
grant select, insert, update, delete on public.decks_v2 to authenticated;
grant select on public.decks_v2 to anon;
grant select, insert, update, delete on public.deck_cards to authenticated;
grant select on public.deck_cards to anon;
grant select, insert, update on public.card_cache to authenticated;
grant select on public.card_cache to anon;

drop policy if exists feature_flags_select_all on public.feature_flags;
create policy feature_flags_select_all on public.feature_flags
  for select using (true);

drop policy if exists decks_v2_select_public_or_owner on public.decks_v2;
create policy decks_v2_select_public_or_owner on public.decks_v2
  for select using (is_public = true or auth.uid() = owner_id);

drop policy if exists decks_v2_insert_own on public.decks_v2;
create policy decks_v2_insert_own on public.decks_v2
  for insert with check (auth.uid() = owner_id);

drop policy if exists decks_v2_update_own on public.decks_v2;
create policy decks_v2_update_own on public.decks_v2
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists decks_v2_delete_own on public.decks_v2;
create policy decks_v2_delete_own on public.decks_v2
  for delete using (auth.uid() = owner_id);

drop policy if exists deck_cards_select_visible on public.deck_cards;
create policy deck_cards_select_visible on public.deck_cards
  for select using (
    exists (
      select 1 from public.decks_v2 d
      where d.id = deck_id and (d.is_public = true or d.owner_id = auth.uid())
    )
  );

drop policy if exists deck_cards_insert_own on public.deck_cards;
create policy deck_cards_insert_own on public.deck_cards
  for insert with check (
    exists (
      select 1 from public.decks_v2 d
      where d.id = deck_id and d.owner_id = auth.uid()
    )
  );

drop policy if exists deck_cards_update_own on public.deck_cards;
create policy deck_cards_update_own on public.deck_cards
  for update using (
    exists (
      select 1 from public.decks_v2 d
      where d.id = deck_id and d.owner_id = auth.uid()
    )
  );

drop policy if exists deck_cards_delete_own on public.deck_cards;
create policy deck_cards_delete_own on public.deck_cards
  for delete using (
    exists (
      select 1 from public.decks_v2 d
      where d.id = deck_id and d.owner_id = auth.uid()
    )
  );

drop policy if exists card_cache_select_all on public.card_cache;
create policy card_cache_select_all on public.card_cache
  for select using (true);

drop policy if exists card_cache_upsert_auth on public.card_cache;
create policy card_cache_upsert_auth on public.card_cache
  for insert with check (auth.uid() is not null);

drop policy if exists card_cache_update_auth on public.card_cache;
create policy card_cache_update_auth on public.card_cache
  for update using (auth.uid() is not null);
