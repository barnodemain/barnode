# BARnode – Migrazione Expo → Web – STEP 1 Diagnosi Repository

## 1. Contesto e obiettivo

Questo documento descrive in modo stabile la diagnosi tecnica del repository BARnode nella fase di migrazione da Expo/React Native a web (Vite/React).

- Obiettivo: individuare tutte le parti legate a Expo/React Native, separarle dalla nuova web app e classificare cosa può essere rimosso in sicurezza in una fase successiva.
- Scope: stato del repository alla data di redazione di questo documento (step 1 completato).

## 2. Albero repository (radice + 2 livelli)

Radice `Barnode/`:
- .config/
  - npm/
    - node_global/
- .expo/
- .git/
- .local/
  - state/
    - replit/
- assets/
  - images/
- attached_assets/
  - generated_images/
- backup/
  - .gitkeep
  - Backup_26_Nov_00.40.tar.gz
  - Backup_26_Nov_01.47.tar.gz
  - Backup_26_Nov_01.48.tar.gz
  - Backup_26_Nov_02.00.tar.gz
- docs/
  - .DS_Store
  - 01_SUPABASE_SETUP.md
- scripts/
  - backup_barnode.sh
  - build.js
  - check-file-length.mjs
  - git-commit-main.sh
  - landing-page-template.html
- shared/
- src/
  - App.tsx
  - components/
  - constants/
  - features/
  - hooks/
  - navigation/
  - screens/
  - shared/
  - types/
- web/
  - .DS_Store
  - .env.local
  - dist/
  - index.html
  - node_modules/
  - package-lock.json
  - package.json
  - postcss.config.cjs
  - src/
  - tsconfig.json
  - vite.config.ts
- File in radice:
  - .DS_Store
  - .env
  - .gitignore
  - README.md
  - app.json
  - babel.config.js
  - eslint.config.js
  - index.js
  - node_modules/
  - package-lock.json
  - package.json
  - tsconfig.json

## 3. Mappa codice Expo/React Native

### 3.1 Cartelle e file Expo/RN

- `.expo/`
  - Cartella standard di lavoro di Expo (cache e metadata). Non è usata dalla web app Vite.

- `src/` (radice)
  - Contiene il codice della app Expo/React Native:
    - `App.tsx`.
    - `src/components/*` (componenti React Native/Expo).
    - `src/navigation/*` (MainTabNavigator, opzioni di navigazione).
    - `src/screens/*` (DatabaseScreen, OrdersScreen, ecc.).
    - `src/shared/*` (icons, services, utils, ecc.).
  - Usa `react-native`, `@react-navigation/*` e altre librerie tipiche RN.
  - Collegato a Expo tramite alias TS/Babel (`@`, `@shared`) e `index.js` (vedi sotto).

- `assets/`
  - `assets/images/` contiene icone e splash utilizzate in `app.json`.
  - Non risultano import diretti nel codice della web app (`web/src`).

- `app.json`
  - Manifest principale Expo, con configurazione di:
    - nome, slug, versioni, ios/android/web.
    - icone, splash screen, favicon.
    - plugin `expo-splash-screen`, `expo-web-browser`.

- `babel.config.js`
  - `presets: ['babel-preset-expo']`.
  - `plugins`:
    - `module-resolver` con `root: ['./src']` e alias `@` → `./src`, `@shared` → `./src/shared`.
    - `react-native-reanimated/plugin`.

- `tsconfig.json` (radice)
  - `extends: "expo/tsconfig.base"`.
  - `compilerOptions.paths`:
    - `"@/*": ["src/*"]`.
    - `"@shared/*": ["src/shared/*"]`.

- `index.js`
  - `import { registerRootComponent } from 'expo';`
  - `import App from '@/App';`
  - `registerRootComponent(App);`
  - Entry point della app Expo/React Native.

- `package.json` (radice)
  - Script `dev`, `start`, `android`, `ios`, `web` che lanciano `expo start`.
  - Contiene tutte le dipendenze Expo/RN (elencate nel capitolo 4).

- `scripts/build.js`
  - Script di build/gestione legato all’ambiente Expo (numerose occorrenze di `expo`).

### 3.2 Codice e config Web (Vite/React)

- `web/`
  - `web/package.json`: dipendenze React/Vite e script `dev`, `build`, `preview`, `typecheck`, `lint`.
  - `web/src/**`: codice sorgente della web app (componenti React DOM, pagine, stato, repository Supabase, ecc.).
  - `web/vite.config.ts`: config Vite con plugin `@vitejs/plugin-react-swc`, senza alias verso la radice o `src/` Expo.
  - `web/tsconfig.json`: config TS specifica per la web app, con `include: ["src"]` e senza riferimenti a `expo/tsconfig.base`.
  - `web/index.html`, `web/postcss.config.cjs`, `web/.env.local`, `web/dist/`, `web/node_modules/`.

### 3.3 Verifica di assenza di collegamenti web → Expo

Ricerche effettuate in `web/src`:
- Nessuna occorrenza di `react-native`.
- Nessuna occorrenza di `expo` o pacchetti `expo-*`.
- Nessuna occorrenza di `@expo`.
- Nessuna occorrenza di `@react-navigation`.
- Nessun import verso `../src`, `../../src`, `../shared`, `../../shared`.

Conclusione: la web app è completamente confinata in `web/` e non importa codice, asset o config da `src/` o da configurazioni Expo.

