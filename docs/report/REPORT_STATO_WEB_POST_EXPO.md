# BARnode – Stato Web Post-Expo

## 1. Struttura del repository post-Expo

Stato corrente della radice `Barnode/` dopo la rimozione di Expo/React Native:

- `.config/`
- `.git/`
- `.local/`
- `attached_assets/`
  - `generated_images/`
- `backup/`
  - `.gitkeep`
  - `Backup_26_Nov_00.40.tar.gz`
  - `Backup_26_Nov_01.47.tar.gz`
  - `Backup_26_Nov_01.48.tar.gz`
  - `Backup_26_Nov_02.00.tar.gz`
  - `Backup_ExpoPreRemoval_20251126_0216.tar.gz`
- `docs/`
  - `01_SUPABASE_SETUP.md`
  - `REPORT_MIGRAZIONE_EXPO_STEP1_DIAGNOSI.md`
  - `REPORT_MIGRAZIONE_EXPO_STEP2_BACKUP.md`
  - `REPORT_MIGRAZIONE_EXPO_STEP3_RIMOZIONE.md`
  - `REPORT_STATO_WEB_POST_EXPO.md` (questo file)
- `scripts/`
  - `backup_barnode.sh`
  - `check-file-length.mjs`
  - `git-commit-main.sh`
  - `landing-page-template.html`
- `shared/` (vuota)
- `web/`
  - `index.html`
  - `package.json`
  - `package-lock.json`
  - `postcss.config.cjs`
  - `src/`
  - `tsconfig.json`
  - `vite.config.ts`
  - `dist/`
  - `node_modules/`
- File radice:
  - `.DS_Store`
  - `.env`
  - `.gitignore`
  - `README.md`

Conferme rispetto all’obiettivo post-Expo:

- Non esistono più:
  - `.expo/`
  - `src/` (radice)
  - `assets/`
  - `node_modules/` (radice)
  - `app.json`
  - `babel.config.js`
  - `index.js`
  - `tsconfig.json` (radice)
  - `package.json` (radice)
  - `package-lock.json` (radice)
  - `scripts/build.js`
- La web app vive solo in `web/` (codice, package, vite, tsconfig, node_modules sono tutti lì).
- Restano attivi:
  - `docs/` (documentazione, report migrazione).
  - `backup/` (snapshot multipli, incluso il pre-rimozione Expo).
  - `scripts/` generali (senza `build.js`).
  - `shared/` (vuota ma presente per eventuali usi futuri).
  - `attached_assets/` (con `generated_images/`).
  - `.env`, `.gitignore`, `README.md`.

## 2. Diagnosi tecnica web app (solo lettura)

### 2.1 Build e TypeScript

Comando eseguito da `web/`:

- `npm run build`

Output sintetico:

- Toolchain: `vite v5.4.21 building for production...`
- Risultato:
  - Nessun errore o warning bloccante.
  - Bundle prodotto con successo:
    - `dist/index.html`
    - `dist/assets/logo-...png`
    - `dist/assets/index-...css`
    - `dist/assets/index-...js` (~383 kB non gzip, ~109 kB gzip)
- Unico messaggio rilevante:
  - Avviso di deprecazione sulla CJS Node API di Vite (messaggio generico, non blocca la build).

Conclusione:

- La build è **clean** dal punto di vista funzionale.
- Il progetto è pronto per una distribuzione static/SPA classica.

### 2.2 Dipendenze e vulnerabilità

Comando eseguito da `web/`:

- `npm ls --depth=0`

Dipendenze top-level rilevate:

- Runtime / core:
  - `react@18.3.1`
  - `react-dom@18.3.1`
  - `react-router-dom@6.30.2`
  - `@supabase/supabase-js@2.84.0`
- Tooling / dev:
  - `vite@5.4.21`
  - `@vitejs/plugin-react-swc@3.11.0`
  - `typescript@5.9.3`
  - `@types/react@18.3.27`
  - `@types/react-dom@18.3.7`

