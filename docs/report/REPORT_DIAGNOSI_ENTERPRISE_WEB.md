# BARnode Web – Diagnosi Enterprise

## 1. Panoramica stato attuale

- Progetto migrato completamente da Expo/React Native a **solo web app** basata su React + Vite + TypeScript.
- Codice applicativo confinato in `web/src/**`.
- Parte Expo rimossa (STEP 3), con stato precedente archiviato in:
  - branch Git `legacy/expo-full-archive`;
  - backup `backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz`.
- Repository organizzato con cartelle principali: `web/`, `docs/`, `backup/`, `scripts/`, `attached_assets/`, `.env`, `README.md`, ecc.

## 2. Struttura repository post-Expo

### 2.1 Radice `Barnode/`

Contenuto principale (livello 1):

- `.config/`
- `.git/`
- `.local/`
- `attached_assets/` (vuota dopo rimozione `generated_images/`)
- `backup/` (backup .tar.gz multipli, incluso ExpoPreRemoval)
- `docs/` (setup Supabase + tutti i report di migrazione e stato)
- `scripts/` (script di utilità: backup, check-file-length, git-commit, landing-page template)
- `web/` (web app completa)
- `.env`
- `.gitignore`
- `README.md`

Conferma assenza definitiva di parti Expo:

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

### 2.2 Struttura `web/`

- File/config principali:
  - `index.html`
  - `package.json`, `package-lock.json`
  - `postcss.config.cjs`
  - `tsconfig.json`
  - `vite.config.ts`
  - `dist/` (output build Vite)
  - `node_modules/`
  - `.env.local` (non versionato, ma presente localmente)
- Sorgenti `web/src/`:
  - `App.tsx` (routing principale)
  - `main.tsx` (bootstrap ReactDOM + BrowserRouter)
  - `assets/` (vuota)
  - `components/`
    - `orders/` (OrderCard, OrderArticleBox, OrderConfirmModal, OrderSupplierSelect)
  - `pages/`
    - `DatabasePage.tsx`
    - `MissingItemsPage.tsx`
    - `OrdersPage.tsx`
    - `database/*.tsx` (modali di gestione tipologie/fornitori/articoli)
    - `orders/*.tsx` (Create/Edit/Manage/Orders/OrderCreated)
  - `repositories/`
    - `ordersRepository.ts`
  - `shared/`
    - `components/AppModal.tsx`
    - `data/` (mockCatalog, mockItems, index)
    - `repositories/` (catalogRepository, missingItemsRepository)
    - `services/supabaseClient.ts`
    - `state/` (catalogStore, missingItemsStore)
    - `types/` (index, items)
  - `state/`
    - `ordersStore.ts`
  - `styles/` + `styles.css`
  - `types/`
    - `index.ts`, `orders.ts`
  - `utils/`
    - `whatsapp.ts`

Cartelle sospette/strane:
- `web/src/assets/` è attualmente vuota (potenziale spazio per immagini statiche future).
- Nessun’altra cartella “orfana” evidente.

## 3. Risultati check statici

### 3.1 TypeScript – `npm run typecheck`

Comando:

- `npm run typecheck` (in `web/`).

Esito:

- `tsc --noEmit` eseguito con **exit code 0**.
- Nessun errore di tipo riportato.

Valutazione:

- TypeScript in stato **OK**: il progetto compila senza errori di tipo con la configurazione attuale (`web/tsconfig.json`).

### 3.2 Lint – `npm run lint`

Comando:

- `npm run lint` (in `web/`).

Esito:

- Exit code 127 con messaggio: `sh: eslint: command not found`.
- Interpretabile come:
  - lo script è configurato correttamente in `package.json`;
  - ma il comando `eslint` non è disponibile nel PATH in questo ambiente (probabilmente manca l’installazione globale o devDependency non risolta a runtime).

Valutazione:

- Config lint presente ma **non eseguibile** nell’ambiente attuale.
- Nessun report di errori/warning di lint, ma questo è dovuto al fallimento di esecuzione, non all’assenza di problemi.

### 3.3 Governance file lunghi

Elenco dei file più lunghi (da analisi wc -l sui .ts/.tsx in `web/src`):

