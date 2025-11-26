# BARnode Web – STEP 5B.2 Lint config classica

## 1. Contesto

- Obiettivo: passare da una config ESLint flat Expo (legacy) a una config classica `.eslintrc.cjs` locale nella cartella `web/`, mantenendo ESLint 8.x, e rendere `npm run lint` eseguibile **senza modificare alcun file in `web/src/**`**.
- Stato iniziale (dopo STEP 5B.1):
  - `eslint` presente in `web/` come devDependency (8.57.0).
  - Tooling aggiuntivo già installato: `eslint-config-expo`, `eslint-plugin-prettier`, `prettier`.
  - Esisteva una config legacy in radice: `eslint.config.cjs` (derivata dall’originario `eslint.config.js` Expo/flat).
  - Script `lint` in `web/package.json` ancora legato alla config legacy o con flag non compatibili col modello flat.

## 2. Config ESLint classica locale (`web/.eslintrc.cjs`)

È stato creato il file `web/.eslintrc.cjs` con una configurazione classica (non flat) per ESLint 8.x. Struttura logica:

- `root: true`.
- `env`:
  - `browser: true`, `es2022: true`, `node: true`.
- `parser`:
  - `@typescript-eslint/parser`.
- `parserOptions`:
  - `ecmaVersion: 'latest'`.
  - `sourceType: 'module'`.
- `settings`:
  - `react: { version: 'detect' }`.
- `plugins`:
  - `@typescript-eslint`, `react`, `react-hooks`, `prettier`.
- `extends`:
  - `eslint:recommended`.
  - `plugin:@typescript-eslint/recommended`.
  - `plugin:react/recommended`.
  - `plugin:react-hooks/recommended`.
  - `plugin:prettier/recommended`.
- `rules` minime:
  - `'react/react-in-jsx-scope': 'off'` (non necessario con React 17+).
  - `'@typescript-eslint/no-explicit-any': 'warn'` (non error, per diagnosticare senza bloccare tutto).
- `ignorePatterns`:
  - `['dist/*', 'node_modules/*']`.

Questa config è autonoma e non usa più `eslint/config` né estende config Expo.

## 3. DevDependencies ESLint effettive in `web/package.json`

Dopo STEP 5B.2, la sezione `devDependencies` di `web/package.json` contiene (rilevante per il lint):

- `eslint`: `^8.57.0`.
- `eslint-config-expo`: `^10.0.0` (ancora presente ma non più referenziato nella nuova config; da ripulire eventualmente in uno step futuro).
- `eslint-plugin-prettier`: `^5.5.4`.
- `prettier`: `^3.6.2`.
- `@typescript-eslint/eslint-plugin`: versione 8.x (coerente con ESLint 8.x).
- `@typescript-eslint/parser`: versione 8.x.
- `eslint-plugin-react`: 7.x.
- `eslint-plugin-react-hooks`: 4.x.

Altri dev tools:

- `@types/react`, `@types/react-dom`.
- `@vitejs/plugin-react-swc`.
- `typescript`.
- `vite`.

Tutte le dipendenze richieste dalla nuova `.eslintrc.cjs` risultano quindi installate come devDependencies in `web/`.

## 4. Script lint in `web/package.json`

Gli script nella sezione `scripts` di `web/package.json` sono stati portati nello stato desiderato:

- `"lint": "eslint src --ext .ts,.tsx"`.
- `"lint:fix": "eslint src --ext .ts,.tsx --fix"`.

Non sono più presenti riferimenti diretti a `../eslint.config.cjs`.

Gli altri script (`dev`, `build`, `preview`, `typecheck`, `audit`) sono rimasti invariati.

## 5. Esecuzione lint e problemi residui

### 5.1 Esecuzione lint con ESLint classico e `.eslintrc.cjs`

Comando lanciato (equivalente a `npm run lint` in `web/`):

- `eslint src --ext .ts,.tsx`.

Esito (riassunto):

- ESLint restituisce un errore simile a:
  - `Invalid option '--ext' - perhaps you meant '-c'? You're using eslint.config.js, some command line flags are no longer available.`

Interpretazione:

- Nonostante la presenza di `.eslintrc.cjs` locale in `web/`, il motore ESLint continua a:
  - rilevare e considerare la **config flat legacy** in radice (`eslint.config.cjs`),
  - applicare quindi le regole del nuovo modello CLI (che deprecano o cambiano semantica per alcuni flag come `--ext`).
- In pratica:
  - l’esecuzione di ESLint si comporta come se stesse usando un **flat config** (per via della presenza di `eslint.config.cjs` in una directory superiore),
  - ignorando di fatto la `.eslintrc.cjs` locale.

Conseguenza:

- `npm run lint` non arriva ancora alla fase di analisi del codice (errori/warning di regole), ma si ferma per conflitto di modello di configurazione:
  - flat config (radice) vs config classica `.eslintrc.cjs` (web).

### 5.2 Stato al termine di STEP 5B.2

- La **config classica locale** (`web/.eslintrc.cjs`) è presente e correttamente strutturata.
- Le devDependencies necessarie sono installate.
- Gli script `lint`/`lint:fix` in `web/package.json` puntano a ESLint su `src` con `--ext .ts,.tsx`, come richiesto.
- Tuttavia, a causa della **presenza di `eslint.config.cjs` in radice**, l’esecuzione continua a entrare nel percorso "flat config" di ESLint e:
  - non utilizza la `.eslintrc.cjs` locale come config principale,
  - blocca l’uso del flag `--ext` e quindi l’intera esecuzione.

## 6. Vincoli rispettati

- Nessun file in `web/src/**` è stato modificato.
- Non sono state toccate logiche di business, repository, store, pagine o componenti.
- Non è stata modificata la logica di Supabase o il routing.
- Sono stati toccati solo:
  - `web/.eslintrc.cjs` (nuovo file di configurazione classica ESLint),
  - `web/package.json` (sezione `devDependencies` e `scripts.lint`/`scripts.lint:fix`),
  - `web/package-lock.json` (per effetto di `npm install`).
- Il file `eslint.config.cjs` in radice **non è stato modificato ulteriormente** in questo step (resta come legacy che confligge con il nuovo setup classico).

## 7. Limiti attuali e prossimi passi (per STEP successivo)

Dato il vincolo di non toccare ancora la config legacy in radice, STEP 5B.2 non può portare fino in fondo l’obiettivo "`npm run lint` eseguibile al 100%". Il blocco residuo è dovuto a:

- Convivenza di **due modelli di config ESLint**:
  - flat config legacy (`eslint.config.cjs` in root),
  - config classica `.eslintrc.cjs` in `web/`.
- La logica di risoluzione di ESLint privilegia la flat config se presente nella gerarchia; questo:
  - rende inutilizzabile `--ext`,
  - e forza il CLI in modalità flat.

Prossimi passi concreti consigliati (STEP 5B successivo):

1. **Disattivare o isolare la config flat di radice**
   - Opzione A (pulizia): rinominare o spostare `eslint.config.cjs` fuori dal path ricercato dal CLI (o eliminarlo se non più necessario per altri progetti).
   - Opzione B (config avanzata): usare variabili d’ambiente/flag (`ESLINT_USE_FLAT_CONFIG=0` o simili, se supportati) per forzare l’uso della `.eslintrc.cjs` locale.

2. **Rieseguire `npm run lint` dopo la disattivazione della flat config**
   - Attendersi finalmente:
     - un report reale di errori/warning in `web/src/**`,
     - top regole e file problematici,
     - che serviranno come base operativa per STEP 5B.x (refactoring e hardening del codice).

3. **Optional, in uno step di pulizia successivo**
   - Rimuovere da `web/package.json` devDependencies non più necessarie (es. `eslint-config-expo`) se si decide di non usarle più da nessuna parte.

In sintesi, STEP 5B.2 ha:

- Creato una config ESLint classica locale in `web/.eslintrc.cjs`.
- Allineato le devDependencies necessarie (parser e plugin) nella web app.
- Aggiornato gli script `lint`/`lint:fix` a un formato classico.
- Messo in luce che il blocco residuo non è più nella config locale di `web/`, ma nella presenza della config flat legacy in radice, che va disattivata o spostata in uno step successivo per ottenere un lint pienamente funzionante.