## 4. Librerie Expo/React Native

### 4.1 Dipendenze Expo/RN in package.json (radice)

Dipendenze principali legate a Expo e React Native:

- Core Expo / React Native
  - `expo`
  - `react-native`
  - `react-native-web`

- Moduli Expo
  - `expo-document-picker`
  - `@expo/vector-icons`
  - `expo-blur`
  - `expo-constants`
  - `expo-font`
  - `expo-glass-effect`
  - `expo-haptics`
  - `expo-image`
  - `expo-linking`
  - `expo-splash-screen`
  - `expo-status-bar`
  - `expo-symbols`
  - `expo-system-ui`
  - `expo-web-browser`

- React Navigation
  - `@react-navigation/bottom-tabs`
  - `@react-navigation/elements`
  - `@react-navigation/native`
  - `@react-navigation/native-stack`

- Altre librerie RN
  - `react-native-gesture-handler`
  - `react-native-keyboard-controller`
  - `react-native-reanimated`
  - `react-native-safe-area-context`
  - `react-native-screens`
  - `react-native-worklets`

DevDependencies legate a Expo/RN:
- `babel-plugin-module-resolver` (per alias su `src/` Expo).
- `eslint-config-expo`.

Queste dipendenze sono utilizzate esclusivamente dal codice Expo in `src/`, dalle configurazioni `app.json`, `babel.config.js`, `tsconfig.json` (radice) e dall’entrypoint `index.js`.

### 4.2 Dipendenze della web app (web/package.json)

- `@supabase/supabase-js`
- `react`
- `react-dom`
- `react-router-dom`

DevDependencies:
- `@vitejs/plugin-react-swc`
- `typescript`
- `vite`
- `@types/react`, `@types/react-dom`

Nessuna dipendenza Expo/RN è presente in `web/package.json`. La web app usa solo React DOM + Vite.

## 5. Classificazione: eliminabili, non toccare, da verificare

### 5.1 Blocchi eliminabili in Fase 3 (se Expo viene dismesso)

Questi elementi sono legati unicamente alla app Expo/React Native e non sono utilizzati dalla web app Vite. Possono essere rimossi in Fase 3 a condizione di dismettere completamente Expo:

- `.expo/`.
- `src/**` (tutto il codice Expo/RN).
- `assets/**` (in particolare `assets/images/**` usato da `app.json`).
- `index.js` (entrypoint Expo).
- `app.json` (manifest Expo).
- `babel.config.js`.
- `tsconfig.json` (radice, che estende `expo/tsconfig.base`).
- `package.json` (radice) e relativo `node_modules/` radice, dopo eventuale migrazione degli script generali.
- `scripts/build.js` (script di build specifico per Expo).

### 5.2 Blocchi da non toccare (necessari per la web app o per il repo)

- `web/**` (tutta la web app: codice, config, dipendenze, output build).
- `.git/`, `.gitignore`.
- `.env` (radice), utilizzato anche dalla web app per configurazioni come Supabase.
- `eslint.config.js`.
- `README.md`.
- `backup/**` (backup storici; utili come safety net generale).
- `docs/**` (documentazione).
- `scripts/**` in generale, eccetto `scripts/build.js` che è Expo-specifico.
- `attached_assets/**`.
- `shared/` (vuota, ma neutra rispetto a Expo).

### 5.3 Blocchi da verificare manualmente

Non sono tecnicamente legati a Expo, ma la loro utilità funzionale va valutata caso per caso:

- `attached_assets/generated_images/**` (materiale grafico non referenziato dal codice web, potenzialmente usato per marketing o documentazione).
- `backup/**` (valutare policy di retention/spostamento fuori repo).
- `docs/**` (verificare aggiornatezza e rilevanza dei documenti).
- Alcuni script generali in `scripts/` (`backup_barnode.sh`, `git-commit-main.sh`, `check-file-length.mjs`), utili anche in un contesto solo web.

## 6. Rischi e condizioni per la rimozione

### 6.1 Rischi

- Rimozione del blocco Expo (configurazioni + codice + dipendenze) comporta la perdita definitiva della app mobile Expo/React Native.
- Rimozione di `assets/images/` comporta la perdita di icone, splash e favicon utilizzate dall’app Expo.
- Rimozione indiscriminata di script in `scripts/` può interrompere flussi di lavoro utili (backup, check file length, commit helper).

### 6.2 Condizioni prima della rimozione (Fase 3)

- Confermare la decisione di dismettere la app Expo/React Native (migrazione a web-only).
- Creare un branch Git di archivio con lo stato completo (web + Expo).
- Creare un backup completo `.tar.gz` della repo.
- Definire come e dove mantenere eventuali script/tooling generali (radice vs `web/`).

## 7. Preparazione allo STEP 3 (rimozione per blocchi)

Per la Fase 3 è consigliato procedere per blocchi:

1. Rimuovere o archiviare in altro repo il codice `src/**` e relativi asset Expo (`assets/**`).
2. Eliminare le configurazioni Expo (`app.json`, `babel.config.js`, `tsconfig.json` radice, `index.js`).
3. Ripulire le dipendenze Expo/RN dal `package.json` radice e rimuovere il relativo `node_modules` non più necessario.
4. Consolidare gli script generali in un `package.json` dedicato alla web app o in un minimo setup radice non legato a Expo.
5. Validare il funzionamento della web app eseguendo `npm install` e `npm run dev` dentro `web/`.
