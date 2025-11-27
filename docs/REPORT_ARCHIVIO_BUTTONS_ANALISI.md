# REPORT ANALISI — Pulsanti Gestisci tipologie / Aggiungi articoli (Archivio)

## 1. Dove compaiono i pulsanti

- `web/src/pages/DatabasePage.tsx`
  - Componente: `DatabasePage` (pagina Archivio articoli, route `/database`).
  - Sezione JSX:
    - Due `<button type="button" className="db-box">` dentro `<section className="db-box-grid">`:
      - Bottone 1: testo `Gestisci tipologie`, `onClick={() => setIsTypesOpen(true)}`.
      - Bottone 2: testo `Aggiungi articoli`, `onClick={() => setIsNewArticleOpen(true)}`.
  - Stesso file renderizza anche la search bar “Cerca per nome articolo…” e la lista articoli.

- `web/src/pages/database/TypesManagerModal.tsx`
  - Componente: `TypesManagerModal`.
  - Usato solo in `DatabasePage` come modale per la gestione tipologie.
  - Contiene il titolo modale `Gestisci tipologie` (prop `title` di `AppModal`).

- `web/src/pages/database/NewArticleModal.tsx`
  - Componente: `NewArticleModal`.
  - Usato solo in `DatabasePage` come modale per aggiungere articoli.
  - Non contiene direttamente il testo “Aggiungi articoli”, ma il bottone pagina Archivio lo apre.

## 2. Logica collegata

### Pulsante "Gestisci tipologie"

- Punto di ingresso UI:
  - `DatabasePage.tsx` → bottone `Gestisci tipologie` imposta `setIsTypesOpen(true)`.
- Stato/handler locali in `DatabasePage`:
  - `const [isTypesOpen, setIsTypesOpen] = useState(false);`
- Render condizionale modale:
  - `<TypesManagerModal isOpen={isTypesOpen} tipologie={tipologie} addTipologia={addTipologia} updateTipologia={updateTipologia} deleteTipologia={deleteTipologia} onClose={() => setIsTypesOpen(false)} />`.
- Logica interna `TypesManagerModal`:
  - `if (!isOpen) return null;` → modale montata solo se il pulsante è stato usato.
  - Usa `AppModal` con `title="Gestisci tipologie"`.
  - Permette:
    - ricerca tipologie (`search` locale su `tipologie` passate).
    - modifica del nome tipologia (`updateTipologia(...)`).
    - eliminazione (`deleteTipologia(...)` con `window.confirm`).
    - creazione nuova (`addTipologia(...)`).
- Data layer coinvolto (tramite `useCatalog` in `catalogStore.ts`):
  - Funzioni usate SOLO tramite `TypesManagerModal`:
    - `addTipologia(nome: string)`.
    - `updateTipologia(id: string, nuovoNome: string)`.
    - `deleteTipologia(id: string)`.
  - Queste a loro volta chiamano:
    - in modalità mock: aggiornano `tipologie` in state locale.
    - con Supabase configurato: `repoCreateTipologia`, `repoUpdateTipologia`, `repoDeleteTipologia` da `catalogRepository`.

### Pulsante "Aggiungi articoli"

- Punto di ingresso UI:
  - `DatabasePage.tsx` → bottone `Aggiungi articoli` imposta `setIsNewArticleOpen(true)`.
- Stato/handler locali in `DatabasePage`:
  - `const [isNewArticleOpen, setIsNewArticleOpen] = useState(false);`
- Render condizionale modale:
  - `<NewArticleModal isOpen={isNewArticleOpen} tipologie={tipologie} onSave={(payload) => { addArticolo(payload); setIsNewArticleOpen(false); }} onClose={() => setIsNewArticleOpen(false)} />`.
- Logica interna `NewArticleModal`:
  - `if (!isOpen) return null;`.
  - UI composta da:
    - campo `Nome articolo` (state `nome`).
    - select `Tipologia` popolata da `tipologie`.
    - bottone `Salva` che:
      - valida `nome` e `tipologiaId`.
      - chiama `onSave({ nome: trimmed, tipologiaId })`.
      - azzera stato locale (`nome`, `tipologiaId`).
    - bottone `Annulla` che richiama `onClose`.
- Data layer coinvolto (tramite `useCatalog`):
  - Funzione collegata al flusso:
    - `addArticolo({ nome, tipologiaId })`.
  - Questa funzione:
    - in modalità mock:
      - aggiunge un nuovo `ArticoloWithRelations` a `articoli` con tipologia risolta localmente.
    - con Supabase configurato:
      - chiama `repoCreateArticolo` e aggiunge il risultato a `articoli`.

- Nota condivisione:
  - `addArticolo` non è usato altrove (Home non usa `useCatalog`), quindi è di fatto legato alla capacità di creare nuovi articoli tramite questa modale.

## 3. Componenti/moduli dedicati

### Fortemente legati ai pulsanti Archivio

- `web/src/pages/DatabasePage.tsx`
  - Componenti interni direttamente legati ai pulsanti:
    - stati: `isTypesOpen`, `isNewArticleOpen`.
    - JSX della sezione `db-box-grid` con i due pulsanti.
    - istanze `<TypesManagerModal ... />` e `<NewArticleModal ... />`.
  - File nel complesso è la pagina Archivio (non eliminabile in blocco), ma questi pezzi sono quelli che servono esclusivamente ai due flussi.

