# EDH Hub – Startovací projekt

Prototyp sociální sítě pro hráče Magic: The Gathering (EDH / cEDH).

## Co je hotové
- Next.js (App Router) + TypeScript + Tailwind
- Tmavý layout s postranním panelem (podle návrhu)
- Základní stránky: Feed, Profil, Kalendář eventů
- Supabase klient (`@supabase/ssr`), přihlášení, registrace a odhlášení
- Formuláře pro příspěvek, deck a event (vyžadují přihlášení)
- SQL migrace pro `profiles`, `posts`, `decks`, `events`, `event_rsvps`
- Žádné oficiální artworky Magic karet (pouze placeholdery)

## Spuštění v Cursoru

1. Stáhni / naklonuj tuto složku `edh-hub`
2. Otevři ji v Cursoru
3. V terminálu spusť:
   ```bash
   npm install
   npm run dev
   ```
4. Otevři [http://localhost:3000](http://localhost:3000)

## Další kroky (s Grokem v Cursoru)

1. Dokončit napojení Supabase: v SQL editoru spustit migraci (klíč už je v `.env.local`)
2. Přidat reálný kalendář (např. react-big-calendar)

## Autorská práva
Projekt záměrně neobsahuje žádné oficiální obrázky karet, logo Wizards of the Coast ani jiné chráněné materiály. Všechny vizuály jsou generické placeholdery.

## Environment
`.env.local` je v repozitáři a obsahuje URL projektu a publishable klíč. Service-role klíč sem nepatří.

V SQL editoru spusť `supabase/migrations/20261028100000_init.sql`.

V Authentication → URL Configuration nastav:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

Bez klíče aplikace dál ukazuje ukázková data. S klíčem feed, profily a seznam eventů čtou tabulky. Dokud migrace neproběhne, stránky ukážou, že tabulky chybí.

---

**Verze:** 0.1.0 (starter)  
Připraveno pro Grok + Cursor
