# Flussi funzionali e regole business

## Flusso Quick-Add su Archivio

- Tap su "+" aggiunge l'articolo ai mancanti senza modal
- Duplicate protection: "+" visibile solo se articolo NON è già in missing_items
- Stesso hook `useMissingItems` della Home per consistency
- Backup automatico dopo addMissingItem

## Flusso Home (Lista articoli mancanti)

- Autocomplete mostra solo articoli non in missing_items
- Tap su suggerimento aggiunge ai mancanti
- Manual add (FAB "+"): crea l'articolo nel catalogo se non esiste **ma non lo aggiunge automaticamente ai mancanti**
- Trash icon rimuove da missing_items

## Archivio (Catalogo)

- Click card: apre edit modal
- Trash icon: elimina articolo (e da missing_items se presente)
- "+" icon: quick-add ai mancanti (hidden se già present)

## Accesso impostazioni (PIN)

- Il tab Settings nella bottom nav non apre direttamente la pagina impostazioni.
- Tap su Settings mostra un modal PIN con tastierino numerico.
- PIN valido: `1909`.
- Se il PIN è corretto, viene salvato un flag in `sessionStorage` per evitare richieste PIN nella stessa sessione.
- Solo dopo lo sblocco l'utente può accedere alle funzioni di import, backup, analysis, note ed export.

## Backup e ripristino

- Dopo le operazioni CRUD critiche viene creato/aggiornato automaticamente **un unico snapshot globale** dei dati in `backups_barnode`.
- Questo snapshot è memorizzato in un solo record "attivo" con ID fisso `00000000-0000-0000-0000-000000000001`.
- La pagina **Backup** espone il pulsante "Ripristina ultimo backup" che, previa conferma utente, chiama la RPC `restore_last_backup`.
- Il ripristino sovrascrive completamente le tabelle `articoli` e `missing_items` caricando sempre lo stato più recente di questo snapshot globale.

## Pagina NOTE (contenuto sincronizzato)

- Accessibile da Settings tramite pulsante "NOTE".
- Mostra una textarea a tutto schermo con il contenuto delle note.
- All'apertura:
  - se esiste una riga nella tabella Supabase `notes`, viene usato il suo `content`;
  - se non esiste, viene creata una riga inizializzata con l'elenco degli articoli correnti.
- L'utente può modificare liberamente il testo.
- Le modifiche vengono salvate su Supabase con un leggero debounce, aggiornando sempre la stessa riga.
- Su altri dispositivi, aprendo la pagina NOTE si vede lo stesso contenuto sincronizzato.
- Esiste un pulsante con icona copia in alto a destra che copia tutto il testo delle note e mostra la label "testo copiato" per 2 secondi.

## Export articoli

- In Settings è presente il pulsante "Esporta articoli".
- L'azione scarica un file di testo contenente tutti gli articoli ordinati alfabeticamente, uno per riga.
- La logica di export riusa i dati di `useArticoli` senza query aggiuntive.

## Analysis (Rilevamento duplicati)

**Data source:** Solo tabella `articoli`, mai `missing_items` per il raggruppamento

- Algoritmo completamente client-side.
- Categoria semantica: gli articoli vengono raggruppati per **prima parola normalizzata** del nome (es. "Birra ...", "Vodka ...").
- Per ogni categoria con almeno 2 articoli viene creato un gruppo.
- Ogni gruppo espone la parola chiave (prima parola) come "parola chiave" principale.
- Deduplicazione: lo stesso insieme di articoli non appare in più gruppi.
- UI: per ogni gruppo viene mostrato
  - Titolo: "Possibile gruppo duplicato (X articoli)"
  - Sottotitolo: parole chiave condivise
  - Sezione "Articoli trovati" con checkbox per selezione multipla
  - Sezione "Nome finale" con
    - radio "Usa nome esistente" (tra gli articoli selezionati)
    - radio "Inserisci nuovo nome" + input testo
  - Pulsanti in fondo alla card: "Consolida" (verde) e "Ignora" (grigio)
- Consolidamento avanzato (multi-merge):
  - L'utente seleziona uno o più articoli da un gruppo
  - Il primo selezionato diventa il **master** (mantiene l'`id`)
  - Nome finale sempre normalizzato in Title Case tramite `normalizeArticleName`
  - Tutti gli altri articoli selezionati vengono eliminati
  - Tutti i `missing_items` che puntavano agli articoli eliminati vengono aggiornati per puntare al master, con `articolo_nome` aggiornato
  - Viene creato uno snapshot di backup tramite `createAndSaveCurrentSnapshot()`
  - Gli articoli vengono ricaricati e i gruppi ricalcolati; il gruppo consolidato sparisce
- Ignora gruppo:
  - Il pulsante "Ignora" archivia il gruppo lato client (localStorage) e non lo ripropone più nelle analisi successive
  - Nessuna modifica a Supabase o alle tabelle
  - Normalizzazione: tutti i nomi articoli consolidati vengono salvati in Title Case (prima lettera maiuscola per parola)
