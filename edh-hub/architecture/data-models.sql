-- Taverna u Kosa — data model (source of truth for migrations)
-- Existing public.decks stays as legacy profile decks. New builder uses decks_v2.

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

-- Optional Scryfall cache for repeated lookups
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
