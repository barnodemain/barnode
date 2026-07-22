# BARnode

App interna per bar/cocktail bar: lista della spesa (prodotti mancanti), catalogo prodotti e **ricettario digitale** (cocktail + preparazioni home-made), pensata per l'uso su smartphone durante il servizio. PWA installabile.

## Funzionalità

- **Home — Mancanti**: lista dei prodotti da comprare; si aggiunge via ricerca con suggerimenti.
- **Archivio**: catalogo completo dei prodotti (crea/modifica/elimina, quick-add ai mancanti).
- **Cocktail — Ricettario**: schede cocktail full-screen (ingredienti, dosi, metodo, garnish) + preparazioni home-made collegate (icona "ricetta" → bottom-sheet). Gestione completa dalla pagina stessa (matita/FAB, selector unità di misura e ghiaccio, editor procedimento a tutta pagina).
- **Admin** (protetto da PIN): Analysis (nomi doppi/simili con consolidamento), Import da testo, Export .txt, Note (elenco prodotti copiabile), Backup con ripristino, gestione Ricettario.
- **Backup automatico interno**: snapshot su DB di catalogo, mancanti e ricettario ad ogni modifica; ripristino dall'app (RPC `restore_last_backup`).
- **Condivisione WhatsApp** del link dell'app.
- **Mobile-first**: bottom-nav con safe-area, scroll-snap, ottimizzata per telefoni.

## Stack

- React 19 + TypeScript + Vite 7
- React Router 7
- Supabase (PostgreSQL + REST, RLS attive — vedi `supabase/migrations/`)
- Playwright (test E2E) · ESLint
- Deploy: Render (static site, autodeploy da `main`)

## Avvio locale

```bash
npm install
npm run dev        # http://localhost:5001
```

Serve un file `.env` nella root (vedi `.env.example`). Le variabili sono gestite centralmente via App Control; il client usa solo `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Comandi

```bash
npm run dev       # sviluppo (porta 5001)
npm run build     # typecheck + build di produzione in dist/
npm run lint      # ESLint
npm run test:e2e  # test Playwright (mobile + desktop)
npm run preview   # anteprima della build (porta 5001)
```

## Database

Schema e policy RLS sono versionati in `supabase/migrations/` (migrazioni additive, da applicare in ordine nel SQL Editor di Supabase). Il seed del ricettario è in `supabase/seed/recipebook_seed.json`.

Tabelle principali: `articoli`, `missing_items`, `cocktails`, `cocktail_ingredients`, `preparations`, `preparation_ingredients`, `ignored_pairs`, `backups_barnode` (snapshot singleton).

## Struttura

```
src/
├── components/        # UI riusabile (BottomNav, Modal, ConfirmationDialog, …)
│   └── recipes/       # componenti del ricettario (schede, form, picker, editor)
├── hooks/             # useArticoli, useMissingItems, useRecipes, useRecipeAdmin, …
├── lib/               # supabase client, backupService, normalize, analysisGrouping, recipeFormat
├── pages/             # route (Home, Archivio, Cocktail, Settings, Analysis, …)
└── types/             # tipi condivisi
DNA/                   # documentazione operativa canonica (indice: DNA/00)
supabase/              # migrazioni SQL + seed
tests/                 # E2E Playwright
```

## Route

- `/` Home (mancanti) · `/archivio` Catalogo · `/cocktail` Ricettario
- `/settings` Admin con PIN → `/settings/{analysis,import/text,backup,notes,recipes}`

## Documentazione

Il contesto operativo per lo sviluppo (regole, architettura, flussi, decision log) è in `DNA/` — partire da `DNA/00_INDICE.md`. Il codice è l'unica fonte di verità; il DNA si aggiorna insieme al codice.

## Licenza

Privata — uso interno.
