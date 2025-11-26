# BARnode Web – STEP 5B.1 Lint (solo diagnosi)

## 1. Contesto e obiettivo

- Progetto: **BARnode Web** (solo web, post-Expo), root `Barnode/`, web app in `web/`.
- Stato iniziale:
  - `npm run typecheck` in `web/` → OK.
  - `npm run build` in `web/` → OK, bundle ~400 KB, nessun errore.
  - `npm run lint` in `web/` → fallimento con `eslint: command not found`.
- Obiettivo STEP 5B.1:
  - Ripristinare un ambiente ESLint funzionante per la web app.
  - Eseguire `npm run lint` per ottenere una fotografia completa di errori/warning.
  - **Senza modificare alcun file in `web/src/**` e senza usare `--fix`.**

## 2. Analisi setup ESLint attuale

### 2.1 Config ESLint

File in radice: `eslint.config.js` (poi rinominato in `eslint.config.cjs`).

Contenuto essenziale:

- Usa la nuova API `defineConfig` e flat config Expo:
  - `const { defineConfig } = require('eslint/config');`
  - `const expoConfig = require('eslint-config-expo/flat');`
  - `const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');`
- Export:
  - `module.exports = defineConfig([expoConfig, eslintPluginPrettierRecommended, { ignores: ['dist/*'] }]);`

Dipendenze richieste dal config:

- `eslint` (fornisce `'eslint/config'`).
- `eslint-config-expo` (flat config Expo).
- `eslint-plugin-prettier` (via preset `/recommended`).
- `prettier` (necessario per il plugin `eslint-plugin-prettier`).

### 2.2 DevDependencies in web/package.json (pre-STEP 5B.1)

`web/package.json` iniziale (sezione `devDependencies`):

- `@types/react`
- `@types/react-dom`
- `@vitejs/plugin-react-swc`
- `typescript`
- `vite`

Assenti:

- `eslint`
- `eslint-config-expo`
- `eslint-plugin-prettier`
- `prettier`

Conclusione:

- La config ESLint a livello repo richiede tool che **non erano installati** nella web app.
- Lo script `lint` in `web/package.json` puntava alla config di radice, ma mancava l’intero stack ESLint.

## 3. Installazione/aggiornamento dipendenze ESLint

### 3.1 Installazione iniziale tooling ESLint

Comando eseguito in `web/`:

- `npm install -D eslint eslint-config-expo eslint-plugin-prettier prettier`

Risultato:

- Aggiunti 251 pacchetti (devDependencies e dipendenze transitive).
- NPM segnala 2 vulnerabilità moderate (già note dal contesto precedente; non affrontate in questo step).

DevDependencies di lint aggiunte:

- `eslint` (inizialmente versione 9.x installata in base al registry).
- `eslint-config-expo`
- `eslint-plugin-prettier`
- `prettier`

### 3.2 Primo tentativo di `npm run lint` con ESLint 9

Script `lint` (iniziale):

- `"lint": "eslint src --ext .ts,.tsx --config ../eslint.config.js"`

Comando eseguito:

- `npm run lint`

Esito:

- ESLint 9.x, errore:
  - `ReferenceError: require is not defined in ES module scope` (config trattata come ESM perché `.js` + `type: module` a livello utente).

Analisi:

- La config `eslint.config.js` viene interpretata come modulo ESM, ma il file usa `require` (CommonJS).
- Serve rendere la config chiaramente CJS (rinomina in `.cjs`).

## 4. Adattamento della config alla modalità CJS

### 4.1 Rinomina config

Comando eseguito in radice `Barnode/`:

- `mv eslint.config.js eslint.config.cjs`

Script `lint` aggiornato in `web/package.json` (via sostituzione mirata):

- Da:
  - `eslint src --ext .ts,.tsx --config ../eslint.config.js`
- A:
  - `eslint src --ext .ts,.tsx --config ../eslint.config.cjs`

### 4.2 Nuovo tentativo di `npm run lint`

Comando:

- `npm run lint`

Esito:

- ESLint 9.x segnala:
  - `Error: Cannot find module 'eslint/config'`
- Motivo:
  - La config `eslint.config.cjs` usa `require('eslint/config')`, API introdotta pienamente nel nuovo modello di config; la versione installata a questo punto (o la risoluzione dei moduli) non fornisce il path come previsto.

## 5. Downgrade ESLint a 8.x

Per massima compatibilità e stabilità, è stato effettuato un downgrade a ESLint 8.x.

Comando eseguito in `web/`:

- `npm install -D eslint@8.57.0`

Risultato:

- `eslint` bloccato alla versione 8.57.0.
- NPM avvisa che ESLint 8.57.0 è deprecato, ma supportato a livello di tooling.

