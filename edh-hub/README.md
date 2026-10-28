# EDH Hub – Startovací projekt

Prototyp sociální sítě pro hráče Magic: The Gathering (EDH / cEDH).

## Co je hotové
- Next.js (App Router) + TypeScript + Tailwind
- Tmavý layout s postranním panelem (podle návrhu)
- Základní stránky: Feed, Profil, Kalendář eventů
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

1. Napojit Supabase (auth + databáze)
2. Vytvořit formuláře pro decky, posty a eventy
3. Přidat reálný kalendář (např. react-big-calendar)
4. Přidat autentizaci

## Autorská práva
Projekt záměrně neobsahuje žádné oficiální obrázky karet, logo Wizards of the Coast ani jiné chráněné materiály. Všechny vizuály jsou generické placeholdery.

## Environment
Zkopíruj `.env.example` → `.env.local` a doplň klíče ze Supabase (až budeš mít projekt).

---

**Verze:** 0.1.0 (starter)  
Připraveno pro Grok + Cursor
