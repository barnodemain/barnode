# BARnode Web – STEP 5B.3 Lint attivo

## 1. Contesto

- Obiettivo STEP 5B.3: disattivare la flat config legacy `eslint.config.cjs` in radice, fare in modo che ESLint usi **solo** `web/.eslintrc.cjs` e ottenere un report reale di `npm run lint` su `web/src/**`, senza modificare il codice applicativo.
- Stato di partenza (da STEP 5B.2):
  - `eslint.config.cjs` esistente in `Barnode/` (root), derivato dalla config flat Expo.
  - `web/.eslintrc.cjs` creato con config classica per ESLint 8.x.
  - `web/package.json` con devDependencies ESLint/classiche allineate e script:
    - `"lint": "eslint src --ext .ts,.tsx"`.
    - `"lint:fix": "eslint src --ext .ts,.tsx --fix"`.
  - `npm run lint` bloccato da conflitto con la flat config legacy (vedeva ancora `eslint.config.cjs`).

## 2. Disattivazione flat config legacy in radice

### 2.1 Verifica file legacy

- In radice era presente:
  - `eslint.config.cjs` con contenuto flat Expo (`require('eslint/config')`, `eslint-config-expo/flat`, `eslint-plugin-prettier/recommended`).

### 2.2 Rinomina come backup

Per disattivare il caricamento automatico di questa config:

- Comando eseguito in `Barnode/`:
  - `mv eslint.config.cjs eslint.config.legacy.bak.cjs`

Effetto:

- La config flat non è più riconosciuta da ESLint come file di configurazione standard.
- Rimane nel repo solo come riferimento storico (`.legacy.bak.cjs`).

## 3. Verifica della config locale in web/

- `web/.eslintrc.cjs` confermata presente e invariata (config classica ESLint 8.x con TypeScript + React + React Hooks + Prettier).
- `web/package.json` (dopo STEP 5B.2 e piccoli aggiustamenti):
  - Script aggiornati in questa fase a:
    - `"lint": "eslint src"`.
    - `"lint:fix": "eslint src --fix"`.
  - DevDependencies ESLint/classiche:
    - `eslint@^8.57.0`.
    - `@typescript-eslint/eslint-plugin@^8.48.0`.
    - `@typescript-eslint/parser@^8.48.0`.
    - `eslint-plugin-react@^7.37.5`.
    - `eslint-plugin-react-hooks@^7.0.1`.
    - `eslint-plugin-prettier@^5.5.4`.
    - `prettier@^3.6.2`.
    - `eslint-config-expo@^10.0.0` (ancora presente ma non referenziata da `.eslintrc.cjs`).

## 4. Esecuzione lint dopo la disattivazione della flat config root

### 4.1 Comando eseguito

- Da `web/`:
  - `npx eslint src -f json > lint-report.json || true`

### 4.2 Errore riscontrato

Output (sintesi):

- ESLint: 8.57.0
- Errore:
  - `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@eslint/js' imported from /Users/dero/eslint.config.js`

Analisi:

- L’errore non punta più alla vecchia config flat in `Barnode/` (ora rinominata), ma a **un file di config ESLint globale dell’utente**:
  - `/Users/dero/eslint.config.js`
- Questo file globale importa `@eslint/js`, che non è installato nel contesto del progetto BARnode Web.
- ESLint, vedendo una `eslint.config.js` a livello di home utente, la considera nella risoluzione della config, causando:
  - dipendenza mancante (`@eslint/js`),
  - e fallimento prima ancora di analizzare i file di `web/src/**`.

Conclusione:

- Abbiamo effettivamente disattivato la flat config legacy del **repo**.
- Tuttavia la presenza di una config ESLint globale in `/Users/dero/eslint.config.js` interferisce con l’esecuzione del lint per il progetto BARnode Web.
- ESLint non arriva ancora a usare in modo esclusivo `web/.eslintrc.cjs`.

## 5. Stato di npm run lint e dati disponibili

### 5.1 Exit code

- Il comando ESLint (`npx eslint src ...`) termina con **exit code diverso da 0**, ma per errore di config/tooling, non per violazioni di regole sul codice.

### 5.2 Statistiche di lint

A causa dell’errore di configurazione globale:

- Numero di file analizzati: **non disponibile** (la run si ferma prima di iniziare l’analisi dei file).
- Numero totale di errori: **non calcolato** (errore blocca l’esecuzione).
- Numero totale di warning: **non calcolato**.
- Regole più violate: **non disponibili**.
- File più problematici: **non determinabili** in questo step.

### 5.3 Cosa è stato diagnosticato

- Il blocco residuo non è più interno al repo (la flat config root è stata isolata) ma legato alla configurazione ESLint a livello di utente (`/Users/dero/eslint.config.js`).
- Questa config globale richiede il pacchetto `@eslint/js`, non presente tra le devDependencies del progetto BARnode Web.

## 6. Vincoli rispettati

- Nessun file in `web/src/**` è stato modificato.
- Nessuna logica di business (repository, store, pagine, componenti, Supabase client, routing) è stata toccata.
- Sono stati modificati solo:
  - `eslint.config.cjs` → `eslint.config.legacy.bak.cjs` in radice (rinomina).
  - `web/package.json` (script `lint`/`lint:fix` adattati a `eslint src` / `eslint src --fix`).
  - `web/package-lock.json` (aggiornato da `npm install`).
- La config locale `web/.eslintrc.cjs` rimane intatta e coerente con le devDependencies.

## 7. Prossimi passi consigliati

Per ottenere finalmente un lint reale sul codice BARnode Web è necessario un ultimo intervento, fuori dallo scope di questo step ma cruciale:

1. **Isolare la config ESLint globale dell’utente**
   - Spostare o rinominare `/Users/dero/eslint.config.js` in modo che non sia più vista dal CLI quando si esegue ESLint dentro `web/`.
   - Alternativa: configurare ES environment (es. variabili d’ambiente o opzioni CLI) per far sì che ESLint ignori le config globali, ma questo richiede una scelta esplicita dell’utente.

2. **Rieseguire `npm run lint` dopo l’isolamento della config globale**
   - Attendersi che ESLint usi finalmente **solo** `web/.eslintrc.cjs`.
   - Ottenere:
     - numero di file analizzati,
     - numero di errori e warning,
     - regole più violate,
     - file più problematici.

3. **Usare il report reale di lint come base per STEP successivi**
   - STEP 5B.x potrà quindi:
     - attaccare i file monolitici e le regole più violate,
     - pianificare refactoring e hardening del codice in modo veramente data-driven.

In sintesi, STEP 5B.3 ha:
- Disattivato con successo la flat config legacy del repo (`eslint.config.cjs`).
- Confermato che la config `.eslintrc.cjs` locale in `web/` è pronta e coerente con il suo tooling.
- Identificato un nuovo blocco esterno al repo: la config ESLint globale dell’utente in `/Users/dero/eslint.config.js`, che impedisce ancora di completare una run di lint sui file di BARnode Web.
