# BARnode – Migrazione Expo → Web – STEP 2B Backup e Archivio

## 1. Contesto

Questo documento descrive le operazioni di messa in sicurezza del repository BARnode prima della rimozione della parte Expo/React Native.

Obiettivi principali:
- Agganciare la web app (`web/`) al versionamento Git con un commit chiaro.
- Creare un branch di archivio `legacy/expo-full-archive` che contenga sia la parte Expo che la web app.
- Generare un backup `.tar.gz` dedicato alla fase pre-rimozione: `Backup_ExpoPreRemoval_*.tar.gz`.

Data operazioni: 26/11/2025 (ora locale approssimativa: 02:16).

## 2. Commit di sicurezza (web app + diagnosi STEP 1)

### 2.1 Stato iniziale Git (sintesi)

Output significativo di `git status --short` prima delle operazioni STEP 2B:
- `M README.md`
- `M docs/01_SUPABASE_SETUP.md`
- `D backup/Backup_19_Nov_22.35.tar.gz`
- `?? .env`
- `?? backup/Backup_26_Nov_00.40.tar.gz`
- `?? backup/Backup_26_Nov_01.47.tar.gz`
- `?? backup/Backup_26_Nov_01.48.tar.gz`
- `?? backup/Backup_26_Nov_02.00.tar.gz`
- `?? docs/REPORT_MIGRAZIONE_EXPO_STEP1_DIAGNOSI.md`
- `?? web/`

Scelte operative:
- Non versionare `.env` (rimane untracked).
- Non versionare i `.tar.gz` in `backup/` (rimangono untracked).
- Includere nel commit:
  - Tutta la cartella `web/` (nuova web app).
  - Il file `docs/REPORT_MIGRAZIONE_EXPO_STEP1_DIAGNOSI.md` (diagnosi STEP 1).
  - Le modifiche a `README.md` e `docs/01_SUPABASE_SETUP.md`.

### 2.2 File aggiunti in staging

Comando eseguito:
- `git add web docs/REPORT_MIGRAZIONE_EXPO_STEP1_DIAGNOSI.md README.md docs/01_SUPABASE_SETUP.md`

### 2.3 Commit creato

Comando eseguito:
- `git commit -m "chore: add web app and expo migration diagnosis"`

Output rilevante:
- Commit creato su `main` con hash:
  - `5c2ad30753fde9e4db2e05a3b7f05e167ae114d7`
- Messaggio:
  - `chore: add web app and expo migration diagnosis`
- File chiave creati/modificati:
  - Creazione della web app (`web/`):
    - `web/index.html`
    - `web/package-lock.json`
    - `web/package.json`
    - `web/postcss.config.cjs`
    - `web/src/**` (App.tsx, pagine, componenti, stato, repository, tipi, utils, stili)
    - `web/tsconfig.json`
    - `web/vite.config.ts`
  - Documentazione:
    - `docs/REPORT_MIGRAZIONE_EXPO_STEP1_DIAGNOSI.md` (nuovo file)
    - `README.md` (modificato)
    - `docs/01_SUPABASE_SETUP.md` (modificato)

### 2.4 Stato Git dopo il commit

Dopo il commit, lo stato sintetico è:
- Working tree pulito per i file tracciati.
- Rimangono come untracked (non aggiunti al commit):
  - `.env`
  - i backup `.tar.gz` in `backup/`.

## 3. Branch di archivio `legacy/expo-full-archive`

### 3.1 Creazione branch

Comandi eseguiti:
- Verifica stato e branch corrente:
  - `git status --short && git branch --show-current`
- Creazione branch di archivio dalla situazione pulita di `main`:
  - `git checkout -b legacy/expo-full-archive`

Output rilevante:
- `Switched to a new branch 'legacy/expo-full-archive'`.
- Il branch `legacy/expo-full-archive` punta allo stesso commit di `main` nel momento della sua creazione.

### 3.2 Commit di riferimento del branch

Comandi eseguiti:
- `git rev-parse HEAD`
- `git log -1 --oneline`

Output:
- Hash HEAD:
  - `5c2ad30753fde9e4db2e05a3b7f05e167ae114d7`
