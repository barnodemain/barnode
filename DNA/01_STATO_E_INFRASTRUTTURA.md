# Stato e infrastruttura

Informazioni operative reali per sapere "dov'è" ogni cosa. Verificate il 2026-06-28.

## Cos'è
BARnode — web app mobile-first per gestire l'inventario di un bar: catalogo articoli e lista dei "mancanti", con analisi duplicati, pagina note (elenco prodotti), backup/restore ed export.

## Stack reale (da `package.json`)
- React **19** + TypeScript + Vite **7**
- `@supabase/supabase-js` (backend dati)
- `react-router-dom` **7** (routing)
- `react-icons` (icone)
- Solo frontend: nessun server backend proprio; i dati stanno su Supabase.

## Repository
- Remote `origin`: `git@github.com:barnodemain/barnode.git` (owner **barnodemain**)
- Branch operativa: **main** (unica branch; remote: solo `origin`).
- **Push:** SSH non autorizzato per l'owner → si pusha via HTTPS col `GITHUB_TOKEN` del `.env` (`git push https://barnodemain:<TOKEN>@github.com/barnodemain/barnode.git main`). Mai stampare il token.

## Deploy — Render
- Servizio **barnode**, tipo `static_site`, id `srv-d4jplf2li9vc73da4c6g`
- URL pubblico: **https://barnode-8gbl.onrender.com**
- Build: `npm install && npm run build` · publish path: `dist`
- **autoDeploy = ON**: ogni push su `main` pubblica in produzione → trattare ogni push come azione ad alto rischio.
- Env su Render: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_SW` (=false).

## Database — Supabase
- Progetto Supabase ref: **hizstywtuuevurgtqvqm** (`https://hizstywtuuevurgtqvqm.supabase.co`)
- Free tier: andrebbe in **pausa** dopo ~7gg di inattività, ma il **keepalive** (vedi sotto) lo previene. Se mai succedesse: i dati NON si perdono, si riattiva dal pannello Supabase.
- Tabelle: `articoli`, `missing_items`, `backups_barnode` (snapshot singleton), `notes` (svuotata/inutilizzata). Dettagli in `03_ARCHITETTURA_E_DATI.md`.
- Se l'app online dà `ERR_CONNECTION_REFUSED` su Supabase **solo da un browser** (non da altri device/incognito): è cache di rete del browser, non il DB — flush in `chrome://net-internals` (#sockets / #dns).

## Allineamento servizi
Render ↔ GitHub ↔ Supabase sono coerenti: stesso repo `barnodemain/barnode`, branch `main`, stesso progetto Supabase. ✅

## Variabili / segreti
Gestiti centralmente da **App Control** (bootstrap in `.agent/app-control.json`). Il `.env` è **generato**, mai scritto a mano. Mai committare `.env` / `.agent/` / `.mcp.json` (sono in `.gitignore`).

## Avvio locale
Test E2E: `npm run test:e2e` (Playwright, mock Supabase). `npm run dev` → porta **5001** (standard di progetto). Build: `npm run build`. Lint: `npm run lint`.

## Keepalive Supabase (doppio guardiano)
Il piano Free mette il progetto in **pausa dopo ~7gg di inattività**. Due guardiani indipendenti lo prevengono, entrambi con lettura minima (`articoli?select=id&limit=1`, chiave anon, nessuna scrittura):

1. **Principale — cron-job.org** (esterno all'account cron-job.org dell'utente): ping **giornaliero** (00:00 Europe/Rome), header `apikey` = anon key. **Notifiche email attive** su fallimento e su ripristino → se si rompe, l'utente lo sa subito. Nessun file nel repo. Disattivazione: dalla dashboard cron-job.org.
2. **Riserva — GitHub Actions** `.github/workflows/keepalive.yml`: ping **giornaliero** (cron `0 6 * * *`) con **3 tentativi** (attesa crescente). Secret repo `SUPABASE_URL` + `SUPABASE_ANON_KEY`. Avvio manuale dalla tab Actions. Rischio residuo: GitHub disabilita i cron dopo 60gg di inattività del repo (mitigato dai commit/deploy regolari).

**Perché doppio:** il 17/07/2026 il ping GitHub ha iniziato a fallire in silenzio (nessun avviso) → DB in pausa il 21/07. Due sistemi + allarme email evitano il ripetersi. Dettaglio in `06_DECISION_LOG.md` (2026-07-21). Per i **nuovi progetti**: solo cron-job.org.
