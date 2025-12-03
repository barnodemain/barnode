# Struttura Supabase e deploy su Render

## Database schema

### Tabelle principali
- `articoli`: Catalogo articoli (id, nome, created_at)
- `missing_items`: Lista articoli mancanti (id, articolo_id, created_at)
- `backups_barnode`: Snapshot automatici (id, payload JSONB, created_at)
 - `notes`: Testo NOTE condiviso tra dispositivi (id, content, updated_at)

> **BACKUP SINGLETON**
>
> La tabella `backups_barnode` utilizza un **unico record attivo** per lo snapshot corrente:
>
> - ID fisso: `00000000-0000-0000-0000-000000000001`
> - Colonna `payload`: JSONB con struttura `{ articoli: [...], missing_items: [...] }`
> - Colonna `created_at`: aggiornata a ogni nuovo snapshot
>
> Ogni operazione critica nell'app esegue una `upsert` su questo ID fisso, sovrascrivendo sempre lo snapshot precedente.
> Eventuali altri record presenti in `backups_barnode` sono considerati **legacy**.

## Note implementative

- La funzione quick-add su Archivio utilizza la stessa logica di `addMissingItem` dalla Home
- Duplicate protection: `isArticoloMissing()` nasconde il pulsante "+" se articolo già in missing_items
- Analysis page: Algoritmo client-side che raggruppa articoli per parole chiave comuni
- Stopwords filtering: Parole generiche (vodka, rum, gin, di, al, etc.) sono escluse dall'analisi
- Consolidamento: Updates batch di articoli duplicati nella tabella articoli
- RPC `restore_last_backup` per il ripristino dei dati
 - Tabella `notes`: una sola riga attiva usata dalla pagina NOTE per leggere/scrivere il contenuto sincronizzato (accesso consentito al ruolo anon tramite RLS)

### RPC `restore_last_backup`

Funzione PL/pgSQL per ripristinare l'ultimo backup non vuoto da `backups_barnode`.

```sql
create or replace function public.restore_last_backup()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_backup_id uuid;
  v_payload   jsonb;
  v_articoli  jsonb;
  v_missing   jsonb;
begin
  -- Prende l'ultimo backup che contiene almeno un articolo
  select b.id, b.payload
  into v_backup_id, v_payload
  from backups_barnode b
  where jsonb_typeof(b.payload->'articoli') = 'array'
    and coalesce(jsonb_array_length(b.payload->'articoli'), 0) > 0
  order by b.created_at desc
  limit 1;

  if v_backup_id is null then
    raise exception 'Nessun backup valido trovato in backups_barnode (articoli vuoto)';
  end if;

  v_articoli := coalesce(v_payload->'articoli', '[]'::jsonb);
  v_missing  := coalesce(v_payload->'missing_items', '[]'::jsonb);

  -- Svuota le tabelle correnti
  delete from missing_items;
  delete from articoli;

  -- Ripristina articoli
  insert into articoli (id, nome, created_at)
  select r.id, r.nome, coalesce(r.created_at, now())
  from jsonb_to_recordset(v_articoli) as r(
    id uuid,
    nome text,
    created_at timestamptz
  );

  -- Ripristina missing_items
  insert into missing_items (id, articolo_id, articolo_nome, created_at)
  select m.id, m.articolo_id, m.articolo_nome, coalesce(m.created_at, now())
  from jsonb_to_recordset(v_missing) as m(
    id uuid,
    articolo_id uuid,
    articolo_nome text,
    created_at timestamptz
  );

  return jsonb_build_object(
    'restored', true,
    'backup_id', v_backup_id,
    'articoli_count', (select count(*) from articoli),
    'missing_items_count', (select count(*) from missing_items)
  );
end;
$$;
```

#### Piano di test manuale per il ripristino

1. In produzione o locale, usa normalmente l'app per creare almeno un paio di articoli e aggiungerli ai mancanti (questo genera uno snapshot in `backups_barnode`).
2. Nel pannello Supabase, svuota le tabelle `articoli` e `missing_items` (via SQL o UI).
3. Nell'app, apri la pagina **Backup** e premi "Ripristina ultimo backup", poi conferma nella dialog.
4. Atteso:
   - La RPC `restore_last_backup` risponde 200.
   - Le tabelle `articoli` e `missing_items` contengono gli stessi dati dell'ultimo backup non vuoto.
   - L'app si ricarica e mostra nuovamente i dati ripristinati.