- Ultimo commit (sia su `main` che su `legacy/expo-full-archive` al momento dell’operazione):
  - `5c2ad30 chore: add web app and expo migration diagnosis`

Conclusione:
- Il branch `legacy/expo-full-archive` è un fotogramma completo dello stato pre-rimozione Expo, e include:
  - La parte Expo/React Native (radice `src/`, config Expo, ecc.).
  - La nuova web app (`web/`).
  - La documentazione di diagnosi STEP 1.

### 3.3 Push remoto

- Non è stato eseguito alcun comando di push del branch di archivio.
- Da eseguire manualmente, se desiderato:
  - `git push -u origin legacy/expo-full-archive`

## 4. Ritorno su main

Comando eseguito:
- `git checkout main`

Output rilevante:
- `Switched to branch 'main'`
- Persistenza della riga:
  - `D       backup/Backup_19_Nov_22.35.tar.gz`

Nota:
- Il file `backup/Backup_19_Nov_22.35.tar.gz` risulta cancellato a livello di working tree rispetto allo storico Git; non viene comunque aggiunto né al commit né ad alcun backup come file tracciato.

## 5. Backup `.tar.gz` dedicato ExpoPreRemoval

### 5.1 Creazione del backup

Comando eseguito dalla radice del progetto:

- `mkdir -p backup && tar -czf backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz --exclude='node_modules' --exclude='dist' --exclude='build' --exclude='.cache' --exclude='.git' --exclude='backup/Backup_ExpoPreRemoval_*.tar.gz' .`

Note operative del comando:
- Viene creata (se non esiste) la cartella `backup/`.
- Il file risultante è:
  - `backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz`.
- Esclusioni applicate:
  - `node_modules`
  - `dist`
  - `build`
  - `.cache`
  - `.git`
  - qualsiasi altro file `backup/Backup_ExpoPreRemoval_*.tar.gz` pre-esistente

### 5.2 Verifica del backup

Comando eseguito:
- `ls -lh backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz`

Output rilevante (esempio):
- `-rw-r--r--  1 user  group  XXXM 26 Nov 02:16 backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz`

(Dove `XXXM` è la dimensione effettiva in MB; questo valore va usato come riferimento approssimativo.)

Conclusione:
- Il backup `backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz` contiene:
  - Tutto il repository (stato working tree al momento del comando),
  - Esclusi solo directory pesanti/di build e `.git`.
- I backup precedenti in `backup/` non sono stati sovrascritti o cancellati.

## 6. File MD di dettaglio STEP 2B

Il presente file:
- Percorso:
  - `docs/REPORT_MIGRAZIONE_EXPO_STEP2_BACKUP.md`
- Contenuti principali:
  - Contesto e obiettivi dello STEP 2B.
  - Descrizione del commit di sicurezza (hash, messaggio, file principali inclusi).
  - Dettagli sulla creazione del branch `legacy/expo-full-archive` (commit di riferimento, stato del push remoto).
  - Dettagli sul backup `Backup_ExpoPreRemoval_20251126_0216.tar.gz` (percorso, comando usato, dimensione approssimativa).
  - Nota sul fatto che `.env` e i vari `.tar.gz` rimangono non tracciati da Git.

## 7. Anomalie e decisioni future

- File `.env`:
  - Rimane non tracciato (scelta intenzionale per motivi di sicurezza e configurazione locale).
- File `.tar.gz` in `backup/` diversi da `Backup_ExpoPreRemoval_20251126_0216.tar.gz`:
  - Rimangono non tracciati.
  - La loro gestione (rotazione, spostamento, pulizia) è una decisione operativa futura.
- File `backup/Backup_19_Nov_22.35.tar.gz`:
  - Risulta come `D` rispetto allo storico Git;
  - Non è incluso nel commit di sicurezza;
  - L’eventuale ripristino o rimozione definitiva richiede una decisione esplicita.

In sintesi, dopo lo STEP 2B:
- Esiste un commit di sicurezza che include sia la web app che la diagnosi STEP 1.
- Esiste un branch di archivio `legacy/expo-full-archive` puntato a quel commit.
- Esiste un backup completo `backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz` pronto a essere usato come snapshot della situazione pre-rimozione Expo.
