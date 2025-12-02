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

- Algoritmo: Tokenizzazione articoli, rimozione stopwords, raggruppamento per parole chiave comuni
- Due o più articoli con stessa parola chiave → gruppo
- UI: Card per ogni gruppo, radio button per scegliere nome primario
- Consolidamento: User seleziona nome primario, tap "Consolida" → Tutti gli articoli del gruppo rinominati
- Backup: Snapshot dopo ogni consolidamento
- Sicurezza: Update cascata su missing_items quando articolo viene rinominato