- `web/src/pages/database/TypesManagerModal.tsx`
  - Usato solo da `DatabasePage`.
  - Dedicato alla gestione tipologie (CRUD via store/useCatalog).

- `web/src/pages/database/NewArticleModal.tsx`
  - Usato solo da `DatabasePage`.
  - Dedicato alla creazione di nuovi articoli.

### Store / data layer

- `web/src/shared/state/catalogStore.ts`
  - Funzioni collegate ai flussi in analisi:
    - `addArticolo` ← usato solo da `NewArticleModal`.
    - `addTipologia`, `updateTipologia`, `deleteTipologia` ← usate solo da `TypesManagerModal`.
  - Funzioni condivise/necessarie a prescindere:
    - `tipologie`, `articoli`, `updateArticoloNome`, `deleteArticolo` sono usate anche per la lista Archivio e per `EditArticleModal`.

- `web/src/shared/repositories/catalogRepository.ts`
  - Funzioni indirettamente collegate:
    - `createArticolo`, `createTipologia`, `updateTipologia`, `deleteTipologia`.
  - Queste sono chiamate unicamente da `catalogStore.ts` per i flussi di creazione/gestione tipologie/articoli.

### Componenti condivisi / non eliminabili in blocco

- `web/src/shared/components/AppModal.tsx`
  - Modale generica usata sia da `TypesManagerModal`, `NewArticleModal`, sia da altre parti (es. modali database/archivio). Non eliminabile.
- Altri pezzi di `DatabasePage` (lista, ricerca, `EditArticleModal`) sono indipendenti dai due pulsanti e devono restare.

## 4. Stili CSS coinvolti

- `web/src/styles/database.css`
  - `.db-box-grid`
    - grid 1 colonna, `gap: 0.75rem`, usata per disporre i due pulsanti sopra la lista Archivio.
  - `.db-box`
    - stile card/bottone per:
      - “Gestisci tipologie”
      - “Aggiungi articoli”
      - (usato anche altrove, es. pagina Impostazioni) → non eliminabile in blocco.
  - `.db-page`, `.db-list-scroll`, `.db-item-*`
    - stili di layout/lista Archivio in generale, non specifici dei pulsanti ma condivisi con il resto della pagina.

- `web/src/styles/components.css`
  - Classi riusate dentro le modali (`modal-*`, `item-add-button`, `btn-danger`, `btn-primary`, `btn-secondary`, ecc.).
  - Queste classi sono usate da più modali e componenti: non sono strettamente dedicate a questi due pulsanti.

## 5. Cosa potremo rimuovere nello step 2 (ipotesi)

*Solo ipotesi, nessuna rimozione effettuata in questo step.*

- In `DatabasePage.tsx`:
  - JSX dei due pulsanti dentro `db-box-grid`.
  - Stati e logica collegata a `isTypesOpen` / `isNewArticleOpen`.
  - Render dei componenti `<TypesManagerModal ... />` e `<NewArticleModal ... />`.

- Componenti/modali:
  - `TypesManagerModal.tsx` (se non usato altrove).
  - `NewArticleModal.tsx` (se non usato altrove).

- Store/data layer (solo se nessun altro li usa):
  - Funzioni `addArticolo`, `addTipologia`, `updateTipologia`, `deleteTipologia` in `useCatalog`.
  - Relative funzioni di repository in `catalogRepository.ts` (`createArticolo`, `createTipologia`, `updateTipologia`, `deleteTipologia`).

- CSS:
  - Eventuale pulizia di `db-box-grid` se, dopo la rimozione dei pulsanti, non viene più utilizzato altrove.
  - Le classi condivise (`db-box`, `modal-*`, `btn-*`) andrebbero mantenute finché usate da altre sezioni.

## 6. Rischi se sbagliamo nella rimozione

- Rischio UX/funzionale immediato:
  - Rimuovere i due pulsanti + modali rende impossibile:
    - creare nuovi articoli dall’Archivio;
    - creare/modificare/eliminare tipologie via UI.
  - La pagina Archivio resterebbe solo in modalità “read-only” (lista articoli caricati da mock/Supabase).

- Rischio di dead code inconsistente:
  - Se si eliminano i pulsanti ma non si ripuliscono `useCatalog` e `catalogRepository`, resteranno funzioni non usate (add/update/delete tipologie/articoli) che però non rompono la build ma complicano la manutenzione.

- Rischio di rimozioni eccessive:
  - Eliminare classi CSS o componenti condivisi (es. `db-box`, `AppModal`, `btn-*`) potrebbe rompere anche:
    - altre modali (es. EditArticleModal);
    - UI della pagina Impostazioni o di future estensioni.

- Rischio data layer:
  - Modifiche affrettate al `catalogStore` o `catalogRepository` potrebbero:
    - rompere il caricamento iniziale di articoli/tipologie;
    - introdurre errori TypeScript se i tipi vengono toccati senza aggiornare il resto.

Nessuna modifica è stata applicata in questo step: il codice e la UI restano invariati, questa è solo una mappatura per la fase successiva di eventuale rimozione.
