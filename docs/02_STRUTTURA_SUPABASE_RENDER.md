# Struttura Supabase e deploy su Render

## Note implementative

- La funzione quick-add su Archivio utilizza la stessa logica di `addMissingItem` già esistente per aggiungere articoli alla lista dei mancanti dalla Home
- No modifica dello schema Supabase - usa le tabelle `articoli` e `missing_items` esistenti