1. `src/repositories/ordersRepository.ts` ≈ 417 righe
2. `src/pages/orders/CreateOrderPage.tsx` ≈ 272 righe
3. `src/shared/state/catalogStore.ts` ≈ 239 righe
4. `src/shared/repositories/catalogRepository.ts` ≈ 221 righe
5. `src/state/ordersStore.ts` ≈ 205 righe
6. `src/pages/DatabasePage.tsx` ≈ 152 righe
7. `src/pages/database/SuppliersManagerModal.tsx` ≈ 115 righe
8. `src/shared/state/missingItemsStore.ts` ≈ 113 righe
9. `src/shared/data/mockCatalog.ts` ≈ 109 righe

Osservazioni di governance:

- `ordersRepository.ts` supera nettamente la soglia di 300 righe: file monolitico con più responsabilità (query ordini, archiviazioni, delete, buildWhatsappText, ecc.).
- `CreateOrderPage.tsx`, `catalogStore.ts`, `ordersStore.ts` sono file densi di logica (stato, side-effect, UX) e candidati a essere spezzati.
- Non ci sono file da centinaia di righe “estreme” oltre questo set; la complessità è concentrata sui layer ordini/catalogo.

## 4. Codice morto / utilizzo dei file

### 4.1 Export principali

Ricerca di `export default` in `web/src` mostra:

- `App.tsx`, `main.tsx`.
- Tutte le pagine (`pages/**`), i modali (`pages/database/*.tsx`), le pagine ordini (`pages/orders/*.tsx`).
- Componenti ordini (`components/orders/*.tsx`).
- `shared/components/AppModal.tsx`.

Routing (`App.tsx`):

- Route installate:
  - `/` → `MissingItemsPage`.
  - `/database` → `DatabasePage`.
  - `/orders` → `OrdersPage`.
  - `/orders/create` → `CreateOrderPage`.
  - `/orders/manage` → `ManageOrdersPage`.
  - `/orders/created/:id` → `OrderCreatedPage`.

Dipendenze interne:

- `DatabasePage` usa i modali `database/*.tsx`.
- `OrdersPage` e `ManageOrdersPage` usano gli store e i componenti ordini.
- `CreateOrderPage` usa repository, store, tipi e componenti ordini.

### 4.2 Repositories e store

Uso di `ordersRepository`:

- Definito in `src/repositories/ordersRepository.ts`.
- Referenziato da:
  - `src/pages/orders/CreateOrderPage.tsx`.
  - `src/state/ordersStore.ts`.

Uso di `catalogRepository` e `missingItemsRepository`:

- `catalogRepository`:
  - definito in `src/shared/repositories/catalogRepository.ts`.
  - usato da `src/shared/state/catalogStore.ts`.
- `missingItemsRepository`:
  - definito in `src/shared/repositories/missingItemsRepository.ts`.
  - usato da `src/shared/state/missingItemsStore.ts`.

Store:

- `useCatalog` (catalogStore) usato da diverse pagine (`DatabasePage`, `CreateOrderPage`, `ManageOrdersPage`).
- `useMissingItems` usato da `MissingItemsPage` e `CreateOrderPage`.
- `useOrders` usato da pagine ordini.

Conclusione:

- **Nessun repository o store appare inutilizzato**: tutti hanno almeno un punto di utilizzo concreto.
- Tutti i componenti esportati come default sono referenziati nel routing o in altre parti dell’app.

### 4.3 File sospetti / mock

- `shared/data/mockCatalog.ts` e `shared/data/mockItems.ts`:
  - usati come fallback nei `store` (`catalogStore`, `missingItemsStore`) quando Supabase non è configurato o fallisce;
  - quindi non sono “morti”, ma parte del comportamento previsto in ambiente non configurato.
- `web/src/assets/` è vuota: candidata a essere rimossa o popolata; attualmente non rompe nulla.

Valutazione:

- Non si individuano file .ts/.tsx completamente orfani.
- L’eventuale codice “da verificare manualmente” riguarda solo:
  - la cartella `src/assets/` vuota;
  - eventuali utility future non ancora aggiunte.

## 5. Performance e bundle

### 5.1 Build e dimensioni dist

Comandi eseguiti in `web/`:

- `npm run build`
- `du -sh dist`
- `ls -lh dist` + `ls -lh dist/assets | sort -k5 -h | tail -n 10`

Risultati:

- Build:
  - `vite v5.4.21 building for production...`
  - 141 moduli trasformati.
  - Nessun errore o warning bloccante.

- Dimensioni `dist/`:
  - ~404K complessivi.

- Asset principali:
  - `dist/index.html` ~0.4 KB.
  - `dist/assets/logo-....png` ~12 KB.
  - `dist/assets/index-....css` ~11 KB (2.5 KB gzip).
  - `dist/assets/index-....js` ~375 KB (108–109 KB gzip).

