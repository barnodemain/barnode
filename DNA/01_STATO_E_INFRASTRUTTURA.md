# Stato e infrastruttura

Informazioni operative reali per sapere "dov'è" ogni cosa. Verificate il 2026-06-28.

## Cos'è
BARnode — web app mobile-first per gestire l'inventario di un bar: catalogo articoli e lista dei "mancanti", con analisi duplicati, note sincronizzate, backup/restore ed export.

## Stack reale (da `package.json`)
- React **19** + TypeScript + Vite **7**
- `@supabase/supabase-js` (backend dati)
- `react-router-dom` **7** (routing)
- `react-icons` (icone)
- Solo frontend: nessun server backend proprio; i dati stanno su Supabase.

## Repository
- Remote `origin`: `git@github.com:barnodemain/barnode.git` (owner **barnodemain**)
- Branch operativa: **main**
- Esiste anche un remote locale `gitsafe-backup` e un branch `replit-agent` (residui dell'origine Replit del progetto).

## Deploy — Render
- Servizio **barnode**, tipo `static_site`, id `srv-d4jplf2li9vc73da4c6g`
- URL pubblico: **https://barnode-8gbl.onrender.com**
- Build: `npm install && npm run build` · publish path: `dist`
- **autoDeploy = ON**: ogni push su `main` pubblica in produzione → trattare ogni push come azione ad alto rischio.
- Env su Render: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_SW` (=false).

## Database — Supabase
- Progetto Supabase ref: **hizstywtuuevurgtqvqm** (`https://hizstywtuuevurgtqvqm.supabase.co`)
- Free tier: può andare in **pausa** per inattività → l'app mostra errore caricamento finché non si riattiva dal pannello Supabase. I dati NON si perdono.
- Accesso storicamente via login GitHub; l'account esatto legato al pannello è incerto (vedi memoria di sessione).

## Allineamento servizi
Render ↔ GitHub ↔ Supabase sono coerenti: stesso repo `barnodemain/barnode`, branch `main`, stesso progetto Supabase. ✅

## Variabili / segreti
Gestiti centralmente da **App Control** (bootstrap in `.agent/app-control.json`). Il `.env` è **generato**, mai scritto a mano. Mai committare `.env` / `.agent/` / `.mcp.json` (sono in `.gitignore`).

## Avvio locale
`npm run dev` → porta **5001** (standard di progetto). Build: `npm run build`. Lint: `npm run lint`.

## DA COMPLETARE
- `LINK_DEPLOY` e `LINK_DEPLOY ADMIN` su App Control risultano **vuoti**. Pubblico = `https://barnode-8gbl.onrender.com`. L'app non ha un'area admin separata (tutto dietro PIN), quindi `LINK_DEPLOY ADMIN` va valutato/popolato di conseguenza.
