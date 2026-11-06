# Pravidla pro agenty

## Ekonomika tokenů

### Výstupy

- Nenahrávej videa. Nepoužívej nahrávání obrazovky ani demo videa.
- Nevytvářej screenshoty, grafiku, canvas ani reporty, pokud o ně uživatel výslovně nepožádá.
- Odpověď drž krátkou. Nevkládej logy a nepřevyprávěj diff.
- Popis pull requestu nech na pár větách.

### Ověření

- U čistě dokumentační změny nespouštěj typecheck ani build.
- U kódu nejdřív `npx tsc --noEmit` a jeden relevantní test soubor.
- Celý `next build` a `npm run test:deckbuilder` pouštěj jen před pushem změny, která sahá na typy nebo runtime.
- Test autocomplete na Scryfall síť nepouštěj, dokud se ta vrstva nemění.
- Lint nespouštěj, dokud `eslint.config.mjs` neimportuje funkční `eslint/config`.
- Ruční prohlížeč a computer-use pouštěj jen když o to uživatel výslovně požádá.
- Když stačí ověřit HTML, použij jeden `curl` na localhost a zkontroluj třídy v odpovědi.

### Čtení repa

- Nejdřív `git diff --stat` a konfliktní hunk. Celý soubor čti, až když hunk nestačí.
- Nečti `node_modules`, lockfile ani `.next`.

### Nástroje

- Nespouštěj subagenta, canvas ani Supabase MCP, dokud úkol není vyloženě o tom.
- Fetchuj jen jednu potřebnou větev.

### Rozsah

- Jedna větev. Žádné paralelní pokusy.
- Commit až když je změna hotová, ne po každém mezikroku.
