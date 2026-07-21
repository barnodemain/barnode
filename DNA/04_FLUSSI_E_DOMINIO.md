# Flussi funzionali e regole di dominio

## Ricettario (sezione Cocktail) — rotta `/cocktail`, pubblica
- Navbar 3a voce "Cocktail" (icona `LuMartini`). Due tab: **Cocktail** | **Preparazioni** + ricerca istantanea (filtra anche per ingrediente).
- **Cocktail**: schede full-screen con scroll-snap verticale (una scheda per schermo, scroll per cambiare drink; scheda adattiva al contenuto). Layout stile app-ricette (NON il PDF): nome + badge bicchiere/ghiaccio, ingredienti con dose a destra, metodo evidenziato, garnish. Nessuna icona accanto al titolo. Un ingrediente collegato a una preparazione (`preparation_id`) mostra un'**icona documento verde senza sfondo** (`IoDocumentTextOutline`, classe `.ingredient-link-icon`) accanto al nome e apre un bottom-sheet con la preparazione.
- **Preparazioni**: raggruppate per `categoria`, card → bottom-sheet con ingredienti + procedimento.
- **Gestione integrata nella pagina Cocktail (per i barman, senza passare da Admin):** ogni scheda cocktail ha una **matita in alto a destra** (`LuPencilLine`) che apre il form di modifica; ogni bottom-sheet preparazione ha la stessa matita; un **FAB "+"** contestuale al tab crea un nuovo cocktail o una nuova preparazione. L'**elimina** è un bottone in fondo al form (con conferma), non sulla scheda → schede pulite, no cancellazioni accidentali durante il servizio.
- **Gestione anche in Admin → RICETTARIO** (`/settings/recipes`, dietro PIN): lista con modifica/elimina + FAB. Doppio accesso (Cocktail e Admin), **stessa logica**: i form vivono in un unico componente riusato `components/recipes/RecipeForms.tsx` (handle imperativo `openCocktail`/`openPrep` via ref), che usa `useRecipeAdmin`. Salvataggio rimpiazza gli ingredienti (delete+insert) e invalida la cache; la lista si ricarica via `fetchRecipes`.
- **Form**: ogni ingrediente è una card a due righe (nome largo sopra, dose+unità+cestino sotto). Elimina/Annulla/Salva su una riga; l'elimina è un cestino (bianco, icona rossa). Le eliminazioni di cocktail/preparazione chiedono conferma con `ConfirmationDialog` (modale coerente con l'app, **non** `confirm()` nativo). Il cestino del singolo ingrediente è immediato (reversibile finché non si salva). Modale allargato (max-width 480px) per la leggibilità su mobile.
- Collegamenti ingrediente→preparazione: solo home-made reali (shrub/cordiale/soda/estratto/succo/yerba), non distillati/zucchero. Impostati nel seed + aggiungibili via `preparation_id`.

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

## Analysis (nomi doppi o simili) — logica in `lib/analysisGrouping.ts`
- Fonte dati: **solo `articoli`**, mai `missing_items`.
- **NON raggruppa per categoria/prima parola** (la vecchia logica ammassava tutti i "Vino"/"Gin": scartata 2026-07-21). Confronta i nomi **a coppie** e collega i simili in cluster (union-find). `similarityReason(a,b,categoryWords)` → livello "B":
  - **identici** a meno di maiuscole/accenti/punteggiatura;
  - **parole invertite** (stessi token in ordine diverso);
  - **quasi identici** (edit distance ≤2 e ratio ≥0.8 → refusi);
  - **contenimento (prefisso)**: un nome è prefisso dell'altro a confine di parola, coda ≤12 char (es. "Barolo"/"Barolo Riserva");
  - **contenimento (per parole)**: il nome corto compare come blocco di parole nel lungo con 1-2 parole in più — cattura la categoria messa davanti/dietro (es. "Jagermeister"/"Amaro Jagermeister", "Noilly Prat"/"Vermouth Dry Noilly Prat"). Richiede una parola distintiva ≥5 char non-categoria → esclude i gusti/varianti ("Succo Di Lime"/"Succo Di Mango");
  - entrambi i contenimenti sono **esclusi** se il nome corto è una sola parola-categoria (prima parola presente in ≥3 articoli, es. "vino"/"gin") → evita che una categoria colleghi l'intero catalogo.
- Etichetta card: "Motivo: …" (i criteri attivati). Ordina per numero articoli desc. `useMemo`.
- **Consolidamento multi-merge**: invariato. Primo selezionato = master (mantiene `id`); nome finale via `normalizeArticleName`; i `missing_items` degli altri puntano al master; gli altri articoli eliminati; snapshot; ricarica e ricalcolo.
- **Ignora coppia**: **persistente su DB** (`ignored_pairs`), non solo client. `id` del gruppo = `pair_key` stabile (nomi normalizzati ordinati) → una coppia ignorata **non ricompare mai più**, anche dopo reload o da altri device, e resta stabile se si spostano altri articoli. Caricato all'avvio, upsert su Ignora (ottimistico con rollback se il salvataggio fallisce).

## Note (lista prodotti auto)
- Textarea full-screen in **sola lettura**: mostra SEMPRE l'elenco aggiornato di tutti gli articoli dal DB (via `useArticoli`, ordinati per nome), uno per riga. Pronta da copiare/esportare.
- Si aggiorna da sola quando il catalogo cambia. Pulsante copia (label "testo copiato" 2s). Sottotitolo header: "Archivio completo prodotti." (classe `.page-subtitle`).
- NB: non usa più la tabella `notes` (vecchia logica di note libere sincronizzate rimossa). La tabella `notes` nel DB è stata SVUOTATA (0 righe) il 2026-06-28 perché inutilizzata; la struttura resta.

## Export articoli
- Da Settings: scarica un .txt con tutti gli articoli ordinati alfabeticamente, uno per riga. Riusa i dati di `useArticoli`, nessuna query extra.

## Import testo
- `/settings/import/text`: creazione bulk articoli da testo; nomi normalizzati in Title Case.
