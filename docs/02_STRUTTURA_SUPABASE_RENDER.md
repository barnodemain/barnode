# 02 STRUTTURA SUPABASE E RENDER

## 1. Introduzione

Questo documento descrive la configurazione completa del backend di BARnode Web, con particolare riferimento a:

- l’istanza Supabase utilizzata dall’applicazione (schema, tabelle, RLS, indici);
- la configurazione di Render per il deploy dello static site generato da Vite;
- l’integrazione tra app React, store, repository e Supabase, inclusa la logica di fallback ai mock.

Questo file è **obbligatorio da mantenere aggiornato** a ogni modifica che coinvolge schema Supabase, policy RLS, variabili di ambiente, logica di repository/store o configurazione di deploy.

---

## 2. Configurazione Supabase — Stato reale

### 2.1 URL e chiavi

Supabase è configurato con i seguenti valori (ambiente attuale):

- `SUPABASE_URL = https://hizstywtuuevurgtqvqm.supabase.co`
- `SUPABASE_ANON_KEY = <valore anon corretto>`

Note operative:

- La chiave `anon` è l’unica chiave utilizzata dal frontend (Vite + React).
- La chiave `service_role` **non deve mai essere usata** in frontend o esposta in file accessibili dal client.

### 2.2 Struttura tabelle (schema `public`)

Lo schema reale utilizzato da BARnode Web è `public` e contiene le seguenti tabelle effettive.

#### Tabella `tipologie`

- `id` (`uuid`, **PK**)
- `created_at` (`timestamptz`, default `now()`)
- `nome` (`text`, `not null`)

#### Tabella `articoli`

- `id` (`uuid`, **PK**)
- `created_at` (`timestamptz`)
- `nome` (`text`, `not null`)
- `tipologia_id` (`uuid`, `not null`) → **FK** verso `tipologie.id` con `on delete cascade`

#### Tabella `missing_items`

- `id` (`uuid`, **PK**)
- `created_at` (`timestamptz`)
- `articolo_id` (`uuid`, `not null`) → **FK** verso `articoli.id` con `on delete cascade`

### 2.3 Indici attivi

Indici attualmente utilizzati per supportare le query del dominio BARnode Web:

- `idx_articoli_tipologia` su `articoli(tipologia_id)`
- `idx_missing_items_articolo` su `missing_items(articolo_id)`

### 2.4 RLS e policy (modalità sviluppo)

La Row Level Security (RLS) è attiva su tutte le tabelle del dominio (`tipologie`, `articoli`, `missing_items`).

Stato attuale (sviluppo):

- RLS: **ON** per tutte le tabelle.
- Policy definite:
  - `select`: allow all (tutti gli utenti anon possono leggere).
  - `insert`: allow all.
  - `update`: allow all.
  - `delete`: allow all.

Queste policy sono **provvisorie** e pensate solo per sviluppo / ambienti di test. In produzione dovranno essere ristrette per garantire autenticazione e autorizzazioni corrette.

---

## 3. Configurazione dell’app (frontend → Supabase)

### 3.1 Variabili Vite nel progetto (`web/.env.local`)

Il collegamento tra BARnode Web e Supabase avviene tramite variabili di ambiente Vite, definite in `web/.env.local` (non committato):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Queste variabili sono lette a build-time e iniettate nel bundle frontend tramite `import.meta.env`.

### 3.2 Integrazione nel codice

#### Supabase Client

- File: `web/src/shared/services/supabaseClient.ts`
- Il client viene creato con:
  - `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`
- `isSupabaseConfigured` viene calcolato come:
  - `true` solo se **entrambe** le variabili `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` sono valorizzate.
- Se `isSupabaseConfigured === false`:
  - il repository non esegue query reali verso Supabase;
  - l’app lavora esclusivamente con dati mock lato frontend.

#### Repository catalogo