Comando vulnerabilità da `web/`:

- `npm audit --omit=dev`

Risultato:

- `found 0 vulnerabilities`

Conclusioni:

- Non ci sono vulnerabilità note nelle dipendenze runtime (prod) al momento dell’analisi.
- Le versioni usate sono moderne e allineate fra loro (React 18, Vite 5, Typescript 5.9, Supabase 2.84).

### 2.3 Qualità del codice (analisi leggera)

#### 2.3.1 File lunghi

Comando eseguito da `web/`:

- `find src -type f -name '*.tsx' -o -name '*.ts' | xargs wc -l | sort -nr | head -n 10`

Top 10 file per numero di righe (valori indicativi):

1. `src/repositories/ordersRepository.ts` ≈ 417 righe
2. `src/pages/orders/CreateOrderPage.tsx` ≈ 272 righe
3. `src/shared/state/catalogStore.ts` ≈ 239 righe
4. `src/shared/repositories/catalogRepository.ts` ≈ 221 righe
5. `src/state/ordersStore.ts` ≈ 205 righe
6. `src/pages/DatabasePage.tsx` ≈ 152 righe
7. `src/pages/database/SuppliersManagerModal.tsx` ≈ 115 righe
8. `src/shared/state/missingItemsStore.ts` ≈ 113 righe
9. `src/shared/data/mockCatalog.ts` ≈ 109 righe

Osservazioni:

- `ordersRepository.ts` è il file più corposo (logica Supabase + funzioni helper come buildWhatsappText).
- `CreateOrderPage.tsx`, `DatabasePage.tsx` e gli store di stato (`ordersStore`, `catalogStore`, `missingItemsStore`) sono relativamente densi di logica UI/di business.
- Questi file sono candidati naturali per:
  - refactoring in sotto-hook (es. `useCreateOrder`, `useOrdersFilters`),
  - separazione di componenti/presentational vs logic.

#### 2.3.2 Uso di console.log / console.error / console.warn

Ricerca di `console.` in `web/src`:

File principali con log:

- `src/pages/orders/OrderCreatedPage.tsx`
  - Usa `console.warn` per mancanza di testo WhatsApp.
- `src/pages/orders/CreateOrderPage.tsx`
  - Usa `console.error` per errori di submit ordine.
  - Usa `console.log` per:
    - inizio handleSubmit,
    - payload di `createOrderWithLines`,
    - risultato di `createOrderWithLines`,
    - rotta di navigazione finale.
  - Usa `console.warn` per condizioni di stop (supplier o righe mancanti).
- `src/state/ordersStore.ts`
  - `console.error` per errori in caricamento iniziale e update ordine.
- `src/shared/repositories/catalogRepository.ts`
  - `console.error` per errori Supabase.
- `src/shared/repositories/missingItemsRepository.ts`
  - `console.error` per errori Supabase.
- `src/shared/services/supabaseClient.ts`
  - `console.warn` in caso di configurazione Supabase mancante (fallback).
- `src/shared/state/catalogStore.ts`
  - `console.error` per errori di caricamento iniziale (fallback ai mock).
- `src/shared/state/missingItemsStore.ts`
  - `console.error` per errori di caricamento iniziale (fallback ai mock).
- `src/utils/whatsapp.ts`
  - `console.warn` per testo WhatsApp mancante.

Osservazioni:

- I log sono per la maggior parte **mirati a errori/fallback** e non di debug generico.
- L’unico file con logging molto “verboso” è `CreateOrderPage.tsx` (tracciamento payload/result e navigazione).
- In un contesto di produzione si potrebbe:
  - sostituire i log di debug con un logger opzionale o rimuoverli,
  - mantenere quelli di errore/avviso più significativi (Supabase, fallback, validation error).

#### 2.3.3 Codice morto / pagine non usate

Routing principale (`App.tsx`):

- Route definite:
  - `/` → `MissingItemsPage`
  - `/database` → `DatabasePage`
  - `/orders` → `OrdersPage`
  - `/orders/create` → `CreateOrderPage`
  - `/orders/manage` → `ManageOrdersPage`
  - `/orders/created/:id` → `OrderCreatedPage`

