# BARnode – STEP 5A Pulizie Sicure Post-Expo

## 1. Interventi effettuati

### 1.1 Cartelle eliminate

- `shared/` (radice):
  - Cartella vuota non più utilizzata dopo la rimozione di Expo.
  - Rimossa con comando da radice: `rm -rf shared`.
- `attached_assets/generated_images/`:
  - Cartella vuota, non referenziata dalla web app.
  - Rimossa con comando: `rm -rf attached_assets/generated_images`.
- La cartella `attached_assets/` è stata lasciata intatta come contenitore generale per eventuali asset futuri.

### 1.2 File creati

- `docs/BACKUP_POLICY.md`:
  - Descrive la policy di backup del progetto post-Expo.
  - Contenuti principali:
    - Numero di backup da mantenere localmente: ultimi 3 backup generali + il backup speciale `Backup_ExpoPreRemoval_20251126_0216.tar.gz`.
    - Regole di rotazione consigliate.
    - Regola esplicita: `Backup_ExpoPreRemoval_20251126_0216.tar.gz` non va mai eliminato come parte della rotazione.
    - Suggerimento per spostare i backup più vecchi su storage esterno.

### 1.3 Modifiche a README.md

Il file `README.md` in radice è stato aggiornato per riflettere lo stato “solo web” del progetto:

- Rimossa la vecchia descrizione basata su Expo/React Native e la struttura `src/`, `screens/`, `components/`, `navigation/`, ecc.
- Introdotta una nuova sezione di struttura del progetto post-Expo:
  - `web/` come cartella principale della web app (src, vite.config.ts, tsconfig.json, package.json, dist, ecc.).
  - `docs/` per la documentazione e i report di migrazione.
  - `backup/` per i file di backup.
  - `scripts/` per gli script di utilità.
  - `attached_assets/` per eventuali asset allegati.
- Aggiornati i comandi principali:
  - Per sviluppo locale:
    - `cd web`
    - `npm install`
    - `npm run dev`
  - Per build di produzione:
    - `cd web`
    - `npm run build`
- Aggiunta una sezione “Stato della Migrazione” che specifica:
  - La rimozione completa della versione Expo/React Native nella data 26/11/2025.
  - Che l'applicazione vive ora interamente in `web/`.
  - L'esistenza del branch di archivio `legacy/expo-full-archive` e del backup `backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz`.
- Aggiunta una sezione dedicata a `.env.local` per la web app:
  - Spiega che le variabili vanno definite in `web/.env.local`.
  - Indica l'uso di `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` per configurare Supabase.
  - Sottolinea che `web/.env.local` non deve essere committato.

### 1.4 Modifica a web/package.json

Nel file `web/package.json` è stato aggiunto uno script diagnostico:

- Sotto `"scripts"` è stata aggiunta la voce:
  - `"audit": "npm audit --omit=dev"`
- Nessun altro script è stato modificato.
- Nessuna dipendenza è stata aggiunta, rimossa o aggiornata.

## 2. Verifiche post-operazioni

### 2.1 Integrità della cartella web/

- La cartella `web/` non è stata modificata nei suoi file sorgente (`web/src/**`).
- Non sono state toccate:
  - pagine, componenti, repository, store o hook.
  - configurazioni Vite (`web/vite.config.ts`) e TypeScript (`web/tsconfig.json`).
  - logiche Supabase.
- L'unica modifica in `web/` riguarda `web/package.json`, limitata all'aggiunta dello script `audit`.

### 2.2 File critici non modificati

- Nessun file dentro `web/src/**` è stato aperto o modificato a scopo di refactoring.
- Non sono stati alterati:
  - `web/src/App.tsx` (routing).
  - `web/src/main.tsx` (bootstrap React/Vite).
  - repository, store, tipi o utilità.

### 2.3 Backup

- Nessun file `.tar.gz` esistente in `backup/` è stato rimosso.
- La policy di backup è solo documentata in `docs/BACKUP_POLICY.md`, senza automatizzare alcuna cancellazione.

## 3. Note per STEP 5B (refactoring e hardening futuri)

Lo STEP 5A ha eseguito esclusivamente interventi a rischio zero (pulizia cartelle vuote, documentazione, script diagnostico). I passi futuri, da trattare in STEP 5B e successivi, possono includere:

- Refactoring dei file più lunghi (es. `web/src/repositories/ordersRepository.ts`, `web/src/pages/orders/CreateOrderPage.tsx`, store di stato) in moduli/hook più piccoli.
- Hardening del logging:
  - Ridurre o rendere condizionali i `console.log` di debug.
  - Mantenere e strutturare i log di errore/avviso.
- Miglioramento DX:
  - Eventuale creazione di un `package.json` minimale in radice per orchestrare comandi `web:*`.
  - Aggiunta di script extra in `web/package.json` (es. `build:analyze`, `test`) se/quando si introdurranno nuove esigenze.

Queste attività NON sono state eseguite in STEP 5A e richiederanno decisioni specifiche in un passaggio successivo.
