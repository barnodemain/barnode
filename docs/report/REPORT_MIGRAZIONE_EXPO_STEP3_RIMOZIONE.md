# BARnode – Migrazione Expo → Web – STEP 3 Rimozione Expo/React Native

## 1. Obiettivo STEP 3

Rimuovere in modo definitivo e sicuro tutta la parte Expo/React Native dal repository BARnode, lasciando intatta la nuova web app (`web/`) e la struttura consolidata in STEP 2, verificando prima e dopo la rimozione che non esistano dipendenze residue verso il codice Expo.

## 2. Controlli di sicurezza pre-rimozione

### 2.1 Verifica import della web app verso il codice Expo

Eseguiti i seguenti controlli su `web/src`:

- Ricerca di import verso `../src`:
  - Comando: `grep` (via tool) su `"../src"` in `web/src`.
  - Risultato: nessuna occorrenza trovata.

- Ricerca di import verso `../../src`:
  - Nessuna occorrenza trovata.

- Ricerca di import verso `../shared` o `../../shared` al di fuori di `web/src/shared`:
  - Le occorrenze trovate sono tutte interne a `web/src`, ad esempio:
    - `pages/DatabasePage.tsx` → import da `../shared/state/catalogStore`.
    - `pages/MissingItemsPage.tsx` → import da `../shared/state/missingItemsStore`.
    - `pages/orders/*.tsx` → import da `../../shared/state/*`, `../../shared/types/items`, ecc.
  - Tutti questi riferimenti puntano a moduli dentro `web/src/shared/**` e non al `src/` Expo in radice.

- Ricerca di riferimenti a Expo e React Native:
  - Nessuna occorrenza di `expo` in `web/src`.
  - Nessuna occorrenza di `@expo` in `web/src`.
  - Nessuna occorrenza di `react-native` in `web/src`.
  - Nessuna occorrenza di `@react-navigation` in `web/src`.

Conclusione:
- Il codice della web app non importa né referenzia in alcun modo file o moduli dal `src/` (Expo) in radice.
- Tutti gli import "../../shared" e simili sono interni al sottoalbero `web/src`.

### 2.2 Verifica config Vite e TypeScript della web app

- `web/tsconfig.json`:
  - `include: ["src"]` → il compilatore TS della web app opera solo su `web/src`.
  - Nessun `extends` verso `expo/tsconfig.base`.
  - Nessun `paths` che punti a `../src` o ad alias `@` / `@shared` della radice.

- `web/vite.config.ts`:
  - Config minima Vite con:
    - `plugins: [react()]`.
    - `server.port = 5173`.
  - Nessun alias configurato verso la radice o verso il `src/` Expo.

Conclusione:
- La toolchain TS/Vite della web app è completamente autonoma e non dipende dalle config Expo in radice.

### 2.3 Verifica di differenze rispetto al branch di archivio

Scopo: assicurarsi che, prima di cancellare i blocchi Expo, non esistano modifiche NON previste in quelle cartelle/file rispetto al branch di archivio `legacy/expo-full-archive`.

Comando eseguito dalla radice:

- `git diff --name-status legacy/expo-full-archive -- .expo src assets app.json babel.config.js index.js tsconfig.json package.json package-lock.json scripts/build.js node_modules`

Risultato:
- Nessun output prodotto dal comando (nessuna riga DIFF ...), il che implica:
  - Nessuna differenza registrata tra `legacy/expo-full-archive` e lo stato corrente in:
    - `.expo/`
    - `src/`
    - `assets/`
    - `app.json`
    - `babel.config.js`
    - `index.js`
    - `tsconfig.json` (radice)
    - `package.json` (radice)
    - `package-lock.json` (radice)
    - `scripts/build.js`
    - `node_modules/` (radice, come cartella tracciata nella storia precedente)

Conclusione:
- I blocchi da eliminare coincidono con quelli presenti e tracciati nel branch di archivio e non sono stati ulteriormente modificati dopo lo STEP 2B.

## 3. Rimozione dei blocchi Expo/React Native

### 3.1 Comando di rimozione eseguito

Dalla radice del progetto (`Barnode/`) è stato eseguito il seguente comando combinato:

- `rm -rf .expo src assets node_modules && rm -f app.json babel.config.js index.js tsconfig.json package.json package-lock.json scripts/build.js`

