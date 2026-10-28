# EDH Social

Prototyp sociální sítě pro hráče Commander / cEDH. UI brand: **EDH Social**. Aplikace žije ve složce `edh-hub`.

## Co je hotové

- Next.js (App Router) + TypeScript + Tailwind + Supabase Auth
- **Feed** — příspěvky (`kind=post`), create → detail → edit/delete, search `?q=`
- **Články** — `/articles` list + detail + create/edit/delete (`kind=article`)
- **Kalendář eventů** (Event calendar) — měsíční mřížka s ikonami, výběr dne, RSVP; časy v `Europe/Prague`
- **Eventy** — create/edit/detail (cEDH Tournament / EDH Tournament / Friday Night Magic / Casual Pod), ikony v `public/icons/`, popis, search
- **Profil / bio** — guest vs owner, úprava popisu, Admin badge pro `kosino`
- **Decky** — create/edit/detail + Moxfield CTA na profilu (placeholder art only)
- SQL migrace ve složce `supabase/migrations/` (viz níže)

Žádné oficiální artworky Magic karet, loga Wizards ani jiné chráněné materiály.

## Lokální spuštění

```bash
cd edh-hub
npm ci
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

## Environment

Zkopíruj `.env.example` → `.env.local` (nebo použij tracked `.env.local` s publishable klíčem):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (nebo legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

Service-role klíč sem nepatří.

V Supabase SQL editoru spusť migrace v pořadí:

1. `supabase/migrations/20261028100000_init.sql`
2. `supabase/migrations/20261028120000_posts_kind.sql` (pokud init běžel dřív bez `kind`)
3. `supabase/migrations/20261028140000_event_kinds.sql` (remap Competitive/Casual/Online → 4 kinds)
4. `supabase/migrations/20261028150000_event_description.sql` (volitelné pole `description`)

Nebo jedním pastem: `supabase/migrations/20261028160000_part2_bundle.sql` (kroky 2–4).

5. `supabase/migrations/20261028170000_profile_avatars.sql` (avatar_key / avatar_url / moxfield_user_url + Storage bucket `avatars`)
6. `supabase/migrations/20261029120000_taverna_u_kosa.sql` (Taverna: `decks_v2`, `deck_cards`, feature flags)
7. `supabase/migrations/20261029130000_enable_deckbuilder_import.sql` (flag `deckbuilder_import`)
8. `supabase/migrations/20261029140000_enable_deckbuilder_stats.sql` (flag `deckbuilder_stats`)

## Taverna u Kosa (deckbuilder)

- Docs: `architecture/`, `modules/01-core-deck-crud.md`, `modules/02-moxfield-import.md`, `modules/03-deck-stats.md`
- Feature flags: `deckbuilder_core`, `deckbuilder_import`, `deckbuilder_stats` (tabulka `feature_flags`)
- Routes: `/taverna`, `/taverna/deckbuilder`, `/taverna/deckbuilder/import`, `/decks/new`, `/decks/v2/[id]`, `/decks/v2/[id]/edit`
- Legacy `public.decks` beze změny

## Supabase Auth URL Configuration

**Lokálně**

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

**Produkce**

- Site URL: `https://edh-social.vercel.app`
- Redirect URLs (allowlist obě):
  - `https://edh-social.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (nech pro lokální vývoj)

Nepoužívej `0.0.0.0` — prohlížeč tu adresu neotevře.

## Deploy na Vercel (projekt **edh-social**)

**Live:** https://edh-social.vercel.app  
Root Directory = **`edh-hub`**. Team: `kosino`.

### Preferovaná cesta: GitHub → Vercel

1. Root Directory `edh-hub` (už nastaveno)
2. Env Production + Preview: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (už nastaveno)
3. Push / merge na `main` → Production; PR branch → Preview
4. Auth URL Configuration výše (zkontroluj v Supabase dashboardu)

### Cursor ↔ Vercel

| Cesta | Jak |
| --- | --- |
| GitHub auto-deploy | Cursor pushuje do GH, Vercel poslouchá GH. |
| CLI (přihlášený agent) | Z **kořene** repo (`/workspace`): `vercel link --yes --scope kosino --project edh-social` pak `vercel deploy --prod --yes --scope kosino` |
| Publish / plugin | Volitelně Agents Window → Publish; u existujícího projektu preferuj Git/CLI výše |

`edh-hub/vercel.json` nastavuje Next.js + `npm ci` / `npm run build`. Deploy z CLI musí jít z monorepo rootu, jinak Root Directory `edh-hub` neexistuje.

## Admin

Účet `kosino` je super user (zobrazené jméno Kosino). Heslo v repozitáři není. Přihlášení funguje až po potvrzení e-mailu.

## Graphics

Směr vizuálu (bez rewrite shellu): viz Project store `docs/graphics-direction.md`.

---

**Verze:** 0.2.0 — Part 1 features hotové; Part 2 = Vercel Root `edh-hub` + Auth URLs (viz Deploy).
