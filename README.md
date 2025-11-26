# Barnode

Applicazione interna per la gestione dell'inventario e degli ordini di un cocktail bar.

Dal 26/11/2025 la versione Expo/React Native è stata **rimossa completamente**: il progetto vive ora interamente come web app React + Vite dentro la cartella `web/`.

## Struttura del Progetto (post-Expo)

```
barnode/
├── web/                  # Web app (React + Vite + TypeScript)
│   ├── src/              # Codice sorgente web
│   ├── public/index.html # Entry HTML (index.html in radice web/)
│   ├── vite.config.ts    # Configurazione Vite
│   ├── tsconfig.json     # Configurazione TypeScript
│   ├── package.json      # Dipendenze e script NPM della web app
│   └── dist/             # Build di produzione
├── docs/                 # Documentazione e report di migrazione
├── backup/               # Backup .tar.gz del repository
├── scripts/              # Script di utilità (backup, check-file-length, ecc.)
└── attached_assets/      # Asset allegati (es. immagini generate)
```

## Comandi Principali (solo web)

L'ambiente di riferimento attuale è **Windsurf + GitHub + Render**. Tutti i comandi di sviluppo e build vanno eseguiti dentro la cartella `web/`.

Per lavorare in locale:

```bash
cd web
npm install
npm run dev
```

Per creare una build di produzione:

```bash
cd web
npm run build
```

## Backup

Il sistema di backup utilizza lo script `scripts/backup_barnode.sh`.

Per eseguire un backup manuale dalla radice del progetto:

```bash
bash scripts/backup_barnode.sh
```

I backup sono salvati in `backup/` con formato `Backup_[giorno]_[mese]_[ora].[minuti].tar.gz`.
Per i dettagli e la policy di rotazione vedere `docs/BACKUP_POLICY.md`.

## Stato della Migrazione

- La versione Expo/React Native è stata rimossa completamente nella migrazione del 26/11/2025.
- L'applicazione ora vive interamente nella cartella `web/`.
- Lo stato precedente alla rimozione è conservato in:
  - branch Git `legacy/expo-full-archive`;
  - backup `backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz`.

## Configurazione `.env.local` per la web app

Per la web app, le variabili di ambiente vengono lette da `web/.env.local`.

Esempio (da adattare ai valori reali di Supabase):

```bash
VITE_SUPABASE_URL="https://...supabase.co"
VITE_SUPABASE_ANON_KEY="..."
```

Note:

- Il file `web/.env.local` **non va committato**.
- Se le variabili non sono configurate, la web app utilizza un client Supabase di fallback che fa fallire le query e mostra warning in console.

## Barnode Web (overview)

La web app offre tre sezioni principali (via React Router):

1. **Home** (`/`) – Missing items (articoli sotto scorta).
2. **Database** (`/database`) – Gestione tipologie, fornitori e articoli.
3. **Ordini** (`/orders` e sottopagine) – Creazione, gestione e archiviazione ordini.

L'integrazione con Supabase è già presente nei repository e nello stato della web app e può essere configurata tramite `.env.local`.

