-- 20260722 — Estende il backup/ripristino interno al RICETTARIO.
--
-- Contesto: lo snapshot client (`createAndSaveCurrentSnapshot`) ora salva nel
-- payload JSONB anche cocktails, cocktail_ingredients, preparations,
-- preparation_ingredients (oltre ad articoli e missing_items).
-- Questa migrazione sostituisce la RPC `restore_last_backup` con una versione
-- che ripristina anche le 4 tabelle del ricettario.
--
-- Retro-compatibilità: se lo snapshot NON contiene le chiavi del ricettario
-- (backup vecchi), le tabelle ricette NON vengono toccate: si ripristinano
-- solo articoli + missing_items, come prima.
--
-- Additiva e sicura: nessuna tabella/colonna eliminata; la funzione viene
-- ricreata con lo stesso nome e nessun argomento (stessa chiamata client:
-- supabase.rpc('restore_last_backup')). Il valore di ritorno (conteggi jsonb)
-- è ignorato dal client, che controlla solo l'errore.

drop function if exists public.restore_last_backup();

create function public.restore_last_backup()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  n_articoli int := 0;
  n_missing int := 0;
  n_cocktails int := 0;
  n_cock_ings int := 0;
  n_preps int := 0;
  n_prep_ings int := 0;
  has_recipes boolean := false;
begin
  -- ultimo snapshot utile (con articoli non vuoto), come da contratto storico
  select * into b
  from public.backups_barnode
  where jsonb_array_length(coalesce(payload->'articoli', '[]'::jsonb)) > 0
  order by created_at desc
  limit 1;

  if b is null then
    raise exception 'Nessun backup disponibile';
  end if;

  -- ---- CATALOGO + MANCANTI (comportamento storico invariato) ----
  delete from public.missing_items;
  delete from public.articoli;

  insert into public.articoli (id, nome, created_at)
  select r.id, r.nome, coalesce(r.created_at, now())
  from jsonb_to_recordset(coalesce(b.payload->'articoli', '[]'::jsonb))
    as r(id uuid, nome text, created_at timestamptz);
  get diagnostics n_articoli = row_count;

  insert into public.missing_items (id, articolo_id, articolo_nome, created_at)
  select r.id, r.articolo_id, r.articolo_nome, coalesce(r.created_at, now())
  from jsonb_to_recordset(coalesce(b.payload->'missing_items', '[]'::jsonb))
    as r(id uuid, articolo_id uuid, articolo_nome text, created_at timestamptz);
  get diagnostics n_missing = row_count;

  -- ---- RICETTARIO (solo se lo snapshot lo contiene) ----
  has_recipes := (b.payload ? 'cocktails') or (b.payload ? 'preparations');

  if has_recipes then
    delete from public.cocktail_ingredients;
    delete from public.preparation_ingredients;
    delete from public.cocktails;
    delete from public.preparations;

    -- preparations prima dei cocktail_ingredients (FK preparation_id)
    insert into public.preparations (id, nome, categoria, procedimento, note, sort_order, created_at)
    select r.id, r.nome, r.categoria, r.procedimento, r.note, coalesce(r.sort_order, 0), coalesce(r.created_at, now())
    from jsonb_to_recordset(coalesce(b.payload->'preparations', '[]'::jsonb))
      as r(id uuid, nome text, categoria text, procedimento text, note text, sort_order int, created_at timestamptz);
    get diagnostics n_preps = row_count;

    insert into public.cocktails (id, nome, bicchiere, ghiaccio, metodo, garnish, note, sort_order, created_at)
    select r.id, r.nome, r.bicchiere, r.ghiaccio, r.metodo, r.garnish, r.note, coalesce(r.sort_order, 0), coalesce(r.created_at, now())
    from jsonb_to_recordset(coalesce(b.payload->'cocktails', '[]'::jsonb))
      as r(id uuid, nome text, bicchiere text, ghiaccio text, metodo text, garnish text, note text, sort_order int, created_at timestamptz);
    get diagnostics n_cocktails = row_count;

    insert into public.preparation_ingredients (id, preparation_id, nome, misura, unita, sort_order)
    select r.id, r.preparation_id, r.nome, r.misura, r.unita, coalesce(r.sort_order, 0)
    from jsonb_to_recordset(coalesce(b.payload->'preparation_ingredients', '[]'::jsonb))
      as r(id uuid, preparation_id uuid, nome text, misura text, unita text, sort_order int);
    get diagnostics n_prep_ings = row_count;

    insert into public.cocktail_ingredients (id, cocktail_id, nome, misura, unita, preparation_id, sort_order)
    select r.id, r.cocktail_id, r.nome, r.misura, r.unita, r.preparation_id, coalesce(r.sort_order, 0)
    from jsonb_to_recordset(coalesce(b.payload->'cocktail_ingredients', '[]'::jsonb))
      as r(id uuid, cocktail_id uuid, nome text, misura text, unita text, preparation_id uuid, sort_order int);
    get diagnostics n_cock_ings = row_count;
  end if;

  return jsonb_build_object(
    'articoli', n_articoli,
    'missing_items', n_missing,
    'ricettario_ripristinato', has_recipes,
    'cocktails', n_cocktails,
    'cocktail_ingredients', n_cock_ings,
    'preparations', n_preps,
    'preparation_ingredients', n_prep_ings
  );
end;
$$;

-- la RPC è invocata dal client anon (pagina Backup, dietro conferma)
grant execute on function public.restore_last_backup() to anon, authenticated;
