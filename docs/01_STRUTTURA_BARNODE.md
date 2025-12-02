# Struttura generale del progetto BARnode

## Architettura

BARnode è un'app React + TypeScript + Vite mobile-first per la gestione inventario bar.

## Caratteristiche principali

- **Quick-add su Archivio**: Ogni articolo nel catalogo ha un pulsante "+" che aggiunge direttamente l'articolo alla lista dei mancanti (solo se non già presente)
- **Duplicate protection**: Il pulsante "+" è nascosto se l'articolo è già nella lista dei mancanti
- **Analysis feature**: Pagina per rilevare articoli simili o duplicati tramite analisi di parole chiave, con consolidamento automatico
- **Layout mobile-first**: Spacing ottimizzato tra titoli, barre di ricerca e liste per migliore leggibilità
- **Backup automatico**: Snapshot dei dati dopo ogni operazione CRUD
- **Splash screen**: Introduzione con logo e crediti al primo caricamento per sessione

## Stack

- React 18 + TypeScript
- Vite (dev server e build)
- Supabase (PostgreSQL backend)
- React Router 6 (routing)
- Ionicons (icone)

## Pagine

- `/`: Home - Lista articoli mancanti con search e quick-add
- `/archivio`: Catalogo articoli con CRUD e quick-add
- `/settings`: Menu impostazioni con IMPORTA, BACKUP, ANALYSIS
- `/settings/import/text`: Import bulk da testo
- `/settings/backup`: Backup/Restore
- `/settings/analysis`: Rilevamento articoli duplicati e consolidamento
