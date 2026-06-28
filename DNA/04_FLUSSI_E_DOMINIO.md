# Flussi funzionali e regole di dominio

## Quick-add (Archivio)
- "+" su ogni articolo lo aggiunge ai mancanti, **senza modal**.
- Duplicate protection: "+" nascosto se l'articolo è già in `missing_items` (`isArticoloMissing`).
- Stesso hook `useMissingItems` della Home. Snapshot dopo l'add.

## Home (lista mancanti)
- Autocomplete mostra solo articoli NON già nei mancanti; tap suggerimento → aggiunge.
- FAB "+": crea l'articolo nel catalogo **ma NON lo aggiunge automaticamente ai mancanti** (regola di dominio importante).
- Trash → rimuove da `missing_items`.

## Archivio (catalogo)
- Click card → edit modal. Trash → elimina articolo (e da `missing_items` se presente). "+" → quick-add.

## Analysis (rilevamento duplicati) — interamente client-side
- Fonte dati: **solo `articoli`**, mai `missing_items`.
- Normalizza nomi (lowercase, rimuove accenti NFD, split, filtra token ≤2 char, numeri puri e ~50 stopwords hardcoded tipo vodka/rum/gin/di/al/ml…).
- Raggruppa per **prima parola normalizzata**; match esatto + fuzzy (edit distance ≤1 per token ≥3 char). Gruppo valido con ≥2 articoli e ≥2 keyword condivise. Ordina per numero articoli desc. `useMemo` per la computazione.
- **Consolidamento multi-merge**: primo selezionato = master (mantiene `id`); nome finale via `normalizeArticleName` ("Usa esistente" o "Inserisci nuovo"); i `missing_items` degli altri puntano al master; gli altri articoli vengono eliminati; snapshot; ricarica e ricalcolo gruppi.
- **Ignora gruppo**: archiviato lato client (`localStorage`), non ricompare; nessuna modifica a Supabase.

## Note (lista prodotti auto)
- Textarea full-screen in **sola lettura**: mostra SEMPRE l'elenco aggiornato di tutti gli articoli dal DB (via `useArticoli`, ordinati per nome), uno per riga. Pronta da copiare/esportare.
- Si aggiorna da sola quando il catalogo cambia. Pulsante copia (label "testo copiato" 2s). Sottotitolo header: "Archivio completo prodotti." (classe `.page-subtitle`).
- NB: non usa più la tabella `notes` (vecchia logica di note libere sincronizzate rimossa). La tabella `notes` nel DB è stata SVUOTATA (0 righe) il 2026-06-28 perché inutilizzata; la struttura resta.

## Export articoli
- Da Settings: scarica un .txt con tutti gli articoli ordinati alfabeticamente, uno per riga. Riusa i dati di `useArticoli`, nessuna query extra.

## Import testo
- `/settings/import/text`: creazione bulk articoli da testo; nomi normalizzati in Title Case.
