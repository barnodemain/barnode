-- ============================================================
-- BARnode — Tabella ignored_pairs (analisi somiglianze)
-- Migrazione ADDITIVA e NON DISTRUTTIVA.
-- Crea una nuova tabella; NON tocca dati/tabelle esistenti.
--
-- Scopo: memorizzare in modo PERSISTENTE (cross-device) le coppie
-- di articoli che l'utente ha marcato "diversi" con "Ignora" nella
-- pagina Analysis, cosi non vengono piu riproposte.
--
-- Chiave di identita della coppia = `pair_key`:
--   i due NOMI normalizzati (minuscole, senza accenti/punteggiatura),
--   ordinati alfabeticamente e uniti con "||".
--   -> stabile anche se cambiano gli id o si spostano altri articoli.
--   -> non dipende dalla composizione di un "gruppo".
--
-- La tabella cresce di pochissimo (una riga per coppia ignorata).
-- RLS: coerente con il resto dell'app (frontend anon, no login).
--
-- Idempotente: rieseguibile senza errori.
-- ============================================================

begin;

create table if not exists public.ignored_pairs (
  pair_key   text primary key,
  name_a     text not null,
  name_b     text not null,
  created_at timestamptz not null default now()
);

-- Documentazione inline della colonna chiave
comment on table  public.ignored_pairs is 'Coppie di articoli marcate "diverse" (Ignora) nella pagina Analysis. pair_key = due nomi normalizzati ordinati e uniti con ||.';
comment on column public.ignored_pairs.pair_key is 'Chiave canonica: norm(name_a) e norm(name_b) ordinati alfabeticamente, join "||". Stabile a rinomini/spostamenti.';

alter table public.ignored_pairs enable row level security;

-- App puramente frontend (anon). L'utente legge le coppie ignorate,
-- ne aggiunge di nuove e puo rimuoverle (se in futuro si vuole "riesaminare").
drop policy if exists "ignored_pairs_anon_select" on public.ignored_pairs;
create policy "ignored_pairs_anon_select"
  on public.ignored_pairs for select
  to anon
  using (true);

drop policy if exists "ignored_pairs_anon_insert" on public.ignored_pairs;
create policy "ignored_pairs_anon_insert"
  on public.ignored_pairs for insert
  to anon
  with check (
    pair_key is not null and length(pair_key) between 1 and 500
    and name_a is not null and length(name_a) between 1 and 200
    and name_b is not null and length(name_b) between 1 and 200
  );

drop policy if exists "ignored_pairs_anon_delete" on public.ignored_pairs;
create policy "ignored_pairs_anon_delete"
  on public.ignored_pairs for delete
  to anon
  using (true);

-- Nessuna policy UPDATE: una coppia ignorata e immutabile (si crea o si elimina).

commit;
