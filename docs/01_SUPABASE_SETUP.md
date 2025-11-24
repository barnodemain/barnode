# 📦 BARNODE / BAR9 — SUPABASE SETUP COMPLETO

Documento informativo unico per capire **esattamente**:

- struttura del database
- variabili ambiente
- connection string (direct + session pooler, con note IPv4)

---

## 1. Credenziali Supabase

### 🔗 URL progetto

https://gstdmbkkjcwahhpzmduk.supabase.co

### 🔑 ANON KEY (client)

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzdGRtYmtramN3YWhocHptZHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDY3MzMsImV4cCI6MjA3OTIyMjczM30.zXYIPNKRg8DI12okTsr9X7lt-IkRPtpijeN9l2NLkKk
```

### 🔐 SERVICE ROLE KEY (solo backend, **mai** nel client)

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzdGRtYmtramN3YWhocHptZHVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY0NjczMywiZXhwIjoyMDc5MjIyNzMzfQ.yjfkd8FKZwUQZYxCOsDFp5RcMLbuOVl2NLkKk
```

---

## 2. Variabili `.env` ufficiali

### 📱 Client (React + Vite, Windsurf Cascade)

Da inserire in `.env.local`:

```bash
VITE_SUPABASE_URL=https://gstdmbkkjcwahhpzmduk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzdGRtYmtramN3YWhocHptZHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDY3MzMsImV4cCI6MjA3OTIyMjczM30.zXYIPNKRg8DI12okTsr9X7lt-IkRPtpijeN9l2NLkKk
```

### 🖥️ Backend (Express / Render / Drizzle, solo server)

Da inserire nel file `.env` del backend:

```bash
SUPABASE_URL=https://gstdmbkkjcwahhpzmduk.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzdGRtYmtramN3YWhocHptZHVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY0NjczMywiZXhwIjoyMDc5MjIyNzMzfQ.yjfkd8FKZwUQZYxCOsDFp5RcMLbuOVl2NLkKk
```

---

## 3. Connection string Postgres

**Password database:** `Jazzclub-00!`

> Nota: il carattere `!` è supportato nella password dentro l’URI; se qualche tool dà problemi, puoi URL-encodarla (`Jazzclub-00%21`).

### 3.1 Direct Connection (DB principale — Not IPv4 compatible)

Connessione diretta al database Postgres (solo per ambienti che supportano IPv6):

```bash
postgresql://postgres:Jazzclub-00!@db.gstdmbkkjcwahhpzmduk.supabase.co:5432/postgres
```

Esempio variabile per Drizzle locale / tool che parlano IPv6:

```bash
DATABASE_URL=postgresql://postgres:Jazzclub-00!@db.gstdmbkkjcwahhpzmduk.supabase.co:5432/postgres
```

### 3.2 Session Pooler (Shared Pooler — ✅ IPv4 compatible)

Questa connessione passa dal pooler Supabase, IPv4 compatibile. Da usare quando:

- il provider è solo IPv4
- vedi warning "Not IPv4 compatible" sulla direct connection

```bash
postgresql://postgres.gstdmbkkjcwahhpzmduk:Jazzclub-00!@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

Esempio variabile dedicata:

```bash
POOLER_DATABASE_URL=postgresql://postgres.gstdmbkkjcwahhpzmduk:Jazzclub-00!@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

### ✔️ IPv4 / IPv6 — Come leggerla

**Direct connection**

- Host: `db.gstdmbkkjcwahhpzmduk.supabase.co`
- Supabase segnala: `Not IPv4 compatible` → principalmente IPv6.
- Usala da macOS, tool moderni o ambienti che supportano IPv6.

**Session pooler**

- Host: `aws-1-eu-west-1.pooler.supabase.com`
- Supabase segnala: `IPv4 compatible`.
- È quella giusta per piattaforme solo IPv4 (molti hosting, alcuni servizi CI, ecc.).

Per BAR9:

- lato app (Supabase JS) → usa sempre `VITE_SUPABASE_URL` (non questi URI)
- lato tool/Drizzle/script server → se vedi errori di rete, passa da `POOLER_DATABASE_URL`.

---

## 4. Struttura completa del database BAR9/BARNODE

Di seguito lo **schema SQL esatto** da eseguire nel SQL Editor di Supabase.
Riflette la scheda tecnica: niente giacenze, fornitori e tipologie con **solo nome**, gestione articoli mancanti, ordini e righe ordine.

