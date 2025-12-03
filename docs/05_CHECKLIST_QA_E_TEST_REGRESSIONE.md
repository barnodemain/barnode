# Checklist QA e test di regressione

## Test quick-add feature

- [ ] Verificare "+" visibile su ogni articolo in Archivio
- [ ] Tap "+" aggiunge articolo ai mancanti senza modal
- [ ] Articolo appare in Home dopo quick-add
- [ ] "+" scompare (hidden) dopo che articolo è aggiunto ai mancanti
- [ ] Click card apre edit modal
- [ ] Trash icon elimina articolo
- [ ] Spacing consistente tra Home e Archivio

## Test Analysis page

- [ ] Button ANALYSIS visibile in Settings con background giallo-ambrato
- [ ] Tap ANALYSIS naviga a /settings/analysis
- [ ] Back button ritorna a /settings
- [ ] Rilevamento duplicati funziona (articoli con keyword comuni in stesso gruppo)
- [ ] Stopwords filtrati correttamente (vodka, di, al, etc. non influenzano grouping)
- [ ] Mostra solo gruppi con 2+ articoli
- [ ] Radio button permette selezione nome primario
- [ ] Tap "Consolida" aggiorna articoli in database
- [ ] Messaggio di successo appare dopo consolidamento
- [ ] Articoli rinominati appaiono in Home e Archivio
 - [ ] Tap "Ignora" su un gruppo lo nasconde in modo persistente (non ricompare dopo refresh / riapertura)

## Test Home page

- [ ] Autocomplete mostra articoli non in mancanti
- [ ] Tap suggerimento aggiunge ai mancanti
- [ ] Manual add funziona (crea solo l'articolo nel catalogo, senza aggiungerlo ai mancanti)
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
- [ ] Backup snapshot creato dopo consolidamento
