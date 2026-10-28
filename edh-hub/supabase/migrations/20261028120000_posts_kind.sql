-- Articles MVP: distinguish feed posts from long-form articles on the same table.
-- Run after 20261028100000_init.sql in the Supabase SQL editor.

alter table public.posts
  add column if not exists kind text not null default 'post'
  check (kind in ('post', 'article'));

create index if not exists posts_kind_created_at_idx
  on public.posts (kind, created_at desc);