```sql
-- =========================================================
-- BARNODE / BAR9 — SCHEMA INIZIALE SUPABASE
-- =========================================================

-- Estensione per UUID
create extension if not exists "pgcrypto";

-- ====================================
-- 1. TIPI ENUM DI SUPPORTO
-- ====================================

-- Stato degli ordini
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('attivo', 'archiviato');
  end if;
end$$;

-- Unità di misura delle righe ordine
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_unit') then
    create type order_unit as enum ('pezzo', 'cartone_6');
  end if;
end$$;

-- ====================================
-- 2. TABELLE DI BASE
-- ====================================

-- 2.1 TIPOLGIE (categorie articoli)
create table if not exists public.tipologie (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null unique,
  created_at  timestamptz not null default now(),
  is_attiva   boolean not null default true
);

comment on table public.tipologie is 'Categorie/tipologie degli articoli (es. Gin, Rum, Bibite).';
comment on column public.tipologie.nome is 'Nome della tipologia (categoria).';
comment on column public.tipologie.is_attiva is 'Soft delete: TRUE = attiva, FALSE = nascosta dall’app.';

-- 2.2 FORNITORI (solo nome, come da specifiche)
create table if not exists public.fornitori (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null unique,
  created_at  timestamptz not null default now()
);

comment on table public.fornitori is 'Fornitori degli articoli (solo nome, nessun contatto).';
comment on column public.fornitori.nome is 'Nome del fornitore (es. Martini & Rossi).';

-- 2.3 ARTICOLI
create table if not exists public.articoli (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  tipologia_id  uuid references public.tipologie(id) on delete set null,
  fornitore_id  uuid references public.fornitori(id) on delete set null,
  is_attivo     boolean not null default true,
  created_at    timestamptz not null default now()
);

comment on table public.articoli is 'Articoli gestiti da BAR9 (solo anagrafica, nessuna giacenza).';
comment on column public.articoli.nome is 'Nome articolo (es. Bombay Dry).';

create index if not exists idx_articoli_nome
  on public.articoli using btree (lower(nome));

create index if not exists idx_articoli_fornitore
  on public.articoli(fornitore_id);

-- ====================================
-- 3. ARTICOLI MANCANTI (HOME)
-- ====================================

create table if not exists public.articoli_mancanti (
  id           uuid primary key default gen_random_uuid(),
  articolo_id  uuid not null references public.articoli(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (articolo_id)
);

comment on table public.articoli_mancanti is 'Lista degli articoli mancanti mostrata nella Home.';
comment on column public.articoli_mancanti.articolo_id is 'Articolo marcato come mancante (senza quantità).';

-- ====================================
-- 4. ORDINI (TESTATA)
-- ====================================

create table if not exists public.ordini (
  id            uuid primary key default gen_random_uuid(),
  fornitore_id  uuid not null references public.fornitori(id) on delete restrict,
  status        order_status not null default 'attivo',
  note          text,
  whatsapp_text text,
  created_at    timestamptz not null default now(),
  archived_at   timestamptz
);

comment on table public.ordini is 'Ordini raggruppati per fornitore (attivi/archiviati).';
comment on column public.ordini.status is 'attivo = da evadere; archiviato = consegnato/chiuso.';
comment on column public.ordini.whatsapp_text is 'Testo generato per invio ordine via WhatsApp (opzionale).';

create index if not exists idx_ordini_fornitore
  on public.ordini(fornitore_id);

create index if not exists idx_ordini_status
  on public.ordini(status);

-- ====================================
-- 5. RIGHE ORDINE (DETTAGLIO)
-- ====================================

create table if not exists public.ordini_articoli (
  id                  uuid primary key default gen_random_uuid(),
  ordine_id           uuid not null references public.ordini(id) on delete cascade,
  articolo_id         uuid not null references public.articoli(id) on delete restrict,
  quantita            integer not null check (quantita > 0),
  unita               order_unit not null,
  quantita_ricevuta   integer check (quantita_ricevuta is null or quantita_ricevuta >= 0),
  from_mancanti       boolean not null default false,
  created_at          timestamptz not null default now()
);

comment on table public.ordini_articoli is 'Righe degli ordini (articolo + quantità in pezzi/cartoni).';
comment on column public.ordini_articoli.unita is 'pezzo o cartone_6 (opzione esclusiva).';
comment on column public.ordini_articoli.from_mancanti is 'TRUE se proviene dalla lista Articoli Mancanti.';

create index if not exists idx_ordini_articoli_ordine
  on public.ordini_articoli(ordine_id);

create index if not exists idx_ordini_articoli_articolo
  on public.ordini_articoli(articolo_id);

-- ====================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ====================================

alter table public.tipologie          enable row level security;
alter table public.fornitori          enable row level security;
alter table public.articoli           enable row level security;
alter table public.articoli_mancanti  enable row level security;
alter table public.ordini             enable row level security;
alter table public.ordini_articoli    enable row level security;

do $$
begin
  -- TIPOLGIE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tipologie' and policyname = 'tipologie_select_auth'
  ) then
    create policy tipologie_select_auth
      on public.tipologie
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tipologie' and policyname = 'tipologie_modify_auth'
  ) then
    create policy tipologie_modify_auth
      on public.tipologie
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tipologie'
      and policyname = 'tipologie_b2_update'
  ) then
    create policy tipologie_b2_update
      on tipologie
      for update
      to public
      using (true)
      with check (true);
  end if;

  -- FORNITORI
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'fornitori' and policyname = 'fornitori_select_auth'
  ) then
    create policy fornitori_select_auth
      on public.fornitori
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'fornitori' and policyname = 'fornitori_modify_auth'
  ) then
    create policy fornitori_modify_auth
      on public.fornitori
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  -- ARTICOLI
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'articoli' and policyname = 'articoli_select_auth'
  ) then
    create policy articoli_select_auth
      on public.articoli
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'articoli' and policyname = 'articoli_modify_auth'
  ) then
    create policy articoli_modify_auth
      on public.articoli
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  -- ARTICOLI MANCANTI
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'articoli_mancanti' and policyname = 'articoli_mancanti_select_auth'
  ) then
    create policy articoli_mancanti_select_auth
      on public.articoli_mancanti
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'articoli_mancanti' and policyname = 'articoli_mancanti_modify_auth'
  ) then
    create policy articoli_mancanti_modify_auth
      on public.articoli_mancanti
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  -- ORDINI
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ordini' and policyname = 'ordini_select_auth'
  ) then
    create policy ordini_select_auth
      on public.ordini
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ordini' and policyname = 'ordini_modify_auth'
  ) then
    create policy ordini_modify_auth
      on public.ordini
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  -- ORDINI_ARTICOLI
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ordini_articoli' and policyname = 'ordini_articoli_select_auth'
  ) then
    create policy ordini_articoli_select_auth
      on public.ordini_articoli
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ordini_articoli' and policyname = 'ordini_articoli_modify_auth'
  ) then
    create policy ordini_articoli_modify_auth
      on public.ordini_articoli
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end$$;

-- FINE SCHEMA
```

