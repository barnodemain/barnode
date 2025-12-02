# Flussi funzionali e regole business

## Flusso Quick-Add su Archivio

- Tap su "+" aggiunge l'articolo ai mancanti senza modal
- Duplicate protection: "+" visibile solo se articolo NON è già in missing_items
- Stesso hook `useMissingItems` della Home per consistency
- Backup automatico dopo addMissingItem

## Flusso Home (Lista articoli mancanti)

- Autocomplete mostra solo articoli non in missing_items
- Tap su suggerimento aggiunge ai mancanti
- Manual add: crea articolo se non esiste, poi aggiunge ai mancanti
- Trash icon rimuove da missing_items

## Archivio (Catalogo)

- Click card: apre edit modal
- Trash icon: elimina articolo (e da missing_items se presente)
- "+" icon: quick-add ai mancanti (hidden se già present)

## Analysis (Rilevamento duplicati)

**Data source:** Solo tabella `articoli`, mai `missing_items` per il raggruppamento

- Algoritmo migliorato: Raggruppa solo articoli che condividono keywords comuni (2+ DISTINTI articoli per gruppo)
- Articoli singoli: Non vengono mostrati nemmeno se hanno multiple keywords
- Tokenizzazione: Lowercase, remove accenti, split per spazi, filter stopwords e numeri puri
- Raggruppamento: Se articolo A e B condividono keyword K → stesso gruppo
- Deduplicazione: Stesso set di articoli non appare in multiple gruppi
- UI: Mostra keywords condivisi, radio button per nome primario, due button: "Consolida" e "Ignora"
- Consolida: Elimina i duplicati (articoli non-primari), conserva solo il primario
  - Prima di eliminare: missing_items vengono puliti via cascata
  - Dopo consolidazione: gruppo scompare se rimane solo 1 articolo
- Ignora: Nasconde il gruppo dalla visualizzazione (non modifica database)
- Auto-refresh: I gruppi si ricompilano quando articoli cambiano (dopo consolidazione, gruppo sparisce)
- Backup: Snapshot dopo ogni consolidamento
- Sicurezza: Eliminazione cascata via deleteArticolo su missing_items