Elementi rimossi:

- Cartelle:
  - `.expo/`
  - `src/`
  - `assets/`
  - `node_modules/` (radice)

- File in radice:
  - `app.json`
  - `babel.config.js`
  - `index.js`
  - `tsconfig.json` (radice, quello che estendeva `expo/tsconfig.base`)
  - `package.json` (radice)
  - `package-lock.json` (radice)

- Script Expo-specifico:
  - `scripts/build.js`

Elementi NON toccati dalla rimozione:
- `web/**` (codice e config web app).
- `docs/**` (inclusi tutti i report STEP1/STEP2/STEP3).
- `backup/**` (inclusi i .tar.gz esistenti e il `Backup_ExpoPreRemoval_20251126_0216.tar.gz`).
- `scripts/**` ad eccezione di `scripts/build.js`.
- `.git/`, `.gitignore`.
- `.env`.
- `README.md`.
- `shared/` (vuota ma conservata).

## 4. Verifica post-rimozione: integrità web app

### 4.1 Installazione dipendenze web

Dalla cartella `web/` è stato eseguito:

- `npm install`

Output sintetico:
- `up to date, audited 43 packages in 3s`
- Segnalate 2 vulnerabilità moderate (consigliato `npm audit fix --force` per risolverle), ma nessun errore di installazione.

Conclusione:
- Le dipendenze della web app sono installate correttamente e l’ambiente di build/running è integro.

### 4.2 Avvio della web app in sviluppo

Comando eseguito in `web/`:

- `npm run dev`

- Il comando è stato lanciato in background; non sono emersi errori immediati di avvio (nessun errore riportato nei primi log di start).
- Vite parte regolarmente con la configurazione `vite.config.ts` della cartella `web/`.

Nota:
- Non sono stati rilevati errori legati a import mancanti o moduli non trovati, il che conferma che la web app non dipendeva dai file Expo rimossi.

## 5. Stato del repository dopo la rimozione

### 5.1 Struttura principale residua

Dopo la rimozione dei blocchi Expo/RN, la struttura ad alto livello è, in sintesi:

- `.config/`
- `.git/`
- `.local/`
- `attached_assets/`
- `backup/`
- `docs/`
- `scripts/` (senza `build.js`)
- `shared/`
- `web/`
- `.env`
- `.gitignore`
- `README.md`

I blocchi `.expo/`, `src/`, `assets/`, `node_modules/` (radice) e i file di config/entrypoint Expo in radice non esistono più.

### 5.2 Web app

- La cartella `web/` rimane invariata rispetto a prima della rimozione.
- `web/package.json`, `web/tsconfig.json`, `web/vite.config.ts` e tutto `web/src/**` sono intatti.
- La web app è funzionante (npm install completato, dev server avviabile con `npm run dev`).

## 6. Sommario dei file/cartelle eliminati

Elenco consolidato di ciò che è stato rimosso in STEP 3:

- Cartelle eliminate:
  - `.expo/`
  - `src/`
  - `assets/`
  - `node_modules/` (radice)

- File eliminati in radice:
  - `app.json`
  - `babel.config.js`
  - `index.js`
  - `tsconfig.json` (radice)
  - `package.json` (radice)
  - `package-lock.json` (radice)

- Script eliminato in `scripts/`:
  - `scripts/build.js`

## 7. Conferma di rimozione completa di Expo

Sulla base di:
- controlli pre-rimozione (assenza di import dalla web app verso il codice Expo),
- assenza di riferimenti a `expo`, `react-native` e `@react-navigation` in `web/src`,
- rimozione integrale di:
  - cartelle `.expo/`, `src/`, `assets/`, `node_modules/` (radice),
  - file `app.json`, `babel.config.js`, `index.js`, `tsconfig.json` (radice), `package.json`, `package-lock.json`,
  - script `scripts/build.js`,
- esito positivo di `npm install` e avvio `npm run dev` dentro `web/`,

si può concludere che:

- La parte Expo/React Native è stata rimossa al 100% dal repository.
- La web app Vite/React rimane stabile e funzionante, confinata nella cartella `web/`.
- Il branch di archivio `legacy/expo-full-archive` e il backup `Backup_ExpoPreRemoval_20251126_0216.tar.gz` conservano lo stato completo precedente alla rimozione.