- File: `web/src/shared/repositories/catalogRepository.ts`
- Funzioni principali:
  - `getTipologie()`
    - Legge dalla tabella `tipologie` solo colonne reali: `id`, `nome`, `created_at`.
    - Ordina per `nome` in modo crescente.
  - `getArticoliWithRelations()`
    - Legge da `articoli` con join implicita su `tipologie` tramite la FK `tipologia_id`.
    - Seleziona: `id`, `nome`, `tipologia_id`, `tipologie ( id, nome )`.
    - Mappa il risultato nel tipo applicativo `ArticoloWithRelations` con i campi:
      - `id`, `nome`, `tipologiaId`, `tipologiaNome`.
  - `createArticolo()`
    - Inserisce in `articoli` solo i campi reali: `nome`, `tipologia_id`.
  - `updateArticoloNome()`
    - Esegue un update del solo campo `nome` filtrando per `id`.
  - `deleteArticolo()`
    - Esegue un delete filtrato per `id` su `articoli`.
- Gestione errori:
  - Tutte le funzioni passano da `wrapQuery`, che ritorna sempre un `RepositoryResult<T>` con `{ data, error }` senza lanciare eccezioni nel chiamante.
  - In caso di `!isSupabaseConfigured`, `wrapQuery` restituisce direttamente un errore logico “Supabase non configurato (env mancanti)”.

#### Store catalogo (useCatalog)

- File: `web/src/shared/state/catalogStore.ts`
- Caso `Supabase NON configurato` (`!isSupabaseConfigured`):
  - Lo store carica tipologie e articoli da **mock locali** (`mockTipologie`, `mockArticoli`).
  - Tutte le operazioni di CRUD lavorano solo in memoria.
- Caso `Supabase configurato` (`isSupabaseConfigured === true`):
  - All’avvio, lo store chiama `getTipologie()` e `getArticoliWithRelations()`.
  - Se **entrambe** le query hanno successo:
    - Popola lo stato con i dati reali provenienti da Supabase.
    - Imposta `loadedFromSupabase = true`.
  - Se **una o entrambe** le query falliscono:
    - Logga in console un errore del tipo
      `"[useCatalog] Errore caricamento da Supabase"` con il dettaglio dell’errore.
    - Imposta `tipologie = []` e `articoli = []`.
    - Imposta `loadedFromSupabase = false`.
    - **Non** effettua alcun fallback ai mock.
- Mutazioni (CRUD Archivio) quando Supabase è configurato e `loadedFromSupabase === true`:
  - `addArticolo` / `updateArticoloNome` / `deleteArticolo`:
    - chiamano sempre le funzioni corrispondenti del repository Supabase;
    - all’esito positivo aggiornano lo stato locale in modo coerente con il DB.
- Risultato: quando Supabase è configurato correttamente e risponde senza errori, l’Archivio articoli usa **solo** dati reali da DB; i mock sono riservati alla modalità “offline” (env mancanti).

---

## 4. Configurazione Render

### 4.1 Tipo progetto

Su Render, BARnode Web è configurato come **Static Site**:

- il frontend viene buildato con Vite;
- i file statici finali si trovano sotto `web/dist/`;
- Render serve il contenuto di `dist` direttamente come sito statico.

### 4.2 Build & Publish

Impostazioni tipiche del servizio Static Site su Render per questo progetto:

- Build command:
  - `npm install && npm run build`
- Publish directory:
  - `dist`

> Nota: la build viene eseguita nella sottocartella `web/` del repository, secondo la configurazione del progetto Render (working directory impostata su `web`).

### 4.3 Variabili di ambiente da configurare su Render

Perché il client Supabase funzioni in produzione, su Render devono essere presenti le stesse env usate in sviluppo (prefisso Vite):

- `VITE_SUPABASE_URL = https://hizstywtuuevurgtqvqm.supabase.co`
- `VITE_SUPABASE_ANON_KEY = <anon key>`

Queste variabili devono essere impostate nella sezione **Environment** del servizio Static Site su Render.

### 4.4 Nota fondamentale sul build-time

Le variabili con prefisso `VITE_` vengono lette e inglobate nel bundle **al momento della build**.

Conseguenze operative:

- Qualsiasi modifica effettuata alle env su Render **non** ha effetto immediato sul sito già pubblicato.
- Per applicare le modifiche è necessario eseguire un nuovo deploy della build, idealmente usando:
  - "Manual Deploy" → "Clear Cache & Deploy".

### 4.5 Problema tipico risolto

Un errore ricorrente in configurazioni Supabase + Vite + Render è impostare `VITE_SUPABASE_URL` con il suffisso `/rest/v1` (endpoint HTTP) invece che con la **base URL di progetto**.

Effetto:

- Supabase può rispondere `404` o con errori di routing;
- le query verso le tabelle falliscono;
- l’app, se configurata con fallback ai mock in modalità errore, potrebbe mostrare dati finti o liste vuote.

Nel caso di BARnode Web:

- `VITE_SUPABASE_URL` deve essere esattamente `https://hizstywtuuevurgtqvqm.supabase.co` (senza suffissi aggiuntivi).
- In questa configurazione corretta, con env presenti e schema allineato, lo store usa esclusivamente i dati reali da Supabase per l’Archivio.

---

## 5. Flusso dati completo (riassunto)

Questo paragrafo riassume il comportamento end-to-end dal bootstrap della app fino alle operazioni di CRUD.

### 5.1 Bootstrap dell’app

All’avvio di BARnode Web:

1. Il client Supabase viene creato utilizzando le env `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
2. Lo store `useCatalog` valuta `isSupabaseConfigured`.
3. Se `isSupabaseConfigured === true`:
   - chiama `getTipologie()` e `getArticoliWithRelations()` dal repository;
   - se entrambe le query hanno successo, popola l’Archivio con i dati reali del DB;
   - se una delle query fallisce, logga l’errore e mostra liste vuote (senza mock).
4. Se `isSupabaseConfigured === false`:
   - carica `mockTipologie` e `mockArticoli`;
   - tutte le operazioni di CRUD sono solo in memoria.

### 5.2 CRUD Archivio (Supabase configurato)

Quando Supabase è configurato e il caricamento iniziale è andato a buon fine (`loadedFromSupabase === true`):

- **Create**
  - `addArticolo` chiama `createArticolo` nel repository (insert in `articoli`).
  - Se l’operazione ha successo, il nuovo articolo viene inserito nello stato locale con `tipologiaNome` coerente.

- **Update**
  - `updateArticoloNome` chiama `updateArticoloNome` del repository (update del campo `nome`).
  - Se l’operazione ha successo, il nuovo nome viene riflesso nello stato locale.

- **Delete**
  - `deleteArticolo` chiama `deleteArticolo` del repository (delete per `id`).
  - Se l’operazione ha successo, l’articolo viene rimosso dallo stato locale.

### 5.3 Uso dei mock

I mock di tipologie e articoli (`mockTipologie`, `mockArticoli`) hanno il seguente ruolo:

- Vengono utilizzati **solo** quando `isSupabaseConfigured === false`, cioè quando mancano o sono vuote le env `VITE_SUPABASE_URL` e/o `VITE_SUPABASE_ANON_KEY`.
- In quella modalità, l’app funziona completamente in locale, senza alcuna chiamata a Supabase.
- Quando Supabase è configurato correttamente:
  - lo store **non** ricorre ai mock, nemmeno in caso di errore di query;
  - in caso di errore le liste risultano vuote, in modo da non confondere dati reali e dati finti.

---

## 6. Manutenzione obbligatoria del file

Questo documento è **obbligatorio** da aggiornare ogni volta che:

- vengono modificate tabelle o colonne in Supabase;
- vengono aggiornate RLS o policy;
- vengono modificate le env su Render;
- viene cambiata la logica del repository o dello store;
- viene aggiunta una nuova tabella o funzione backend collegata a BARnode Web.

Cascade (o qualunque agente/strumento automatico di assistenza) deve mantenere questo file
sincronizzato **automaticamente** a ogni PR o intervento che tocca backend, Supabase o flussi di
deploy, assicurandosi che la documentazione rifletta sempre lo stato reale dell’infrastruttura e del
codice associato.
