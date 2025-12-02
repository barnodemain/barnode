# Checklist QA e test di regressione

## Test quick-add feature

- [ ] Verificare "+" visibile su ogni articolo in Archivio
- [ ] Tap "+" aggiunge articolo ai mancanti senza modal
- [ ] Articolo appare in Home dopo quick-add
- [ ] "+" scompare (hidden) dopo che articolo è aggiunto ai mancanti
- [ ] Click card apre edit modal
- [ ] Trash icon elimina articolo
- [ ] Spacing consistente tra Home e Archivio

## Test Home page

- [ ] Autocomplete mostra articoli non in mancanti
- [ ] Tap suggerimento aggiunge ai mancanti
- [ ] Manual add funziona (crea + aggiunge)
- [ ] Trash rimuove dai mancanti

## Test Archivio page

- [ ] Search funziona
- [ ] Edit modal apre/chiude
- [ ] Delete confirmation mostra e rimuove

## General

- [ ] No console errors
- [ ] npm run build completes successfully
- [ ] No TypeScript errors
- [ ] Scroll behavior unchanged
