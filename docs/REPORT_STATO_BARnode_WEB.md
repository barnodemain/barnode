# REPORT STATO — BARnode Web (post-pulizia Archivio)

## Routing & Pagine

- `/` → **Home** (`MissingItemsPage`)
  - Gestione degli **articoli mancanti** (lista, aggiunta/rimozione) tramite `useMissingItems`.
- `/archivio` → **Archivio articoli** (`ArchivePage`)
  - Vista di **sola lettura + edit/elimina articoli**.
  - Nessuna creazione articoli o gestione tipologie dalla UI.
- `/settings` → **Impostazioni** (`SettingsPage`)
  - Pagina con tre pulsanti touch-friendly: `IMPORTA`, `ARTICOLI`, `TIPOLOGIE` (entry point futuri, nessuna logica ancora implementata).
- `/database` → redirect permanente verso `/archivio` (per compatibilità con link/route storiche).
- `*` → redirect alla Home (`MissingItemsPage`).

## Moduli attivi

### Home (MissingItemsPage)

- Mostra e gestisce la lista di **articoli mancanti**.
- Hook: `useMissingItems` (`web/src/shared/state/missingItemsStore.ts`).
- Repository: `missingItemsRepository` (`web/src/shared/repositories/missingItemsRepository.ts`).
- Funzionalità principali:
  - ricerca articoli tramite suggerimenti.
  - aggiunta/rimozione di ID articolo alla lista "mancanti".

### Archivio (ArchivePage)

- Mostra la lista completa degli **articoli** con relative **tipologie**.
- Hook: `useCatalog` (`web/src/shared/state/catalogStore.ts`).
- Repository: `catalogRepository` (`web/src/shared/repositories/catalogRepository.ts`).
- Funzionalità disponibili:
  - ricerca per nome articolo.
  - modifica del nome articolo (modale `EditArticleModal`).
  - eliminazione articolo.
- Funzionalità **non** disponibili:
  - creazione nuovi articoli.
  - creazione/modifica/eliminazione tipologie.

### Impostazioni (SettingsPage)

- Pagina statica, pensata per futuri flussi di:
  - **IMPORTA** (es. CSV, integrazioni esterne).
  - gestione **ARTICOLI**.
  - gestione **TIPOLOGIE**.
- Attualmente i tre pulsanti sono solo UI (nessuna logica associata).

## Moduli rimossi

- **Ordini (Orders)**
  - Rimosse tutte le pagine (`web/src/pages/orders/*`), store (`ordersStore`), repository (`ordersRepository`), componenti UI e tipi dedicati.
  - Nessuna route `/orders` è esposta.

- **Fornitori (Suppliers)**
  - Rimosse tutte le UI di gestione fornitori (modali, liste, select) e le API di repository/store.
  - Gli articoli non espongono più `fornitoreId`/`fornitoreNome`.

- **Flussi Archivio: Gestisci tipologie / Aggiungi articoli**
  - Rimosse le modali `TypesManagerModal` e `NewArticleModal` e i relativi pulsanti dalla pagina Archivio.
  - Rimosse dal data layer le funzioni:
    - `addArticolo`, `addTipologia`, `updateTipologia`, `deleteTipologia` in `useCatalog`.
    - `createArticolo`, `createTipologia`, `updateTipologia`, `deleteTipologia` in `catalogRepository`.

## Comportamento Supabase

- Client Supabase: `web/src/shared/services/supabaseClient.ts`.
- Comportamento generale:
  - Se le variabili ambiente Supabase **non sono configurate**:
    - `useMissingItems` e `useCatalog` usano **mock** (dati locali) senza generare errori.
  - Se Supabase è **configurato correttamente**:
    - `missingItemsRepository` lavora contro la tabella `articoli_mancanti`.
    - `catalogRepository` legge **tipologie** e **articoli** reali e consente:
      - aggiornamento nome articolo (`updateArticoloNome`).
      - eliminazione articolo (`deleteArticolo`).
    - La UI web **non** espone più flussi di scrittura per:
      - creazione articoli.
      - creazione/modifica/eliminazione tipologie.

## Stato qualità

- `npm run lint` (frontend `web/`): **OK**.
- `npm run build` (Vite): **OK**.
  - Unico warning noto di Vite sulla deprecazione del CJS Node API (non bloccante).
- CSS orfani:
  - Il file storico `web/src/styles.css` è stato spostato in `web/ARCHIVE/styles.css.bak` perché non più importato dal bundle; non influisce sulla build.
- Compatibilità CSS:
  - La regola `-webkit-overflow-scrolling: touch;` è stata rimossa da `archive.css` per evitare warning di tool moderni; lo scroll rimane gestito da `overflow-y: auto`.

## Sintesi

- BARnode Web, lato frontend, espone ora tre sezioni principali: **Home**, **Archivio**, **Impostazioni**.
- I moduli **Ordini** e **Fornitori** sono interamente rimossi dal frontend (UI + data layer).
- L'Archivio è una vista di **consultazione** con possibilità di edit/elimina articolo, ma senza più gestione tipologie o creazione articoli dal web.
- Supabase è opzionale: in assenza di configurazione l'app usa mock, con comportamento prevedibile e senza errori.
- Lint e build sono verdi; il codice è pronto per futuri sviluppi sopra questa base pulita.
