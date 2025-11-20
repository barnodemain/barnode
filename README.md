# Barnode

App mobile interna per la gestione dell'inventario e degli ordini di un cocktail bar.

## Struttura del Progetto

```
barnode/
├── src/
│   ├── features/          # Feature modules (future expansion)
│   │   ├── home/
│   │   ├── database/
│   │   └── ordini/
│   └── shared/            # Shared utilities and components
│       ├── components/    # Reusable UI components
│       ├── services/      # Data layer (Supabase integration - TODO)
│       ├── types/         # TypeScript interfaces
│       └── utils/         # Mock data and utilities
├── screens/               # Main app screens
│   ├── MissingItemsScreen.tsx
│   ├── DatabaseScreen.tsx
│   └── OrdersScreen.tsx
├── components/            # Base UI components
├── navigation/            # Navigation configuration
├── constants/             # Theme and design tokens
├── scripts/               # Build and maintenance scripts
│   ├── check-file-length.mjs
│   └── backup_barnode.sh
└── backup/                # Automated backups (max 3 files)
```

## Comandi Principali

L'ambiente di riferimento attuale è **Windsurf + GitHub + Render** (in passato il progetto è stato eseguito su Replit, ora considerato legacy).

Per lavorare in locale:

```bash
npm install
npm run dev      # oppure: npm run start
```

Script di utilità e governance disponibili:

- `npm run lint` - Controlla il codice con ESLint
- `npm run format` - Format automatico con Prettier
- `npm run typecheck` - Verifica i tipi TypeScript
- `npm run check:filelength` - Controlla la lunghezza dei file (warning >200, error >300 righe)
- `npm run backup` - Crea backup completo del progetto (mantiene ultimi 3)

## Comando Backup

Per eseguire un backup manuale:
```bash
npm run backup
```

Oppure esegui direttamente:
```bash
bash scripts/backup_barnode.sh
```

I backup sono salvati in `backup/` con formato: `Backup_[giorno]_[mese]_[ora].[minuti].tar.gz`

## Navigazione

L'app ha 3 sezioni principali:

1. **Home** - Visualizza articoli sotto scorta minima
2. **Database** - Gestisce tipologie, fornitori e articoli completi
3. **Ordini** - Crea e gestisce ordini ai fornitori

## Data Layer

**Nota**: Supabase sarà integrato in una fase successiva. Attualmente l'app utilizza dati mock locali.

I placeholder per l'integrazione Supabase si trovano in:
- `src/shared/services/dataClient.ts` - Stub functions per operazioni CRUD
- `src/shared/types/index.ts` - Interfacce TypeScript
- `src/shared/utils/mockData.ts` - Dati di esempio

## Palette Colori

- **Bianco Crema** (#F8F6F0) - Background principale
- **Verde Chiaro** (#B8D4B8) - Accenti e highlight
- **Verde Scuro** (#2D5A3D) - Navbar e elementi chiave
- **Nero** (#1A1A1A) - Testo principale

## Governance

### Regole Anti-Monolite

Il progetto include controlli automatici per mantenere i file leggibili:
- **Warning**: File > 200 righe
- **Error**: File > 300 righe (blocca la build)

### Backup Automatici

Il sistema di backup:
- Esclude `node_modules`, `dist`, `build`, `.cache`, `tmp`
- Mantiene solo gli ultimi 3 backup
- Formato timestamp leggibile (es. `Backup_19_Nov_22.51.tar.gz`)

## Prossimi Passi

1. Integrazione Supabase per persistenza dati reale
2. Implementazione CRUD completo per articoli/fornitori/tipologie
3. Flusso completo creazione ordini con invio email
4. Sistema di notifiche per articoli sotto scorta
5. Export PDF ordini