Confronto con i file presenti:

- `src/pages/` contiene:
  - `DatabasePage.tsx`
  - `MissingItemsPage.tsx`
  - `OrdersPage.tsx`
  - `pages/orders/*.tsx` (Create/Edit/Manage/Orders/OrderCreated) – tutte mappate o usate indirettamente.
  - `pages/database/*.tsx` (modali varie) – usate internamente da `DatabasePage`.

Osservazioni:

- Non emergono, da questa scansione, pagine palesemente non usate.
- I repository (`ordersRepository`, `catalogRepository`, `missingItemsRepository`), gli store (`ordersStore`, `catalogStore`, `missingItemsStore`) e i tipi (`types`, `shared/types/items`) sono tutti referenziati.
- Non si rileva codice “chiaramente morto” a colpo d’occhio, salvo eventuali singoli helper non chiamati (da verificare con analisi più mirata se servirà).

## 3. Proposte di consolidamento (non applicate)

### 3.1 Pulizia repository

- `shared/` (vuota):
  - Può rimanere come riserva per codice condiviso cross-progetto.
  - In alternativa, se non pianifichi multi-target, può essere rimossa per pulizia.

- `attached_assets/generated_images/` (vuota al momento):
  - Verificare se verrà usata per contenuti marketing/landing.
  - Se non serve, può essere rimossa o spostata fuori dal repo.

- `backup/`:
  - Contiene vari `.tar.gz`, inclusi backup ravvicinati più uno pre-rimozione Expo.
  - Per evitare crescita incontrollata del repo locale:
    - Definire una policy di retention (es. mantenere solo N backup recenti e quello pre-rimozione Expo).
    - Valutare spostamento dei backup più vecchi su storage esterno.

- `docs/`:
  - Struttura già pulita e coerente (setup Supabase + tre report migrazione + stato web).
  - Nessuna azione obbligata; eventualmente si può normalizzare la nomenclatura o aggiungere un `README_DOCS.md` che indichi come navigare i report.

### 3.2 Pulizia e refactoring codice

- File lunghi da valutare per refactoring:
  - `src/repositories/ordersRepository.ts` (~417 righe):
    - Possibile separare in più moduli:
      - `ordersRepository.core.ts` (CRUD base Supabase).
      - `ordersRepository.whatsapp.ts` (funzioni per buildWhatsappText, ecc.).
    - Oppure suddividere per gruppi di responsabilità (lettura, scrittura, archiviazione, cancellazione, utilità).
  - `src/pages/orders/CreateOrderPage.tsx` (~272 righe):
    - Candidato a estrazione di hook:
      - `useCreateOrderForm` (gestione stato del form, validazione base).
      - `useSubmitOrder` (logica di chiamata al repository, gestione errori e navigazione).
  - `src/shared/state/catalogStore.ts`, `src/state/ordersStore.ts`, `src/shared/state/missingItemsStore.ts`:
    - Gli hook di stato potrebbero essere affiancati da moduli helper (selectors), riducendo la logica inline.
  - `src/shared/repositories/catalogRepository.ts` (~221 righe):
    - Possibile analogia al refactoring di `ordersRepository`.

- Uso di `console.*`:
  - Valutare una fase di “hardening” dei log:
    - Rimuovere i log puramente di debug (i 3–4 `console.log` di `CreateOrderPage.tsx`), o condizionarli a una flag di debug.
    - Mantenere i `console.error` e `console.warn` per condizioni anomale (errori Supabase, fallback ai mock, errori di submit ordine), eventualmente instradandoli in un logger dedicato in futuro.

- Codice duplicato o potenzialmente consolidabile:
  - I repository seguono pattern simili (wrapQuery, gestione errori Supabase). È possibile estrarre un helper generico di wrapping per centralizzare la gestione errori.
  - Gli store di stato (`useCatalog`, `useMissingItems`, `useOrders`) condividono pattern per load iniziale e fallback; potrebbero usare una piccola utility comune per ridurre duplicazione.

