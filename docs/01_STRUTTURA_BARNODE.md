# Struttura generale del progetto BARnode

## Architettura

BARnode è un'app React + TypeScript + Vite mobile-first per la gestione inventario bar.

## Caratteristiche principali

- **Quick-add su Archivio**: Ogni articolo nel catalogo ha un pulsante "+" che aggiunge direttamente l'articolo alla lista dei mancanti (solo se non già presente)
- **Duplicate protection**: Il pulsante "+" è nascosto se l'articolo è già nella lista dei mancanti
- **FAB Home (aggiungi articolo)**: Il pulsante "+" nella Home crea nuovi articoli nel catalogo ma **non** li aggiunge automaticamente alla lista dei mancanti; la lista mancanti viene aggiornata solo tramite ricerca/autocomplete o quick-add da Archivio
- **Analysis feature**: Pagina per rilevare articoli simili o duplicati tramite analisi di parole chiave, con consolidamento automatico
- **Layout mobile-first**: Spacing ottimizzato tra titoli, barre di ricerca e liste per migliore leggibilità
- **Backup automatico**: Snapshot dei dati dopo ogni operazione CRUD
- **Splash screen**: Introduzione con logo e crediti al primo caricamento per sessione
 - **Impostazioni protette da PIN**: Accesso alla pagina Settings subordinato all'inserimento di un PIN numerico (1909) tramite tastierino dedicato
 - **Pagina NOTE sincronizzate**: Testo note modificabile manualmente e sincronizzato tra dispositivi tramite Supabase (`notes`)
 - **Esportazione articoli**: Pulsante "Esporta articoli" nelle impostazioni per scaricare l'elenco articoli in formato testo

## Stack

- React 18 + TypeScript
- Vite (dev server e build)
- Supabase (PostgreSQL backend)
- React Router 6 (routing)
- Ionicons (icone)

## Pagine

- `/`: Home - Lista articoli mancanti con search e quick-add
- `/archivio`: Catalogo articoli con CRUD e quick-add
- `/settings`: Menu impostazioni (protetto da PIN) con IMPORTA, BACKUP, ANALYSIS, NOTE ed ESPORTA ARTICOLI
- `/settings/import/text`: Import bulk da testo
- `/settings/backup`: Backup/Restore (snapshop globale singleton)
- `/settings/analysis`: Rilevamento articoli duplicati e consolidamento
- `/settings/notes`: Pagina NOTE con textarea a tutto schermo, pulsante copia e sincronizzazione Supabase
