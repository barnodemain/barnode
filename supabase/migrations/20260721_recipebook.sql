-- ============================================================
-- BARnode — Ricettario interno (Cocktail + Preparazioni)
-- Migrazione ADDITIVA e NON DISTRUTTIVA.
-- Crea 4 nuove tabelle; NON tocca dati/tabelle esistenti.
--
-- Modello:
--   cocktails               -> scheda drink (bicchiere, ghiaccio, metodo, garnish)
--   cocktail_ingredients    -> righe ingrediente di un cocktail (dose, unità, ordine)
--   preparations            -> preparazione base (categoria, procedimento)
--   preparation_ingredients -> righe ingrediente di una preparazione
--
-- Collegamento cocktail -> preparazione: cocktail_ingredients.preparation_id
--   (nullable) punta alla preparazione home-made usata come ingrediente.
--
-- App puramente frontend (anon), sezione ricettario pubblica in lettura,
-- gestione (CRUD) dall'area Admin (stesso canale anon). RLS coerente col
-- resto del progetto: SELECT/INSERT/UPDATE/DELETE anon con vincoli difensivi.
--
-- Idempotente: rieseguibile senza errori.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1) cocktails
-- ------------------------------------------------------------
create table if not exists public.cocktails (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  bicchiere   text,
  ghiaccio    text,
  metodo      text,
  garnish     text,
  note        text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.cocktail_ingredients (
  id             uuid primary key default gen_random_uuid(),
  cocktail_id    uuid not null references public.cocktails(id) on delete cascade,
  nome           text not null,
  misura         text,           -- es. "1", "1 1/2", "top", "2" (tenuto come testo: il PDF usa frazioni)
  unita          text,           -- es. "oz", "ml", "dash", "sprz", "g", "spoon"
  preparation_id uuid,           -- FK verso preparations aggiunta più sotto (dopo la sua creazione)
  sort_order     integer not null default 0
);

create index if not exists idx_cocktail_ingredients_cocktail on public.cocktail_ingredients(cocktail_id);

-- ------------------------------------------------------------
-- 2) preparations (categoria per raggruppamento automatico)
-- ------------------------------------------------------------
create table if not exists public.preparations (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  categoria    text,            -- soda | cordiale | shrub | estratto | prebatch | infusione | sciroppo | aria | altro
  procedimento text,
  note         text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.preparation_ingredients (
  id             uuid primary key default gen_random_uuid(),
  preparation_id uuid not null references public.preparations(id) on delete cascade,
  nome           text not null,
  misura         text,
  unita          text,
  sort_order     integer not null default 0
);

create index if not exists idx_preparation_ingredients_prep on public.preparation_ingredients(preparation_id);

-- La FK cocktail_ingredients.preparation_id è stata dichiarata sopra ma preparations
-- viene creata dopo: la aggiungo qui in modo idempotente se non già presente.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'cocktail_ingredients_preparation_id_fkey'
      and table_name = 'cocktail_ingredients'
  ) then
    alter table public.cocktail_ingredients
      add constraint cocktail_ingredients_preparation_id_fkey
      foreign key (preparation_id) references public.preparations(id) on delete set null;
  end if;
end $$;

-- ------------------------------------------------------------
-- 3) RLS — sezione pubblica in lettura, CRUD anon con vincoli
-- ------------------------------------------------------------
alter table public.cocktails               enable row level security;
alter table public.cocktail_ingredients    enable row level security;
alter table public.preparations            enable row level security;
alter table public.preparation_ingredients enable row level security;

-- cocktails
drop policy if exists "cocktails_anon_select" on public.cocktails;
create policy "cocktails_anon_select" on public.cocktails for select to anon using (true);
drop policy if exists "cocktails_anon_insert" on public.cocktails;
create policy "cocktails_anon_insert" on public.cocktails for insert to anon
  with check (nome is not null and length(nome) between 1 and 200);
drop policy if exists "cocktails_anon_update" on public.cocktails;
create policy "cocktails_anon_update" on public.cocktails for update to anon
  using (true) with check (nome is not null and length(nome) between 1 and 200);
drop policy if exists "cocktails_anon_delete" on public.cocktails;
create policy "cocktails_anon_delete" on public.cocktails for delete to anon using (true);

-- cocktail_ingredients
drop policy if exists "cocktail_ing_anon_select" on public.cocktail_ingredients;
create policy "cocktail_ing_anon_select" on public.cocktail_ingredients for select to anon using (true);
drop policy if exists "cocktail_ing_anon_insert" on public.cocktail_ingredients;
create policy "cocktail_ing_anon_insert" on public.cocktail_ingredients for insert to anon
  with check (cocktail_id is not null and nome is not null and length(nome) between 1 and 200);
drop policy if exists "cocktail_ing_anon_update" on public.cocktail_ingredients;
create policy "cocktail_ing_anon_update" on public.cocktail_ingredients for update to anon
  using (true) with check (nome is not null and length(nome) between 1 and 200);
drop policy if exists "cocktail_ing_anon_delete" on public.cocktail_ingredients;
create policy "cocktail_ing_anon_delete" on public.cocktail_ingredients for delete to anon using (true);

-- preparations
drop policy if exists "preparations_anon_select" on public.preparations;
create policy "preparations_anon_select" on public.preparations for select to anon using (true);
drop policy if exists "preparations_anon_insert" on public.preparations;
create policy "preparations_anon_insert" on public.preparations for insert to anon
  with check (nome is not null and length(nome) between 1 and 200);
drop policy if exists "preparations_anon_update" on public.preparations;
create policy "preparations_anon_update" on public.preparations for update to anon
  using (true) with check (nome is not null and length(nome) between 1 and 200);
drop policy if exists "preparations_anon_delete" on public.preparations;
create policy "preparations_anon_delete" on public.preparations for delete to anon using (true);

-- preparation_ingredients
drop policy if exists "prep_ing_anon_select" on public.preparation_ingredients;
create policy "prep_ing_anon_select" on public.preparation_ingredients for select to anon using (true);
drop policy if exists "prep_ing_anon_insert" on public.preparation_ingredients;
create policy "prep_ing_anon_insert" on public.preparation_ingredients for insert to anon
  with check (preparation_id is not null and nome is not null and length(nome) between 1 and 200);
drop policy if exists "prep_ing_anon_update" on public.preparation_ingredients;
create policy "prep_ing_anon_update" on public.preparation_ingredients for update to anon
  using (true) with check (nome is not null and length(nome) between 1 and 200);
drop policy if exists "prep_ing_anon_delete" on public.preparation_ingredients;
create policy "prep_ing_anon_delete" on public.preparation_ingredients for delete to anon using (true);

commit;
