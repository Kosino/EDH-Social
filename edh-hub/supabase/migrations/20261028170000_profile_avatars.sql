-- Profile avatars (preset key or custom upload URL) + Moxfield user link.

alter table public.profiles
  add column if not exists avatar_key text;

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists moxfield_user_url text;

alter table public.profiles
  drop constraint if exists profiles_avatar_key_check;

alter table public.profiles
  add constraint profiles_avatar_key_check
  check (
    avatar_key is null
    or avatar_key in (
      'dwarf-tinkerer',
      'dark-elf',
      'forest-elf',
      'stone-golem',
      'purple-bard',
      'shadow-rogue',
      'mech-bird',
      'horn-warrior',
      'star-wizard'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_avatar_url_https;

alter table public.profiles
  add constraint profiles_avatar_url_https
  check (avatar_url is null or avatar_url ~ '^https://');

alter table public.profiles
  drop constraint if exists profiles_moxfield_user_url_check;

alter table public.profiles
  add constraint profiles_moxfield_user_url_check
  check (
    moxfield_user_url is null
    or moxfield_user_url ~ '^https://(www\.)?moxfield\.com/users/[A-Za-z0-9_-]+/?$'
  );

-- Seed Moxfield link for superuser kosino when the row exists.
update public.profiles
set moxfield_user_url = 'https://moxfield.com/users/Kosino'
where lower(username) = 'kosino'
  and (moxfield_user_url is null or moxfield_user_url = '');

-- Storage bucket for custom avatars (public read, owner write).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
