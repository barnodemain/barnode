# Architettura e dati

## Routing (da `src/App.tsx`)
- `/` → Home (lista mancanti, ricerca, quick-add)
- `/archivio` → Catalogo articoli (CRUD + quick-add)
- `/settings` → Menu impostazioni (protetto da PIN)
- `/settings/import/text` → Import bulk da testo
- `/settings/backup` → Backup / Restore
- `/settings/analysis` → Rilevamento duplicati e consolidamento
- `/settings/notes` → Pagina NOTE (elenco prodotti aggiornato dal DB, sola lettura)
- Splash screen una volta per sessione (`sessionStorage: hasSeenSplash`). Pagine in lazy-load.

## Schema Supabase
- `articoli` — catalogo: `id` (uuid), `nome` (text, Title Case), `created_at`
- `missing_items` — mancanti: `id`, `articolo_id`, `articolo_nome`, `created_at`
- `backups_barnode` — **snapshot singleton** (vedi sotto)
- `notes` — una sola riga attiva: `id`, `content`, `updated_at`; accesso `anon` via RLS
- `ignored_pairs` — coppie "diverse" marcate con Ignora in Analysis: `pair_key` (PK, nomi normalizzati ordinati + `||`), `name_a`, `name_b`, `created_at`. RLS anon select/insert/delete. Migrazione `20260721_ignored_pairs.sql`. Cresce di 1 riga per coppia ignorata.
- **Ricettario** (migrazione `20260721_recipebook.sql`, RLS anon CRUD su tutte):
  - `cocktails` — `nome`, `bicchiere`, `ghiaccio`, `metodo`, `garnish`, `note`, `sort_order`
  - `cocktail_ingredients` — `cocktail_id` (FK cascade), `nome`, `misura` (testo: frazioni), `unita`, `preparation_id` (FK→preparations, set null: link home-made), `sort_order`
  - `preparations` — `nome`, `categoria` (soda/cordiale/shrub/estratto/prebatch/infusione/sciroppo/aria/altro), `procedimento`, `note`, `sort_order`
  - `preparation_ingredients` — `preparation_id` (FK cascade), `nome`, `misura`, `unita`, `sort_order`
  - Seed iniziale dal PDF in `supabase/seed/recipebook_seed.json` (17 cocktail, 18 preparazioni).

## Backup singleton
- Un unico record attivo, ID fisso `00000000-0000-0000-0000-000000000001`.
- Colonna `payload` JSONB (dal 2026-07-22 copre anche il ricettario): `{ articoli, missing_items, cocktails, cocktail_ingredients, preparations, preparation_ingredients }`; `created_at` aggiornato a ogni snapshot. Guard: se il DB risulta completamente vuoto (probabile errore di rete) lo snapshot NON viene sovrascritto.
- Ogni operazione CRUD critica fa `upsert` su questo ID, sovrascrivendo lo snapshot. Altri record sono **legacy**.
- Snapshot via `createAndSaveCurrentSnapshot()` (`src/lib/backupService.ts`), chiamato non-bloccante post-CRUD da `useArticoli`, `useMissingItems`, `useConsolidation` **e `useRecipeAdmin`** (save/delete cocktail e preparazioni).

## RPC `restore_last_backup`
- PL/pgSQL `security definer` (migrazione `20260722_backup_ricettario.sql`). Prende l'ultimo backup con `articoli` non vuoto; svuota e reinserisce `articoli`+`missing_items` e, **solo se il payload contiene le chiavi del ricettario**, anche le 4 tabelle ricette (ordine FK: preparations→cocktails→ingredienti). Snapshot vecchi senza ricette → le tabelle ricette restano intatte. Ritorna conteggi jsonb (ignorati dal client).
- Invocata dalla pagina Backup previa conferma utente.

## Hook principali (`src/hooks/`)
- `useArticoli`: `articoli[]`, `createArticolo`, `updateArticolo` (cascade su missing_items), `deleteArticolo`, `searchArticoli`.
- `useMissingItems`: `missingItems[]`, `addMissingItem` (con duplicate check), `removeMissingItem`, `isArticoloMissing(id)` per render condizionali.
- `useConsolidation(fetchArticoli)`: stato + handler della pagina Analysis (selezione, nome finale, consolidamento, ignore **persistente su DB** tabella `ignored_pairs`; carica gli ignorati all'avvio, upsert su Ignora).
- `useRecipes`: legge cocktail + preparazioni (con ingredienti via join), cache in-memory condivisa (`clearRecipesCache` per invalidare). `useRecipeAdmin`: CRUD ricette (save/delete cocktail e preparazioni; gli ingredienti si rimpiazzano delete+insert). `lib/recipeFormat.ts`: `formatDose` (gestisce misure-parola come "top"/"up").

## Pagina Analysis (modulare)
- `lib/analysisGrouping.ts`: logica pura di raggruppamento (`groupArticlesBySharedKeywords`, `getCategory`, tipo `ArticleGroup`).
- `components/AnalysisGroupCard.tsx`: UI di una card-gruppo.
- `pages/Analysis.tsx`: orchestrazione (usa hook + componente).

## Cache dati condivisa
- `lib/articoliStore.ts` e `lib/missingItemsStore.ts`: cache in-memory condivisa tra le pagine. Gli hook `useArticoli`/`useMissingItems` fetchano solo se la cache è vuota, riusano i dati tra le navigazioni e si sincronizzano via subscribe. Non persiste (sessione). Restore backup fa reload (azzera cache).

## Client Supabase
- `src/lib/supabase.ts`: client creato da `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; espone `isSupabaseConfigured()`. È `null` se le env mancano.

## Normalizzazione nomi
- `normalizeArticleName()` in `src/lib/normalize.ts`: Title Case, trim, collapse spazi. Applicata ovunque si crei/modifichi un articolo (Archivio, Home FAB, ImportText, consolidamento).
