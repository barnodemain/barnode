# Decision log

Decisioni tecniche rilevanti su BARnode. Solo scelte che un agent futuro deve conoscere per non rifarle o contraddirle. Le REGOLE di lavoro stanno in `CLAUDE.md` (governance), non qui.

| Data | Decisione | Motivo |
|------|-----------|--------|
| 2026-06-28 | `docs/` consolidata in `DNA/` (6 file numerati per priorità) | Standard enterprise; doc legacy disallineata dal codice |
| 2026-06-28 | Rimossi residui Replit (`.replit`, `replit.md`, `.local/`, alias `@assets`, `attached_assets/`); dev server su porta 5001 | Progetto migrato fuori da Replit; pulizia |
| 2026-06-28 | Pagina **Note** ripensata: da note libere sincronizzate → elenco prodotti sempre aggiornato dal DB (sola lettura, copiabile) | Scelta utente; risolve anche il bug delle 2 righe `notes` lette senza ordinamento |
| 2026-06-28 | Tabella `notes` **svuotata** (0 righe), struttura mantenuta | Non più usata dall'app dopo il ripensamento della pagina Note |
| 2026-06-28 | `npm audit fix` (no --force): 13 vuln → 0 | Erano tutte in devDependencies; nessun major cambiato |
| 2026-06-28 | Favicon = solo bicchiere (verde chiaro #4a9c3d, angoli arrotondati); logo completo per home/PWA | Il logo completo con testo è illeggibile a 16px nella scheda |
| 2026-06-28 | Keepalive Supabase via **GitHub Actions** (ping ogni 2gg) | Render Free non ha cron; GitHub Actions è gratis e vive nel repo. Era la causa delle pause Supabase |
| 2026-06-28 | Push via HTTPS + `GITHUB_TOKEN` (non SSH) | La chiave SSH non è autorizzata per l'owner `barnodemain` |
| 2026-06-28 | `Analysis.tsx` (526 righe) splittato in 4: `lib/analysisGrouping.ts` (logica pura), `hooks/useConsolidation.ts` (stato+handler), `components/AnalysisGroupCard.tsx` (UI card), `pages/Analysis.tsx` (114 righe, orchestrazione) | Governance: file sotto limite righe. Comportamento invariato (verificato lint+build+screenshot) |
| 2026-06-28 | Aggiunta gestione **safe-area** (notch/gesture-bar) per modalità PWA installata: `viewport-fit=cover` + `env(safe-area-inset-*)` su `.page-header-fixed` (top) e `.bottom-nav` (bottom) | Header/footer rischiavano di finire sotto le barre di sistema su iPhone con notch in modalità installata. Desktop invariato (safe-area=0). Navigazione già ottimale, non toccata. |
| 2026-06-28 | Suite **test E2E Playwright** (`tests/`, `playwright.config.ts`, script `test:e2e`): navigazione, flussi, screenshot mobile+desktop. Mock Supabase = zero scritture reali. 16 test passano | Progetto "già online" senza test: rete di sicurezza per modifiche future. Mobile su chromium (Pixel 5) per non scaricare WebKit. Esclusa dal bundle. |
| 2026-06-28 | **Cache condivisa** per articoli/missing (`lib/articoliStore.ts`, `lib/missingItemsStore.ts`): gli hook leggono dalla cache e fetchano solo se vuota; mutazioni aggiornano la cache + notificano le viste montate | Ogni cambio pagina rifaceva il fetch (misurato: 14 chiamate/3 navigazioni → 4, navigazioni successive 0). Consolidamento invalida la cache missing; restore backup fa reload (azzera cache). Verificato lint+build+16 E2E+sync test. |
| 2026-06-28 | **Hardening RLS** (`supabase/migrations/20260628_rls_hardening.sql`): sostituite le policy permissive `public/true/true` con policy `anon` mirate per operazione. `notes` → deny-all totale (vuota/inutilizzata). `articoli`/`missing_items` → CRUD anon con vincoli difensivi (nome 1-200 char, articolo_id non null). `backups_barnode` → solo INSERT/UPDATE + SELECT ristretto al solo record singleton (storico non enumerabile). Applicata via Management API. | Test penetrazione: chiunque con la chiave anon poteva insert/update/delete su tutte le tabelle. Senza login né backend (deploy unico, scelta utente) è il massimo ottenibile lato DB. Dati invariati (248+19). Verificato: write spazzatura bloccata, app funzionante, upsert backup OK. |

## Rischi noti / da valutare
- **Limite RLS senza login:** l'app scrive dal browser con la chiave anon, quindi `articoli`/`missing_items` restano insert/update/delete da chiunque abbia la chiave pubblica (mitigato da vincoli difensivi). Chiusura totale richiederebbe login Supabase o backend guardiano (Edge Function) — esclusi per non stravolgere il progetto / mantenere deploy unico. `notes` e storico `backups` invece sono chiusi.
- **PIN `1909`** hardcoded client-side ([PinModal.tsx](../src/components/PinModal.tsx)): protezione "soft", visibile nel bundle. Da rafforzare se serve sicurezza reale.
- **Bundle** `index` ~430KB (gzip ~127KB): normale per la SPA; code-splitting possibile se cresce.
- **GitHub Actions cron**: si disabilita dopo 60gg di inattività del repo (mitigato dai commit/deploy regolari).
- **App Control — limite scrittura agent:** dal canale agent (anon key + header) si può scrivere SOLO `project_env_variables` (es. `LINK_DEPLOY`). La tabella `projects` è in **sola lettura** via RLS: il campo `deploy_url` (link sotto il titolo nell'UI) NON è scrivibile dall'agent (la PATCH torna `*/0`), va messo a mano dall'interfaccia. Non perderci tempo via API.
