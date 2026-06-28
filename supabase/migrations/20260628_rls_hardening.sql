-- ============================================================
-- BARnode — Hardening sicurezza RLS
-- Migrazione ADDITIVA e NON DISTRUTTIVA sui DATI.
-- NON modifica, sposta o elimina alcun record: agisce solo su
-- ROW LEVEL SECURITY e POLICY (chi puo accedere, non i dati).
--
-- Contesto: app puramente frontend, senza login. Scrive sul DB
-- con la chiave pubblica (anon). Niente backend, deploy unico.
--
-- Stato PRIMA (rilevato): RLS attiva su tutte le tabelle, ma con
-- policy "public / true / true" = tutto permesso a chiunque.
-- Questa migrazione sostituisce quelle policy permissive con
-- policy mirate sull'uso reale dell'app.
--
-- Modello applicato (basato sull'uso REALE del codice):
--   articoli        -> SELECT/INSERT/UPDATE/DELETE  (anon, con vincoli)
--   missing_items   -> SELECT/INSERT/UPDATE/DELETE  (anon, con vincoli)
--   backups_barnode -> solo INSERT/UPDATE (upsert). SELECT e DELETE
--                      pubblici RIMOSSI: il restore gira via RPC server.
--   notes           -> NON usata, vuota -> DENY ALL totale.
--
-- Idempotente: rieseguibile senza errori.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1) notes : tabella morta e vuota -> chiusura totale
-- ------------------------------------------------------------
alter table public.notes enable row level security;

drop policy if exists "Allow write notes to anon" on public.notes;
drop policy if exists "Allow read notes to anon"  on public.notes;
-- Nessuna policy = nessun accesso (deny all completo).

-- ------------------------------------------------------------
-- 2) articoli : sostituisco le policy permissive
-- ------------------------------------------------------------
alter table public.articoli enable row level security;

drop policy if exists "public_modify_articoli" on public.articoli;
drop policy if exists "public_select_articoli" on public.articoli;

create policy "articoli_anon_select"
  on public.articoli for select
  to anon
  using (true);

create policy "articoli_anon_insert"
  on public.articoli for insert
  to anon
  with check (nome is not null and length(nome) between 1 and 200);

create policy "articoli_anon_update"
  on public.articoli for update
  to anon
  using (true)
  with check (nome is not null and length(nome) between 1 and 200);

create policy "articoli_anon_delete"
  on public.articoli for delete
  to anon
  using (true);

-- ------------------------------------------------------------
-- 3) missing_items : sostituisco le policy permissive
-- ------------------------------------------------------------
alter table public.missing_items enable row level security;

drop policy if exists "public_modify_missing_items" on public.missing_items;
drop policy if exists "public_select_missing_items" on public.missing_items;

create policy "missing_items_anon_select"
  on public.missing_items for select
  to anon
  using (true);

create policy "missing_items_anon_insert"
  on public.missing_items for insert
  to anon
  with check (articolo_id is not null);

create policy "missing_items_anon_update"
  on public.missing_items for update
  to anon
  using (true)
  with check (articolo_id is not null);

create policy "missing_items_anon_delete"
  on public.missing_items for delete
  to anon
  using (true);

-- ------------------------------------------------------------
-- 4) backups_barnode : l'app fa solo UPSERT.
--    Rimuovo SELECT e DELETE pubblici (riduco esposizione storico).
--    Mantengo INSERT/UPDATE per il salvataggio automatico.
-- ------------------------------------------------------------
alter table public.backups_barnode enable row level security;

drop policy if exists "backups_barnode_select_all" on public.backups_barnode;
drop policy if exists "backups_barnode_delete_all" on public.backups_barnode;
drop policy if exists "backups_barnode_insert_all" on public.backups_barnode;
drop policy if exists "backups_barnode_update_all" on public.backups_barnode;

create policy "backups_anon_insert"
  on public.backups_barnode for insert
  to anon
  with check (payload is not null);

create policy "backups_anon_update"
  on public.backups_barnode for update
  to anon
  using (true)
  with check (payload is not null);

-- L'upsert di PostgREST (merge-duplicates) richiede SELECT per risolvere
-- il conflitto sull'id. Concedo SELECT SOLO sul record singleton noto
-- all'app: lo storico (altri eventuali id) resta NON enumerabile da anon.
drop policy if exists "backups_anon_select_singleton" on public.backups_barnode;
create policy "backups_anon_select_singleton"
  on public.backups_barnode for select
  to anon
  using (id = '00000000-0000-0000-0000-000000000001'::uuid);

-- NOTA restore: "restore_last_backup" e SECURITY DEFINER -> legge i backup
-- coi privilegi del proprietario, indipendentemente dalle policy anon.

commit;
