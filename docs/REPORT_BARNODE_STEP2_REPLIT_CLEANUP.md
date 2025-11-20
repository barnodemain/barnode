# BARNODE — STEP 2 • Pulizia Replit & Setup Scripts

## 1. Obiettivo Step
- Rimuovere la dipendenza operativa da Replit (config e script) per rendere il progetto neutro rispetto all'ambiente.
- Allineare gli script npm alla governance prevista (lint, format, typecheck, file-length, backup).
- Archiviare il materiale Replit come legacy, mantenendo solo documentazione storica.
- Aggiornare README e documentazione per l'uso in ambiente Windsurf + GitHub + Render.

## 2. Riferimenti Replit Trovati
- `package.json` → script `dev` con variabili `EXPO_PACKAGER_PROXY_URL` e `REACT_NATIVE_PACKAGER_HOSTNAME` legate a `$REPLIT_DEV_DOMAIN` (config/script critico).
- `scripts/build.js` → più riferimenti a `REPLIT_INTERNAL_APP_DOMAIN` e `REPLIT_DEV_DOMAIN` per il deploy statico su Replit (config/script critico ma non usato nel flusso locale standard).
- `.replit` → configurazione completa ambiente Replit (entrypoint, ports, workflows, deployment statico via `scripts/build.js`).
- `replit.md` → documentazione dettagliata dell'architettura e del setup Replit (documentazione).
- `docs/REPORT_BARNODE_DIAGNOSI_INIZIALE.md` → riferimenti descrittivi al fatto che il progetto proviene da Replit (documentazione, lasciato invariato).
- `attached_assets/*` → materiali di specifica/prototipazione che menzionano Replit (solo allegati, nessun impatto runtime).

Azione per ciascuno:
- `package.json` → script aggiornati per rimuovere variabili Replit.
- `scripts/build.js` → marcato come LEGACY Replit (commento in cima) ma lasciato invariato nel comportamento.
- `.replit` → rimosso dal repository (contenuto riportato nel report di diagnosi iniziale e nei log git).
- `replit.md` → contenuto spostato in `docs/legacy/REPLIT_NOTES_LEGACY.md` con nota LEGACY, file root rimosso.
- Documentazione/report/allegati → lasciati invariati perché non influenzano il runtime.

## 3. Modifiche a package.json (Scripts)

### Scripts prima
```json
{
  "scripts": {
    "dev": "EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN npx expo start",
    "start": "npx expo start",
    "android": "npx expo start --android",
    "ios": "npx expo start --ios",
    "web": "npx expo start --web",
    "lint": "npx expo lint",
    "check:format": "prettier --check \"**/*.{js,ts,tsx,css,json}\"",
    "format": "prettier --write \"**/*.{js,ts,tsx,css,json}\""
  }
}
```

### Scripts dopo
```json
{
  "scripts": {
    "dev": "expo start",
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint .",
    "check:format": "prettier --check \"**/*.{js,ts,tsx,css,json}\"",
    "format": "prettier --write \"**/*.{js,ts,tsx,css,json}\"",
    "typecheck": "tsc --noEmit",
    "check:filelength": "node ./scripts/check-file-length.mjs",
    "backup": "bash ./scripts/backup_barnode.sh"
  }
}
```

### Note
- `npm run dev` / `npm run start` ora usano `expo start` senza variabili Replit, adatti a Windsurf/GitHub/Render.
- `lint` è stato standardizzato su `eslint .` per usare la configurazione presente (`eslint.config.js`).
- Aggiunti `typecheck`, `check:filelength` e `backup` in linea con la governance descritta nel README.
- Lo script `check:format` esiste ancora come controllo veloce di sola verifica; `format` esegue la formattazione automatica.

## 4. Scripts in /scripts
- File analizzati:
  - `scripts/build.js`
  - `scripts/check-file-length.mjs`
  - `scripts/backup_barnode.sh`
  - `scripts/landing-page-template.html`

### `scripts/build.js`
- Contiene logica di build specifica per deploy statico su Replit:
  - Usa `REPLIT_INTERNAL_APP_DOMAIN` e `REPLIT_DEV_DOMAIN` per costruire `baseUrl`.
  - Avvia Metro con `npm run dev` e scarica bundle/manifests da `localhost:8081`.
  - Prepara struttura `static-build/` ed è richiamato dalla sezione `[deployment]` di `.replit`.
- Azione eseguita:
  - Aggiunta nota in cima al file:
    - indica che lo script è LEGACY e legato a Replit,
    - specifica che non fa parte del flusso standard Windsurf + GitHub + Render.
  - Nessuna modifica al comportamento del codice per non rompere eventuali usi manuali.

