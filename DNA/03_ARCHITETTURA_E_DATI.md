# Architettura e dati

## Routing (da `src/App.tsx`)
- `/` → Home (lista mancanti, ricerca, quick-add)
- `/archivio` → Catalogo articoli (CRUD + quick-add)
- `/settings` → Menu impostazioni (protetto da PIN)
- `/settings/import/text` → Import bulk da testo
- `/settings/backup` → Backup / Restore
- `/settings/analysis` → Rilevamento duplicati e consolidamento
- `/settings/notes` → Pagina NOTE sincronizzata
- Splash screen una volta per sessione (`sessionStorage: hasSeenSplash`). Pagine in lazy-load.

## Schema Supabase
- `articoli` — catalogo: `id` (uuid), `nome` (text, Title Case), `created_at`
- `missing_items` — mancanti: `id`, `articolo_id`, `articolo_nome`, `created_at`
- `backups_barnode` — **snapshot singleton** (vedi sotto)
- `notes` — una sola riga attiva: `id`, `content`, `updated_at`; accesso `anon` via RLS

## Backup singleton
- Un unico record attivo, ID fisso `00000000-0000-0000-0000-000000000001`.
- Colonna `payload` JSONB: `{ articoli: [...], missing_items: [...] }`; `created_at` aggiornato a ogni snapshot.
- Ogni operazione CRUD critica fa `upsert` su questo ID, sovrascrivendo lo snapshot. Altri record sono **legacy**.
- Snapshot via `createAndSaveCurrentSnapshot()` (`src/lib/backupService.ts`), chiamato non-bloccante post-CRUD.

## RPC `restore_last_backup`
- PL/pgSQL `security definer`. Prende l'ultimo backup con `articoli` non vuoto, svuota `missing_items` e `articoli`, reinserisce da `payload`. Ritorna conteggi.
- Invocata dalla pagina Backup previa conferma utente. (SQL completo: nel codice/migrazioni Supabase, non duplicato qui.)

## Hook principali (`src/hooks/`)
- `useArticoli`: `articoli[]`, `createArticolo`, `updateArticolo` (cascade su missing_items), `deleteArticolo`, `searchArticoli`.
- `useMissingItems`: `missingItems[]`, `addMissingItem` (con duplicate check), `removeMissingItem`, `isArticoloMissing(id)` per render condizionali.
- `useConsolidation(fetchArticoli)`: stato + handler della pagina Analysis (selezione, nome finale, consolidamento, ignore via localStorage).

## Pagina Analysis (modulare)
- `lib/analysisGrouping.ts`: logica pura di raggruppamento (`groupArticlesBySharedKeywords`, `getCategory`, tipo `ArticleGroup`).
- `components/AnalysisGroupCard.tsx`: UI di una card-gruppo.
- `pages/Analysis.tsx`: orchestrazione (usa hook + componente).

## Client Supabase
- `src/lib/supabase.ts`: client creato da `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; espone `isSupabaseConfigured()`. È `null` se le env mancano.

## Normalizzazione nomi
- `normalizeArticleName()` in `src/lib/normalize.ts`: Title Case, trim, collapse spazi. Applicata ovunque si crei/modifichi un articolo (Archivio, Home FAB, ImportText, consolidamento).
