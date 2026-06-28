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

## Rischi noti / da valutare
- **PIN `1909`** hardcoded client-side ([PinModal.tsx](../src/components/PinModal.tsx)): protezione "soft", visibile nel bundle. Da rafforzare se serve sicurezza reale.
- **Bundle** `index` ~430KB: `Analysis.tsx` (526 righe) è il file più grande, candidato a split se cresce.
- **GitHub Actions cron**: si disabilita dopo 60gg di inattività del repo (mitigato dai commit/deploy regolari).