### 3.3 Hardening e sicurezza

- Dipendenze:
  - Attualmente tutte aggiornate e senza vulnerabilità note sulle dipendenze runtime.
  - Possibile step futuro:
    - Aggiungere uno script tipo `npm run audit` in `web/package.json` per eseguire audit periodici.

- Configurazione Supabase:
  - `shared/services/supabaseClient.ts` logga un warning se le variabili non sono presenti.
  - Si può valutare:
    - Validare esplicitamente le variabili all’avvio e, in caso di assenza, mostrare una UI di errore più user-friendly.
    - Spostare gli errori di configurazione in un canale di log o monitoraggio centralizzato.

### 3.4 Developer Experience (DX)

- Scripts root vs web:
  - Attualmente non esiste più un `package.json` di radice; tutti gli script NPM vivono in `web/`.
  - `scripts/` contiene script shell generali (`backup_barnode.sh`, `git-commit-main.sh`, `check-file-length.mjs`).
  - Possibili miglioramenti:
    - Creare un `package.json` minimale in radice solo per orchestrare:
      - `npm run web:dev` → `cd web && npm run dev`.
      - `npm run web:build` → `cd web && npm run build`.
      - `npm run web:lint` → `cd web && npm run lint`.
    - Oppure documentare chiaramente nel README che tutti i comandi vanno eseguiti dentro `web/`.

- Scripts aggiuntivi nella web app:
  - Aggiungere (se non già presenti) script in `web/package.json` per:
    - `"build:analyze"` (bundle analyzer, se necessario in futuro).
    - `"check:filelength"` (riuso di `check-file-length.mjs`, adattato alla struttura `web/`).
    - `"test"` / `"test:watch"` (se si decide di introdurre una suite di test).

## 4. Roadmap proposta (solo suggerimenti, non applicati)

### STEP A – Alta priorità, basso rischio

- Stabilizzare il flusso di lavoro web-only:
  - Aggiornare `README.md` per descrivere chiaramente:
    - come avviare la web app (`cd web && npm install && npm run dev`),
    - come eseguire `npm run build` e dove trovare l’output.
  - Documentare brevemente l’uso di `.env.local` e di Supabase per la web app.

- Definire una policy per `backup/`:
  - Decidere quanti backup tenere localmente.
  - Eventualmente spostare su storage esterno le snapshot non più necessarie.

- Aggiungere uno script `npm run audit` in `web/package.json` (solo diagnosi, nessun fix automatico).

### STEP B – Media priorità

- Refactoring dei file più lunghi:
  - Spezzare `ordersRepository.ts` in moduli più piccoli o in sezioni per responsabilità.
  - Estrarre hook/utility da `CreateOrderPage.tsx` per ridurre complessità del componente.
  - Valutare l’estrazione di funzioni helper e selector dagli store (`ordersStore`, `catalogStore`, `missingItemsStore`).

- Hardening dei log:
  - Rimuovere/condizionare i `console.log` di debug in `CreateOrderPage.tsx`.
  - Introdurre un piccolo wrapper di logging centralizzato (es. `logger.ts`) per uniformare `console.error`/`console.warn`.

### STEP C – Nice to have

- Pulizia di cartelle vuote o poco usate:
  - `shared/` (se non verrà usata a breve).
  - `attached_assets/generated_images/` (se confermato che non serve nel flusso attuale).

- Miglioramento DX avanzato:
  - Introdurre un mini `package.json` in radice per orchestration cross-progetto (se ritenuto utile).
  - Integrare tooling aggiuntivo (es. ESLint/Prettier già configurati a livello repo, script di check file length agganciato alla web app).

Questa roadmap fornisce una sequenza progressiva: prima consolidamento documentale e di processo (STEP A), poi refactoring mirato e hardening (STEP B), infine ottimizzazioni e pulizie opzionali (STEP C).