---

## 5. Riassunto struttura & IPv4

- Struttura Supabase allineata alla scheda tecnica BAR9 (solo articoli, tipologie, fornitori, mancanti, ordini).
- Le due connection string Postgres sono entrambe già pronte con password corretta:
  - `db.gstdmbkkjcwahhpzmduk.supabase.co` → direct (IPv6, Not IPv4 compatible).
  - `aws-1-eu-west-1.pooler.supabase.com` → session pooler (✅ IPv4 compatible).
- Per qualsiasi host che mostra problemi di rete → usare sempre la **Session Pooler URI**.

---

## 6. Env Expo / client mobile

- Client mobile: **Expo / React Native + TypeScript**.
- Client Supabase inizializzato in `src/shared/services/supabaseClient.ts` e legge:
  - `process.env.EXPO_PUBLIC_SUPABASE_URL`
  - `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Env da impostare (es. in `.env` nella root del progetto Expo o in EAS):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://gstdmbkkjcwahhpzmduk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY_DA_SEZIONE_1>
```

- Se le env mancano, il client usa fallback di sicurezza (`https://example.invalid` + `missing-key`) e tutte le chiamate falliscono → la UI vede liste vuote.
- Non usare mai la **SERVICE ROLE KEY** nel client Expo.

Sequenza minima per testare:

