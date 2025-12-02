# Struttura Supabase e deploy su Render

## Database schema

### Tabelle principali
- `articoli`: Catalogo articoli (id, nome, created_at)
- `missing_items`: Lista articoli mancanti (id, articolo_id, created_at)
- `backups_barnode`: Snapshot automatici (id, payload JSONB, created_at)

## Note implementative

- La funzione quick-add su Archivio utilizza la stessa logica di `addMissingItem` dalla Home
- Duplicate protection: `isArticoloMissing()` nasconde il pulsante "+" se articolo già in missing_items
- Analysis page: Algoritmo client-side che raggruppa articoli per parole chiave comuni
- Stopwords filtering: Parole generiche (vodka, rum, gin, di, al, etc.) sono escluse dall'analisi
- Consolidamento: Updates batch di articoli duplicati nella tabella articoli
- RPC `restore_last_backup` per il ripristino dei dati
