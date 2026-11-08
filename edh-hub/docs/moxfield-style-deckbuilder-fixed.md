# Opravený Moxfield-style Deck Builder (podle EDH-Social)

Soubor `MoxfieldStyleDeckBuilder.tsx` je přepsaný podle funkčního `DeckVisualBrowser` z Kosino/EDH-Social.

## Co je nově

- Vizuální grid (Visual Grid / Dense Grid / List)
- Seskupení podle typů (stejně jako v EDH-Social)
- Preview karty vlevo (hover + click)
- Quantity podpora
- Right-click menu (Set as commander / Remove)
- Řazení podle jména nebo CMC
- Lepší struktura dat (`DeckBrowserCard` s board, quantity, imageUrl)

## Prompt pro Cursor

Nahraj soubor `MoxfieldStyleDeckBuilder.tsx` do chatu a napiš:

---

Vlož soubor `MoxfieldStyleDeckBuilder.tsx` do `web/components/deckbuilder/` (vytvoř složku pokud neexistuje).

Potom v editoru decku importuj a použij:

```tsx
import MoxfieldStyleDeckBuilder from '@/components/deckbuilder/MoxfieldStyleDeckBuilder';

<MoxfieldStyleDeckBuilder />
```

Komponenta má interní stav. Pokud chceš napojit na existující data z EDH-Social, předej props:

```tsx
<MoxfieldStyleDeckBuilder
  cards={editorCards}
  onRemoveCard={(id) => { /* remove action */ }}
  onSetCommander={(id) => { /* set commander */ }}
/>
```

Endpoint pro search je `/api/search`. Uprav `searchCards` pokud máš jiný.

---