1. Impostare le env sopra e riavviare l'app Expo.
2. Eseguire in Supabase lo script `docs/04_RLS_OPTION_B2_APPLY.sql` (opzione B2, anon key) nel SQL Editor.
3. Verificare che:
   - Home / MissingItems e DatabaseScreen mostrino dati reali;
   - in console non compaiano più warning sulle env mancanti.

---

## 7. Stato integrazione app con Supabase

### 7.1 Data layer disponibili

- `supabaseClient` → client JS basato sulle env Expo.
- `supabaseDataClient` → wrapper typed che espone metodi di lettura/scrittura per:
  - `tipologie`, `fornitori`, `articoli`, `articoli_mancanti`, `ordini`.
- `dataClient` + `mockData` → mock di sola lettura (array vuoti) ancora usati solo in alcune parti legacy.

### 7.2 Mapping schema ↔ tipi TypeScript

Tipi definiti in `src/shared/types/index.ts`:

- `Articolo { id, nome, tipologiaId, fornitoreId }`
- `Tipologia { id, nome, descrizione? }`
- `Fornitore { id, nome, contatto?, email?, telefono?, indirizzo? }`
- `Ordine { id, fornitoreId, dataCreazione, dataConsegna?, stato, articoli: OrdineArticolo[], note? }`
- `OrdineArticolo { articoloId }`

`supabaseDataClient` mappa le righe Supabase con corrispondenza 1:1 (FK `tipologia_id` / `fornitore_id` mappate su `tipologiaId` / `fornitoreId`, ecc.). Gli ordini sono parzialmente mappati (articoli sempre array vuoto).

### 7.3 Schermate collegate a Supabase

- **Home / MissingItems (`src/screens/MissingItemsScreen.tsx`)**
  - Legge articoli da `supabaseDataClient.articoli.getAll()`.
  - Sincronizza la lista degli articoli mancanti con `articoli_mancanti` via:
    - `articoliMancanti.getAllIds()` (lettura iniziale);
    - `articoliMancanti.add(id)` / `articoliMancanti.remove(id)` (scrittura).

- **DatabaseScreen (`src/screens/DatabaseScreen.tsx`)**
  - Legge i dati reali da Supabase:
    - `tipologie.getAll()` → card Tipologie;
    - `fornitori.getAll()` → card Fornitori;
    - `articoli.getAll()` → lista Articoli (solo `is_attivo = true`).
  - La lista articoli è sempre ordinata alfabeticamente e filtrabile per:
    - testo di ricerca;
    - tipologia selezionata;
    - fornitore selezionato.
  - Il modal CSV usa solo parsing locale (`parseArticlesCsv`) e non scrive ancora sul DB.

- **Orders / Ordini**
  - Al momento usano ancora i mock (`mockData` / `dataClient`).
  - `supabaseDataClient.ordini` espone già una lettura base (`getAll`, `getById`), ma non è ancora collegata alla UI.

---

## 8. Diagnosi sintetica & roadmap

### 8.1 Stato attuale in breve

- Supabase configurato con schema completo + RLS base nel presente file (`01_SUPABASE_SETUP.md`) e script B2 (`04_RLS_OPTION_B2_APPLY.sql`).
- Home e DatabaseScreen lavorano già con dati reali (lettura; Home anche scrittura sugli articoli mancanti).
- Ordini e alcune utility usano ancora solo mock.
- Se le env Expo non sono impostate, tutto il layer Supabase torna automaticamente array vuoti.

### 8.2 Prossimi passi consigliati

1. **Stabilizzare env + RLS (opzione B2)**
   - Verificare che `EXPO_PUBLIC_SUPABASE_*` siano sempre configurate negli ambienti reali.
   - Applicare/riapplicare lo script `04_RLS_OPTION_B2_APPLY.sql` in caso di dubbi sulle policy.

2. **Portare Orders su Supabase**
   - Fase 1: usare `supabaseDataClient.ordini.getAll()` al posto di `mockOrdini` per le statistiche e la lista ordini.
   - Fase 2: aggiungere metodi di scrittura per `ordini` e `ordini_articoli` in `supabaseDataClient` e collegare la UI di creazione/gestione.

3. **Evolvere il flusso CSV in vero import**
   - Riutilizzare `parseArticlesCsv` per creare/aggiornare `tipologie`, `fornitori` e `articoli` nel DB.
   - Gestire dedupliche per nome e coerenza delle FK.

