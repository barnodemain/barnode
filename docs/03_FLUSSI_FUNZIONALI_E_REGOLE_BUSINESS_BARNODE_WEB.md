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

## Backup e ripristino

- Dopo le operazioni CRUD critiche viene creato/aggiornato automaticamente **un unico snapshot globale** dei dati in `backups_barnode`.
- Questo snapshot è memorizzato in un solo record "attivo" con ID fisso `00000000-0000-0000-0000-000000000001`.
- La pagina **Backup** espone il pulsante "Ripristina ultimo backup" che, previa conferma utente, chiama la RPC `restore_last_backup`.
- Il ripristino sovrascrive completamente le tabelle `articoli` e `missing_items` caricando sempre lo stato più recente di questo snapshot globale.

## Analysis (Rilevamento duplicati)

**Data source:** Solo tabella `articoli`, mai `missing_items` per il raggruppamento

- Algoritmo con fuzzy matching: rileva duplicati anche con piccole variazioni (typo, case diverso)
- Tokenizzazione: lowercase, rimozione accenti, split per spazi, filtro stopwords e numeri puri
- Stopwords: set esteso (vodka, rum, gin, di, al, mini, size, ml, cc, special, especial, apa, ipa, belvedere, havana, etc.)
- Categoria semantica: gli articoli vengono raggruppati solo se condividono la stessa prima parola (es. "Birra ...", "Vodka ...")
- Un gruppo è valido solo se tra i suoi membri ci sono almeno **2 keyword condivise** (esatte o fuzzy)
- Deduplicazione: lo stesso insieme di articoli non appare in più gruppi
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
  - Il pulsante "Ignora" nasconde il gruppo solo per la sessione corrente
  - Nessuna modifica a Supabase o alle tabelle
- Normalizzazione: tutti i nomi articoli consolidati vengono salvati in Title Case (prima lettera maiuscola per parola)