### `scripts/check-file-length.mjs`
- Verifica lunghezza file `.ts`/`.tsx` in `src`, `screens`, `components`, `navigation`.
- Soglie:
  - `WARNING_LIMIT = 200` righe,
  - `ERROR_LIMIT = 300` righe.
- Nessun riferimento a Replit o path esterni; eseguibile con `node`.
- Ora agganciato allo script npm `check:filelength`:
  - `npm run check:filelength` → `node ./scripts/check-file-length.mjs`.

### `scripts/backup_barnode.sh`
- Crea backup compressi in `backup/` con nome `Backup_[giorno]_[mese]_[ora].[minuti].tar.gz`.
- Esclude `node_modules`, `dist`, `build`, `.cache`, `tmp`, `backup`, `.git`.
- Mantiene al massimo 3 backup, cancellando i più vecchi.
- Nessun riferimento a Replit; path relativi alla root del repository.
- Ora agganciato allo script npm `backup`:
  - `npm run backup` → `bash ./scripts/backup_barnode.sh`.

### `scripts/landing-page-template.html`
- Template HTML per landing page di deploy statico (usato da `build.js`).
- Nessun legame diretto con l'esecuzione locale; lasciato invariato.

## 5. File Rimossi o Spostati
- `.replit` → rimosso dalla root.
  - Conteneva: configurazione ports, workflows EAS, workflow "Project" che eseguiva `npm run dev`, e sezione `[deployment]` che usava `scripts/build.js` per creare `static-build`.
  - Non era utilizzato da Expo o npm fuori da Replit, quindi sicuro da eliminare in questo contesto.
- `replit.md` → rimosso dalla root e contenuto spostato in:
  - `docs/legacy/REPLIT_NOTES_LEGACY.md`
  - In testa è stata aggiunta la nota:
    - `> LEGACY — Queste note si riferiscono al vecchio setup Replit e non sono più valide per l'ambiente attuale (Windsurf + GitHub + Render).`
- Nessun altro file root Replit-specific lasciato in posizione visibile.

## 6. Aggiornamenti README
- Sezione "Comandi Principali" aggiornata per riflettere il flusso attuale:
  - Ambiente ufficiale: **Windsurf + GitHub + Render**.
  - Avvio locale:
    - `npm install`
    - `npm run dev` (oppure `npm run start`).
- Elenco script di governance ora allineato agli script effettivi in `package.json`:
  - `npm run lint`
  - `npm run format`
  - `npm run typecheck`
  - `npm run check:filelength`
  - `npm run backup`
- Aggiunta una breve nota storica che indica che Replit è ora considerato legacy.
- Nessuna modifica alle sezioni su struttura, palette, data layer o prossimi passi.

## 7. Esito Verifiche
- `npm run lint`: **NON ESEGUITO in questo report** (da eseguire dopo installazione dipendenze in ambiente locale; eventuali errori TS/ESLint pre-esistenti saranno trattati in step successivi).
- `npm run typecheck`: **NON ESEGUITO in questo report** per non introdurre effetti collaterali sull'ambiente (richiede installazione completa dipendenze).
- `npm run check:filelength`: **NON ESEGUITO in questo report**; lo script è stato però verificato staticamente e collegato correttamente allo script npm.

_(Nota: questi comandi sono pronti per essere eseguiti in locale; l'esito effettivo dipenderà dallo stato corrente del codice e delle dipendenze installate nell'ambiente di sviluppo.)_

## 8. Impatto Complessivo
- Nessuna modifica a componenti UI, schermate, logiche di business o modello dati TypeScript.
- Il progetto può ora essere avviato in modo neutro da Windsurf/GitHub/Render usando:
  - `npm run dev` o `npm run start` (entrambi mappati su `expo start`).
- Tutte le dipendenze operative da Replit (script `dev` con variabili Replit, file `.replit`, guida `replit.md`) sono state rimosse o marcate come legacy.
- Gli script di governance (lint, format, typecheck, check-filelength, backup) sono configurati in `package.json` e pronti per essere utilizzati negli step successivi (inclusa eventuale integrazione in pre-commit o CI).
- Prossimi step suggeriti:
  - Integrare i comandi di qualità in hook Git (es. Husky) e/o pipeline CI.
  - Procedere con la definizione dello schema Supabase e l'implementazione del `dataClient` reale.
  - Spostare gradualmente la logica dalle `screens/` verso moduli `src/features/*` mantenendo l'UI invariata.