Valutazione performance bundle:

- Per un’app interna, un bundle JS principale di ~375 KB (109 KB gzip) è accettabile.
- Il build produce **un bundle principale unico** (nessun code-splitting per route) + CSS + un’immagine.
- Non emergono asset eccessivamente pesanti (nessun mega-bundle o immagini enormi).

Opportunità di miglioramento:

- Eventuale introduzione di **code-splitting per route** (lazy loading delle pagine) per ridurre il tempo di caricamento iniziale.
- Eventuale ottimizzazione dei moduli più pesanti (es. se in futuro si aggiungono librerie large).

## 6. Performance dati e logiche runtime

### 6.1 Layer Supabase

Client Supabase (`shared/services/supabaseClient.ts`):

- Usa `@supabase/supabase-js` e legge variabili da:
  - `import.meta.env.VITE_SUPABASE_URL`
  - `import.meta.env.VITE_SUPABASE_ANON_KEY`
- In assenza di variabili:
  - logga un `console.warn` esplicito;
  - forza `effectiveUrl` e `effectiveKey` a valori fittizi (`https://example.invalid`, `missing-anon-key`) per evitare crash ma far fallire le query.
- Espone:
  - `supabase: SupabaseClient`;
  - `isSupabaseConfigured: boolean`.

Repositories:

- `ordersRepository`:
  - funzioni CRUD per ordini e linee (`getActiveOrders`, `getArchivedOrders`, `getOrderById`, `createOrderWithLines`, `archiveOrder`, `deleteOrder`, `updateOrder`, ecc.).
  - tutte le query sono centralizzate in questo file.
- `catalogRepository`:
  - accesso alle tabelle `tipologie`, `fornitori`, `articoli` (e relative join).
- `missingItemsRepository`:
  - accesso alla tabella `articoli_mancanti`.

Uso negli store:

- `useCatalog` e `useMissingItems` usano rispettivamente `catalogRepository` e `missingItemsRepository`.
- `useOrders` usa `ordersRepository`.
- Gli store implementano logiche di **load iniziale con fallback ai mock** se `isSupabaseConfigured` è false o se le query falliscono.

Osservazioni su performance dati:

- Le query sono raggruppate per dominio (catalogo, ordini, missing items), non sembra esserci N+1 evidente sul lato client.
- I caricamenti iniziali sono centralizzati negli store, non sparsi nei componenti.
- Possibili punti di ottimizzazione:
  - Caching più avanzato (es. riutilizzo dei dati tra pagine senza reload completo, invalidazione granularizzata).
  - Riduzione di eventuali reload globali in caso di navigazione tra pagine correlate.

### 6.2 UX di caricamento

- Gli store usano stati come `loadedFromSupabase`, fallback ai mock e gestione degli errori attraverso log in console.
- Non è stata effettuata una scansione completa di tutte le UI di loading, ma strutturalmente:
  - esiste distinzione tra dati mock e dati da Supabase;
  - l’uso di stati booleani e fallback suggerisce che almeno il caso “Supabase non configurato” è gestito in modo esplicito.

## 7. Sicurezza, config e governance

### 7.1 Variabili d’ambiente e chiavi Supabase

