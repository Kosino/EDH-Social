# Taverna UX north star — Moxfield-like

Taverna u Kosa (deckbuilder) se vizuálně a interakčně inspiruje **Moxfieldem**.
Platí pro existující i budoucí obrazovky.

## Layout

1. **Horní toolbar** — vyhledání / akce v jednom řádku (ne velké karty formulářů).
2. **Levý sticky panel** — velký náhled karty (čitelný oracle text) + sekundární info (stats, legalita).
3. **Hlavní plocha** — visual grid karet seskupený podle typu (Commander, Creatures, …).
4. **Hover** — najetí na dlaždici v gridu přepíná levý náhled.

## Interakce

- Přidání karty: `search → zóna → Přidat` (EDH bez quantity).
- Partner: kompaktně ve stejném toolbaru.
- Autocomplete názvů přes Scryfall.
- Odebrání karty: jemně na hover dlaždice (editor).
- Chrome: taby Přehled / Editor / Import + WUBRG pips.
- View controls: Visual/Dense grid, Group by Type, Sort Name/CMC.
- Meta: přejmenovat / popis / public + smazání decku (editor sidebar).
- Playtest: Moxfield-like zóny (hand / battlefield / library / GY+exile / command), lokální goldfish (`/decks/[id]/playtest`).

## Co nedělat

- Stackovat velké „card“ formuláře do levého sloupce místo náhledu.
- Flat seznamy textových řádků jako primární prohlížení decku.
- Vkládat marketplace / wish-list (Moxfield specific) — u nás stats + legalita.