### 5.1 Problema con `require('eslint/config')`

Nuovo tentativo con ESLint 8:

- Script `lint` aggiornato per rimuovere `--ext` (non supportato dal nuovo modello di config flat):
  - `"lint": "eslint src --config ../eslint.config.cjs"`
- Comando:
  - `npm run lint`

Esito:

- ESLint 8.57.0 segnala ancora:
  - `Error: Cannot find module 'eslint/config'` (stack trace punta a `eslint.config.cjs`).

Analisi finale:

- La config corrente si basa sulla nuova API `require('eslint/config')`, che è allineata al modello flat moderno e alla famiglia di versioni 9.x.
- ESLint 8.x **non espone** il modulo `'eslint/config'` richiesto dalla config.
- Con ESLint 9.x, invece, la config fallisce per mismatch tra ESM/CJS se non si adatta interamente alle nuove convenzioni.

## 6. Stato finale di STEP 5B.1

### 6.1 DevDependencies ESLint installate/aggiornate

DevDependencies legate al lint ora presenti in `web/package.json`:

- `eslint@8.57.0` (downgradato esplicitamente).
- `eslint-config-expo` (versione risolta dal registry al momento dell’installazione).
- `eslint-plugin-prettier`.
- `prettier`.

Altre devDependencies pre-esistenti (non toccate concettualmente):

- `@types/react`
- `@types/react-dom`
- `@vitejs/plugin-react-swc`
- `typescript`
- `vite`

### 6.2 Script NPM aggiornati in web/package.json

- `"lint": "eslint src --config ../eslint.config.cjs"`
- `"lint:fix": "eslint src --config ../eslint.config.cjs --fix"`

Altri script (`dev`, `build`, `preview`, `typecheck`, `audit`) invariati.

### 6.3 Stato di `npm run lint`

- **Non** è stato possibile ottenere una esecuzione completa del lint per vincoli di compatibilità tra:
  - config flat moderna (`require('eslint/config')`, `eslint-config-expo/flat`),
  - e la versione di ESLint effettivamente in uso (8.57.0).
- Il comando `npm run lint` termina con `exit code 2` e l’errore:
  - `Error: Cannot find module 'eslint/config'`.

Implicazioni:

- L’obiettivo "ESLint eseguibile via npm run lint e fotografia completa di errori/warning" **non è raggiunto** nello STEP 5B.1, ma:
  - Lo stato attuale del tooling è ora più vicino a un setup corretto (dipendenze installate, script aggiornati).
  - Resta aperta una decisione architetturale: adottare pienamente ESLint 9 + flat config, oppure retroportare la config al modello supportato da ESLint 8.

## 7. Vincoli rispettati

- Nessun file in `web/src/**` è stato modificato.
- Non sono state toccate logiche applicative (Supabase, ordini, store, routing, componenti).
- Non sono state cambiate le regole in `eslint.config.cjs` (ex `eslint.config.js`), se non la rinomina del file per allinearlo a CJS.
- Le uniche modifiche applicate riguardano:
  - devDependencies e `package-lock.json` in `web/`.
  - lo script `lint`/`lint:fix` in `web/package.json`.
  - la rinomina di `eslint.config.js` in `eslint.config.cjs` in radice.

## 8. Prossimi passi consigliati (STEP 5B.2)

1. **Decidere il modello ESLint da adottare**
   - Opzione A: allinearsi completamente a ESLint 9.x + flat config moderna.
     - Aggiornare ESLint a 9.x.
     - Riscrivere eventuali parti della config per essere compatibili con ESM o con il nuovo formato documentato.
   - Opzione B: tornare a una config compatibile con ESLint 8.x.
     - Sostituire l’uso di `require('eslint/config')` con una config tradizionale (es. `.eslintrc.cjs`), o seguire le linee guida di ESLint 8.

2. **Solo dopo la decisione architetturale:**
   - Rendere `npm run lint` eseguibile end-to-end.
   - Raccogliere finalmente:
     - numero di file controllati,
     - numero di errori/warning,
     - top regole violate,
     - top file problematici.

3. **Non appena il lint sarà eseguibile (in STEP 5B.2):**
   - Pianificare STEP successivo di refactor/hardening (es. ridurre file monolitici, rimuovere `console.log` inutili, ecc.).

In sintesi, STEP 5B.1 ha:
- Installato e configurato le devDependencies ESLint necessarie.
- Aggiornato gli script NPM per usare la config di radice.
- Identificato un **conflitto di versione/API tra la config ESLint attuale (flat moderna) e la versione di ESLint installata**.
- Preparato il terreno per una decisione mirata in STEP 5B.2 su quale modello ESLint adottare per la diagnosi completa degli errori di codice.
