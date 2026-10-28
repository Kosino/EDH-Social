# EDH Social

Prototyp sociální sítě pro hráče Commander / cEDH. UI brand: **EDH Social**. Aplikace žije ve složce `edh-hub`.

## Co je hotové

- Next.js (App Router) + TypeScript + Tailwind + Supabase Auth
- **Feed** — příspěvky (`kind=post`), create → detail
- **Články** — `/articles` list + detail + create (`kind=article`)
- **Kalendář eventů** (Event calendar) — měsíční mřížka, výběr dne, RSVP; časy v `Europe/Prague`
- **Eventy** — create (cEDH Tournament / EDH Tournament / Friday Night Magic / Casual Pod), ikony v `public/icons/`, místa (Most, Bílina, …)
- **Profil / bio** — guest vs owner, úprava popisu, Admin badge pro `kosino`
- **Decky** — create + seznam na profilu (placeholder art only)
- SQL migrace: `supabase/migrations/20261028100000_init.sql` + `20261028120000_posts_kind.sql`

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
2. `supabase/migrations/20261028120000_posts_kind.sql` (pokud jsi init už dřív spustil bez `kind`)

## Supabase Auth URL Configuration

**Lokálně**

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

**Produkce (po Vercel deployi)**

- Site URL: `https://<tvůj-projekt>.vercel.app`
- Redirect URLs (allowlist obě):
  - `https://<tvůj-projekt>.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (nech pro lokální vývoj)

Nepoužívej `0.0.0.0` — prohlížeč tu adresu neotevře.

## Deploy na Vercel

Root Directory musí být **`edh-hub`**.

### CLI (pokud jsi přihlášený)

```bash
cd edh-hub
npx vercel link   # nebo vercel --yes při prvním deployi
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npx vercel --prod
```

`vercel.json` v této složce nastavuje Next.js framework + `npm ci` / `npm run build`.

### Dashboard

1. Import repo `Kosino/EDH-Social`
2. Root Directory: `edh-hub`
3. Environment variables: URL + publishable key (Production + Preview)
4. Deploy
5. Doplň Auth URL Configuration výše

## Admin

Účet `kosino` je super user (zobrazené jméno Kosino). Heslo v repozitáři není. Přihlášení funguje až po potvrzení e-mailu.

## Graphics

Směr vizuálu (bez rewrite shellu): viz Project store `docs/graphics-direction.md`.

---

**Verze:** 0.2.0 (Part 1 prototype)