- Il client Supabase usa solo chiavi `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Non è presente alcuna **service role key** lato client.
- In assenza di chiavi, viene usato un host invalido e una key placeholder, senza esporre dati reali.

Valutazione:

- Config di sicurezza lato client **corretta** per un’app che usa solo la public anon key.
- La protezione effettiva dei dati resta demandata a:
  - RLS e policy di Supabase;
  - configurazione del progetto Supabase (non visibile dal codice, ma da documentare separatamente).

### 7.2 Gestione errori e logging

- Gli errori Supabase vengono loggati con `console.error` in repositories e store.
- Gli errori di submit e flussi critici (CreateOrderPage, useOrders) hanno log espliciti e alert utente.
- I messaggi di log contengono stack e oggetti errore, non segreti sensibili.

### 7.3 Governance documentale

`docs/` contiene:

- `01_SUPABASE_SETUP.md` – guida configurazione Supabase.
- `REPORT_MIGRAZIONE_EXPO_STEP1_DIAGNOSI.md` – diagnosi pre-rimozione Expo.
- `REPORT_MIGRAZIONE_EXPO_STEP2_BACKUP.md` – branch di archivio e backup pre-rimozione.
- `REPORT_MIGRAZIONE_EXPO_STEP3_RIMOZIONE.md` – rimozione definitiva blocco Expo.
- `REPORT_STATO_WEB_POST_EXPO.md` – stato della web app post-Expo.
- `REPORT_STEP5A_PULIZIE_SICURE.md` – pulizie strutturali sicure.
- `BACKUP_POLICY.md` – policy di backup.

Manca ancora:

- Un report di sintesi finale unico sullo stato “enterprise readiness” (questo documento lo copre a livello tecnico).

## 8. Roadmap di miglioramento (prioritizzata)

### STEP A – Alta priorità / basso rischio

1. **Ripristinare/eseguire il linting in modo affidabile**
   - Assicurarsi che `eslint` sia installato correttamente (devDependency e PATH).
   - Eseguire `npm run lint` e correggere gli eventuali errori/warning emersi.
   - Integrare il lint nel flusso CI (se esiste) per evitare regressioni.

2. **Mettere sotto controllo i file monolitici più critici**
   - Iniziare a pianificare il refactoring di:
     - `ordersRepository.ts` (417 righe).
     - `CreateOrderPage.tsx` (272 righe).
   - Almeno definire chiaramente le responsabilità di ciascuna sezione (lettura, scrittura, utilità, ecc.) come base per futuri split.

3. **Documentare chiaramente la configurazione Supabase per l’ambiente di produzione**
   - Allineare `01_SUPABASE_SETUP.md` e README con lo stato reale (URL, policy di sicurezza, RLS attese).

### STEP B – Media priorità

1. **Refactoring strutturale del dominio ordini/catalogo**
   - Spezzare `ordersRepository.ts` in moduli per responsabilità o aree logiche.
   - Estrarre hook dedicati da `CreateOrderPage.tsx` (es. `useCreateOrderForm`, `useSubmitOrder`).
   - Valutare refactoring di `catalogStore.ts`, `ordersStore.ts`, `missingItemsStore.ts` per ridurre complessità e duplicazione.

2. **Ottimizzazione performance del bundle**
   - Introdurre code-splitting per route:
     - lazy loading delle pagine (`DatabasePage`, `OrdersPage`, `CreateOrderPage`, ecc.).
   - Facoltativo: integrare un analyzer (es. plugin Vite) per vedere il contributo di ciascun modulo al bundle.

3. **Hardening del logging**
   - Rimuovere o condizionare i `console.log` di debug (soprattutto in `CreateOrderPage.tsx`).
   - Introdurre un piccolo wrapper di logging centralizzato (es. `logger.ts`) per standardizzare `error`/`warn`.

### STEP C – Nice to have

1. **Pulizia di cartelle residuali**
   - Valutare la rimozione di `web/src/assets/` se resta vuota a lungo.
   - Mantenere `attached_assets/` solo se collegata a processi esterni; altrimenti documentarne lo scopo.

2. **DX e orchestration**
   - Eventuale `package.json` minimale in radice per orchestrare comandi `web:dev`, `web:build`, `web:lint`, `web:audit`.
   - Aggiungere script extra in `web/package.json` (es. `test`, `build:analyze`) se verranno introdotti test o analisi bundle.

3. **Report enterprise di alto livello**
   - Creare in futuro un `REPORT_ENTERPRISE_READINESS.md` sintetico per CTO/management, basato su questo documento tecnico.

## 9. Valutazione complessiva "enterprise readiness"

- **TypeScript**: in stato ottimo (nessun errore di tipo).
- **Build e bundle**: stabile, dimensioni contenute per app interna, migliorabile con code-splitting.
- **Sicurezza client**: uso corretto della sola anon key Supabase, fallback sicuro in caso di env mancanti.
- **Struttura e governance**: repository pulito, parte Expo rimossa, documentazione di migrazione completa, policy backup definita.
- **Debolezze principali**:
  - lint non eseguibile nell’ambiente attuale → rischio di problemi di stile/qualità non intercettati automaticamente.
  - presenza di alcuni file monolitici nel dominio ordini/catalogo.
  - assenza di code-splitting e di analisi bundle avanzata.

Conclusione: BARnode Web è in uno stato **tecnicamente solido e ordinato**, adeguato per un’app interna, ma richiede ancora alcuni interventi mirati (lint affidabile, refactoring dei file più grandi, ottimizzazioni di bundle e logging) per raggiungere piena "enterprise readiness" a lungo termine.