4. **Pulizia mock e hardening finale**
   - Una volta stabilizzate letture/scritture, confinare o rimuovere `mockData` / `dataClient` dai flussi di produzione.
   - Mantenere questo file (`01_SUPABASE_SETUP.md`) come unica fonte di verità per credenziali, schema, RLS e stato integrazione.

---

## 9. Script RLS – Opzione B2 (PUBLIC CRUD)

Questo script **idempotente** estende le policy RLS per consentire lettura/scrittura alle richieste con ruolo `public` (copre sia anon che authenticated), mantenendo intatte le policy `*_auth` esistenti.

Da eseguire nel SQL Editor di Supabase **dopo** aver applicato lo schema iniziale di questo file.

```sql
-- =========================================================
-- BARNODE / BAR9 — RLS OPTION B2 (ANON/PUBLIC CRUD)
-- Script idempotente: può essere eseguito più volte senza errori
-- Obiettivo: mantenere le policy *_auth esistenti e aggiungere
--            policy *_public_* per ruolo "public" (anon + authenticated)
-- =========================================================

-- Abilita (o lascia abilitata) la RLS sulle tabelle interessate
alter table if exists public.tipologie         enable row level security;
alter table if exists public.fornitori         enable row level security;
alter table if exists public.articoli          enable row level security;
alter table if exists public.articoli_mancanti enable row level security;
alter table if exists public.ordini            enable row level security;
alter table if exists public.ordini_articoli   enable row level security;

-- =========================================================
-- Policy PUBLIC (B2) — lettura + modifica per ruolo "public"
-- Nota: ruolo "public" include sia anon sia authenticated.
-- Le policy esistenti *_auth restano inalterate.
-- =========================================================

do $$
begin
  -- TIPOLGIE -------------------------------------------------
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tipologie'
      and policyname = 'tipologie_public_select_b2'
  ) then
    create policy tipologie_public_select_b2
      on public.tipologie
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tipologie'
      and policyname = 'tipologie_public_modify_b2'
  ) then
    create policy tipologie_public_modify_b2
      on public.tipologie
      for all
      to public
      using (true)
      with check (true);
  end if;

  -- FORNITORI ------------------------------------------------
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'fornitori'
      and policyname = 'fornitori_public_select_b2'
  ) then
    create policy fornitori_public_select_b2
      on public.fornitori
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'fornitori'
      and policyname = 'fornitori_public_modify_b2'
  ) then
    create policy fornitori_public_modify_b2
      on public.fornitori
      for all
      to public
      using (true)
      with check (true);
  end if;

  -- ARTICOLI -------------------------------------------------
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'articoli'
      and policyname = 'articoli_public_select_b2'
  ) then
    create policy articoli_public_select_b2
      on public.articoli
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'articoli'
      and policyname = 'articoli_public_modify_b2'
  ) then
    create policy articoli_public_modify_b2
      on public.articoli
      for all
      to public
      using (true)
      with check (true);
  end if;

  -- ARTICOLI_MANCANTI ----------------------------------------
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'articoli_mancanti'
      and policyname = 'articoli_mancanti_public_select_b2'
  ) then
    create policy articoli_mancanti_public_select_b2
      on public.articoli_mancanti
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'articoli_mancanti'
      and policyname = 'articoli_mancanti_public_modify_b2'
  ) then
    create policy articoli_mancanti_public_modify_b2
      on public.articoli_mancanti
      for all
      to public
      using (true)
      with check (true);
  end if;

  -- ORDINI ---------------------------------------------------
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ordini'
      and policyname = 'ordini_public_select_b2'
  ) then
    create policy ordini_public_select_b2
      on public.ordini
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ordini'
      and policyname = 'ordini_public_modify_b2'
  ) then
    create policy ordini_public_modify_b2
      on public.ordini
      for all
      to public
      using (true)
      with check (true);
  end if;

  -- ORDINI_ARTICOLI ------------------------------------------
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ordini_articoli'
      and policyname = 'ordini_articoli_public_select_b2'
  ) then
    create policy ordini_articoli_public_select_b2
      on public.ordini_articoli
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ordini_articoli'
      and policyname = 'ordini_articoli_public_modify_b2'
  ) then
    create policy ordini_articoli_public_modify_b2
      on public.ordini_articoli
      for all
      to public
      using (true)
      with check (true);
  end if;

end$$;
```

_Fine file_
