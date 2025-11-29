# Diagnosi completa BARnode Web

## Panoramica progetto

### Stack e contesto
- **Frontend**: React + TypeScript, bundler Vite.
- **Routing**: `react-router-dom` con `BrowserRouter` e `Routes` dichiarate in `src/App.tsx`.
- **Backend**: Supabase, accesso incapsulato in repository TypeScript (`shared/repositories/*`).
- **State condiviso**: custom hook basati su React (`useCatalog`, `useMissingItems`) in `shared/state/*`, non Redux/Zustand ma semplice stato locale orchestrato da hook.
- **CSS**: architettura a file separati (`base.css`, `layout.css`, `components.css`, `archive.css`) importati da `styles/index.css`.

### Entry-point principali
- **`src/main.tsx`**
  - Monta l'applicazione React:
    - `ReactDOM.createRoot(...).render(...)`.
    - Wrappa l'app in `<React.StrictMode>` e `<BrowserRouter>`.
  - Importa `./styles/index.css`, che a sua volta importa i CSS principali.

- **`src/App.tsx`**
  - Usa `React.lazy` + `Suspense` per caricare le pagine:
    - `MissingItemsPage` (home).
    - `ArchivePage` (Archivio / Database).
    - `SettingsPage`, `TipologiePage`, `BackupPage`.
    - `ImportPage` (hub Importa) e sotto-pagine: `TextImportPage`, `CSVImportPage`, `PDFImportPage`.
  - Definisce le rotte:
    - `/` → `MissingItemsPage`.
    - `/archivio` → `ArchivePage`.
    - `/database` → redirect a `/archivio`.
    - `/settings` → `SettingsPage`.
    - `/settings/tipologie` → `TipologiePage`.
    - `/settings/backup` → `BackupPage`.
    - `/settings/import` → `ImportPage` (hub).
    - `/settings/import/text` → `TextImportPage`.
    - `/settings/import/csv` → `CSVImportPage`.
    - `/settings/import/pdf` → `PDFImportPage`.
    - `*` → fallback a `MissingItemsPage`.
  - Bottom nav (`.bottom-nav`) con tre voci:
    - Home (`/`).
    - Archivio (`/archivio`).
    - Impostazioni (`/settings`).

### Struttura cartelle (src/)

- **`src/assets/`**
  - Contiene almeno `logo.png`, usato nelle varie pagine (Home, Archivio, Settings, Import, Tipologie, Backup, Import text/csv/pdf).

- **`src/components/`**
  - `AppIcon.tsx`: wrapper tipizzato su `lucide-react`, con mappa di icone (`home`, `archive`, `settings`, `search`, `trash`, `plus`, `upload`, `file-text`, `tag`, `cloud`).
  - `import/`:
    - `TextImportPanel.tsx`: pannello "Importa da testo" (textarea + parsing + preview).
    - `CSVImportPanel.tsx`: pannello "Importa da CSV" (file input + parsing + preview).
    - `TextImportWizard.tsx`: wizard di revisione condiviso per flussi testo/CSV.
    - `PDFImportPanel.tsx`: pannello UI di import PDF (Beta), solo UI.
  - `tipologie/`:
    - `ColorPicker.tsx`: selezione colore.
    - `TipologiaModalAdd.tsx`, `TipologiaModalEdit.tsx`: modali per aggiunta e modifica tipologie.
  - `shared/components/AppModal.tsx`: modale generica riusata.

- **`src/pages/`**
  - `MissingItemsPage.tsx` (Home / lista mancanti).
  - `ArchivePage.tsx` (Archivio articoli, ex DatabasePage).
  - `BackupPage.tsx` (pagina backup/ripristino via RPC Supabase).
  - `SettingsPage.tsx` (hub Impostazioni).
  - `ImportPage.tsx` (hub Importa con tre pulsanti: TESTO/CSV/PDF).
  - `TipologiePage.tsx` (gestione tipologie articoli).
  - `archive/`:
    - `NewArticleModal.tsx`, `EditArticleModal.tsx`.
  - `import/`:
    - `TextImportPage.tsx`.
    - `CSVImportPage.tsx`.
    - `PDFImportPage.tsx`.

- **`src/shared/`**
  - `constants/tipologie.ts`: costanti come `COLORE_VARIE`.
  - `data/`: mock per modalità senza Supabase (`mockArticoli`, `mockTipologie`, `mockItems`, ecc.).
  - `repositories/`:
    - `catalogRepository.ts`: CRUD articoli e tipologie (tabella `articoli`, `tipologie`).
    - `backupRepository.ts`: gestione backup su `backups_barnode` + RPC `restore_last_backup`.
    - `missingItemsRepository.ts`: repository per `missing_items`.
  - `services/supabaseClient.ts`: inizializzazione client Supabase + flag `isSupabaseConfigured`.
  - `state/`:
    - `catalogStore.ts`: hook `useCatalog` con carico iniziale, update locale e snapshot backup.
    - `missingItemsStore.ts`: hook `useMissingItems` per lista mancanti.
  - `types/items.ts`: tipi core (`Articolo`, `Tipologia`, `ArticoloWithRelations`, `MissingItemWithRelations`).
  - `utils/text.ts`: utility come `toTitleCaseWords`.

- **`src/styles/`**
  - `index.css` importa:
    - `base.css` (reset, variabili, tipografia).
    - `layout.css` (layout principale, page-shell, nav).
    - `components.css` (bottoni, card, import wizard, ecc.).
    - `archive.css` (stili specifici per liste archivio/home).

- **`src/types/`**
  - Attualmente vuota o non rilevante per la logica principale.

---

## Risultati Lint & Build

### Comandi eseguiti
- `npm run lint` (in `web/`).
- `npm run build` (in `web/`).

### Esito build
- **`npm run build`**: COMPLETATO con successo.
  - Vite 5.x, output di produzione generato correttamente.
  - Warning Vite: "The CJS build of Vite's Node API is deprecated" (non bloccante, legato alla toolchain, non alla app).

### Esito lint
- **`npm run lint`**: FALLITO con più errori (tutti fixabili, molti di formattazione Prettier). Nessuna modifica è stata applicata in questo step: la diagnosi è solo descrittiva.

Errori principali (estratto):

1. **`components/import/PDFImportPanel.tsx`**
   - `react/no-unescaped-entities`: uso di `'` in stringa JSX non escapato.
   - `prettier/prettier`: micro-differenze di spazi ("Delete/Insert per").
   - Impatto: puramente stilistico / lint, nessun impatto runtime.

2. **`components/import/TextImportPanel.tsx`**
   - `prettier/prettier`: suggerimenti su virgole / quote nel placeholder multilinea:
     - Suggerisce di usare `'Es. latte intero\nPasta integrale\nBiscotti senza zucchero'` al posto delle doppie virgolette.
   - Impatto: solo stile/consistenza.

3. **`components/import/TextImportWizard.tsx`**
   - `react-hooks/rules-of-hooks`: il lint segnala `useState` "condizionale" a causa del pattern:
     - `if (!items.length) return null;` e `if (!currentItem) return null;` prima della chiamata a `useState`.
     - Dal punto di vista runtime React, le chiamate a hook avvengono sempre o mai in base al fatto che il componente venga renderizzato; all'interno del corpo la posizione di `useState` è fissa, quindi nella pratica non introduce bug, ma il lint è severo.
   - `prettier/prettier`: suggerimenti di formattazione (a capo, indentazione, stringhe con apostrofi).
   - Impatto: il problema più "serio" lato lint; per essere enterprise-ready converrebbe adeguare la struttura del componente (evitare early-return prima di hook) o aggiornare la regola.

4. **`pages/import/CSVImportPage.tsx`**
   - `prettier/prettier`: breaking line di una chiamata `console.error(...)` molto lunga.
   - `@typescript-eslint/no-unused-vars`: variabile `totalToCreate` dichiarata ma non usata in `handleApplyImport`.
   - Impatto: nessun bug logico (contatori principali usati sono `actuallyCreated`, `skippedDuplicates`, `invalidItems`). La variabile inutile è solo rumore.

5. **`pages/import/TextImportPage.tsx`**
   - Stessi pattern di CSV:
     - `prettier/prettier` su `console.error` e su map/normalize multi-linea.
     - `@typescript-eslint/no-unused-vars`: `totalToCreate` non utilizzata.

6. **`shared/repositories/backupRepository.ts`**
   - `prettier/prettier`: suggerisce di comprimere/espandere catene di chiamate `supabase.from(...).select(...)` e una condizione multipla (`!latest.error && latest.data && ...`) su più righe.
   - Impatto: solo formattazione.

7. **`shared/repositories/catalogRepository.ts`**
   - `prettier/prettier`: suggerimenti di indentazione e formattazione nella `map` di `getArticoli` e in `createArticolo`.

8. **`shared/state/catalogStore.ts`**
   - `prettier/prettier`: suggerisce di andare a capo in un oggetto passato a `repoCreateArticolo` (`nome: normalized, tipologiaId: effectiveTipologiaId`).

Nota: Warning CSS già noti (es. `-webkit-overflow-scrolling`, `appearance`) non emergono come errori nel run corrente, ma restano considerati "warning accettati" lato compatibilità.

---

## Codice e Struttura

### File potenzialmente obsoleti o doppi

- **Vecchi componenti di import**
  - Non risultano versioni duplicate di ImportPage o pannelli di import. I file rilevanti sono unici:
    - `components/import/TextImportPanel.tsx`.
    - `components/import/CSVImportPanel.tsx`.
    - `components/import/PDFImportPanel.tsx`.
    - `components/import/TextImportWizard.tsx`.
  - Nessun "vecchio" pannello di import è rimasto in `src/pages` non referenziato.

- **Rotte legacy**
  - `/database` è ancora presente ma redireziona a `/archivio` in `App.tsx`; è una scelta consapevole per retro-compatibilità URL.
  - Nessun altro alias o duplicato superfluo individuato.

- **File mai referenziati** (osservazione qualitativa, non analisi statica completa):
  - `shared/data/mockCatalog.ts`, `mockItems.ts`, ecc. sono usati come mock in `useCatalog` / `useMissingItems` quando `isSupabaseConfigured` è falso → considerati vivi.
  - `types/index.ts` esiste ma viene usato marginalmente; comunque innocuo.

### Console log e debug

Ricerca di `console.` e `debugger` in `src/`:

- **Log strutturati (accettabili)**
  - Repository:
    - `catalogRepository.ts`, `backupRepository.ts`, `missingItemsRepository.ts` usano `console.error('[xxxRepository] ...', error)` per loggare errori Supabase.
    - Questi log sono utili per diagnosi runtime, ma in un contesto enterprise converrebbe convogliarli in un sistema di logging centralizzato o almeno in un wrapper configurabile (es. disattivabile in produzione).
  - Store:
    - `catalogStore.ts`, `missingItemsStore.ts` usano `console.error('[useCatalog] ...')` e `console.error('[useMissingItems] ...')` in caso di fetch falliti: utile per debug.

- **Log "di servizio" nella sezione Import**
  - `pages/import/TextImportPage.tsx`:
    - `console.error('Errore durante il caricamento degli articoli esistenti...', existingResult.error);`
    - `console.log('Importazione completata');` a fine `handleApplyImport`.
  - `pages/import/CSVImportPage.tsx`:
    - `console.error('Errore durante il caricamento degli articoli esistenti...', existingResult.error);`
    - `console.log('Importazione CSV completata');`.
  - In ottica enterprise:
    - Gli error `console.error` sono utili ma andrebbero mascherati dietro un logger.
    - I `console.log` informativi di completamento import sono più vicini a log di debug: potrebbero essere rimossi o spostati in un canale di audit/logging controllato.

- **Debugger**
  - Nessuna occorrenza di `debugger` trovata.

### File lunghi / complessi

- **`shared/state/catalogStore.ts` (~330 righe)**
  - Ruolo: hook centrale per gestire tipologie e articoli, con supporto sia a mock locali che a Supabase, gestione backup snapshot al salvataggio.
  - Complessità:
    - Contiene logica di caricamento iniziale, ordinamento, add/update/delete per articoli e tipologie, più integrazione backup.
    - Per un contesto enterprise potrebbe essere utile:
      - Estrarre la logica di backup in un modulo separato.
      - Separare gestione articoli / tipologie in custom hook distinti.
  - Al momento è gestibile ma già "edge" rispetto al limite 300–400 richiesto.

- **`shared/state/missingItemsStore.ts` (~140 righe)**
  - Ruolo: orchestrare missing_items + mock, con integrazione a Supabase e backup.
  - Complessità: accettabile.

- **`components/import/TextImportWizard.tsx` (~220 righe)**
  - Ruolo: wizard di revisione import con gestione stato interno (`isApplyingImport`), contatori, validazioni di duplicate.
  - Complessità:
    - Strutturato, ma concentrato in un unico componente di media dimensione.
    - L'errore lint su hooks suggerisce che una futura rifattorizzazione (es. estrarre sotto-componenti o custom hook) migliorerebbe la leggibilità.

- Altri file (`MissingItemsPage`, `ArchivePage`, `TipologiePage`) sono tra 110–130 righe e ben sotto la soglia.

### CSS e layout

- Tutti i CSS principali sono importati in cascata da `styles/index.css` e quindi usati:
  - Non risultano file CSS orfani.
- Classi specifiche per Import/Wizard:
  - `import-panel`, `import-textarea`, `import-actions`, `import-results`, `import-note`, `import-wizard-*` sono usate nelle pagine/pannelli di import.
- Warning storici noti (es. `-webkit-overflow-scrolling` in `archive.css`) sono compatibili cross-browser anche se segnalati da alcuni tool: non bloccanti ma da monitorare.

---

## Sezione Importa (Testo / CSV / PDF)

### 4.1 Flusso TESTO

**File chiave**:
- `components/import/TextImportPanel.tsx`.
- `pages/import/TextImportPage.tsx`.
- `components/import/TextImportWizard.tsx`.
- Repository e store:
  - `shared/repositories/catalogRepository.ts`.
  - `shared/state/catalogStore.ts`.
  - `shared/types/items.ts`.

#### Flusso end-to-end

1. **Parsing testo (TextImportPanel)**
   - L'utente incolla testo multilinea in `textarea.import-textarea`.
   - Il pulsante "Analizza testo" lancia `handleAnalyzeText`:
     - Split per newline (`/\r?\n/`).
     - Per ogni riga:
       - Normalizzazione spazi.
       - Scarto righe vuote, con meno di 3 caratteri, solo numeriche.
       - `normalizeName` converte in title case (prima lettera maiuscola, resto minuscolo per parola).
       - Deduplica locale tramite `Map` keyed sul nome normalizzato.
     - Crea una lista di `ParsedItem { id, rawName, normalizedName, included: true }`.
   - La preview mostra:
     - Conteggio articoli trovati.
     - Lista con checkbox per includere/escludere.
     - Pulsante "Prosegui alla revisione" che chiama `onConfirmSelection(includedItems)`.

2. **Passaggio al wizard (TextImportPage.handleConfirmSelection)**
   - `TextImportPage` riceve `ParsedItem[]` dal pannello:
     - `setReviewItems(items)`.
     - `setCurrentIndex(0)`.
     - `setDecisions({})`.
     - `setImportResultMessage(null)`.
   - Caricamento articoli esistenti (`useEffect`):
     - Chiama `getArticoli()` del `catalogRepository`.
     - In caso di errore: log con `console.error`, nessuna UI-block.
     - In caso di successo: popola `existingArticoli`.
   - Calcola `existingNames`:
     - `existingArticoli.map(a => normalizeName(a.nome)).filter(name => name.length > 0)`.
     - `normalizeName` = `trim().toLowerCase()`.

3. **Wizard di revisione (TextImportWizard)**
   - Props:
     - `items: ParsedItem[]`.
     - `currentIndex`, `decisions`, `onChangeIndex`, `onChangeDecision`.
     - `onReset`.
     - `tipologie: Tipologia[]`.
     - `onApplyImport` (callback verso la page).
     - `existingNames: string[]` (nomi normalizzati esistenti).
   - Comportamento:
     - Se `items` vuoto → ritorna `null` (wizard non mostrato).
     - `currentDecision` predefinita quando mancante:
       - `action: 'create'`.
       - `updatedName: currentItem.normalizedName`.
       - `tipologiaId: defaultTipologiaId` (di default "Varie" se esiste, altrimenti prima tipologia, se presente).
     - Normalizza nome corrente via `value.trim().toLowerCase()` e verifica `isDuplicate` se incluso in `existingNames`.
     - Mostra avviso duplicato:
       - "Attenzione: esiste già un articolo con questo nome. Se prosegui, l'importazione lo salterà automaticamente.".
     - Azioni:
       - Due pulsanti (Create/Skip) che impostano `decision.action`.
       - Navigazione Precedente/Successivo.
       - Riepilogo: `createCount`, `skipCount`, `pending`.
       - Pulsante "Applica importazione":
         - Disabilitato se `isApplyingImport` o `pending > 0` o `createCount === 0`.
         - Quando attivo, chiama `onApplyImport` e gestisce uno stato locale `isApplyingImport` per evitare doppi invii.

4. **Salvataggio (TextImportPage.handleApplyImport)**
   - Ricarica gli articoli esistenti via `getArticoli()`.
   - Definisce `normalizeName = value.trim().toLowerCase()`.
   - Costruisce `seenNames` come `Set` di nomi normalizzati da DB.
   - Inizializza contatori:
     - `totalToCreate` (non usato nel messaggio finale, ma incrementato per ogni `action === 'create'`).
     - `actuallyCreated`.
     - `skippedDuplicates`.
     - `invalidItems`.
   - Loop su `reviewItems`:
     - Recupera `decision = decisions[item.id]`.
     - Se `!decision || decision.action !== 'create'` → continua.
     - Incrementa `totalToCreate`.
     - Estrae `nome = decision.updatedName.trim()` e `tipologiaId = decision.tipologiaId ?? ''`.
     - Se `!nome || !tipologiaId` → `invalidItems += 1` e `continue`.
     - Normalizza `normalized = normalizeName(nome)`.
     - Se `!normalized || seenNames.has(normalized)` → `skippedDuplicates += 1` e `continue`.
     - Chiama `addArticolo({ nome, tipologiaId })` (repository):
       - Se errore: `console.error('Errore durante la creazione articolo da import', result.error)` e `continue`.
       - Se ok: aggiunge `normalized` a `seenNames` e incrementa `actuallyCreated`.
   - Dopo il loop:
     - Imposta `importResultMessage` con stringa multi-linea:
       - "Importazione completata:\n• Creati: X\n• Duplicati saltati: Y\n• Elementi non validi: Z".
     - Reset wizard (`reviewItems`, `decisions`, `currentIndex`).

#### Garanzie verificate

- **Creazione solo se `action === 'create'`**
  - Il loop ignora tutti i casi non-`create` già all'inizio.

- **Validazione nome e tipologia**
  - `nome` viene trim-mato e controllato (`!nome` → invalid).
  - `tipologiaId` deve essere non vuoto; altrimenti l'elemento è classificato come `invalid`.
  - Validazione UI: il wizard non permette `tipologiaId` vuoto se sono disponibili tipologie (ma a livello di logica è gestito comunque).

- **Deduplica case-insensitive**
  - `normalizeName = trim().toLowerCase()` sia per DB (`getArticoli`) sia per il batch corrente.
  - `seenNames` inizializzato con tutti i nomi DB.
  - Ad ogni nuovo articolo creato, `normalized` viene aggiunto a `seenNames` per evitare duplicati all'interno dello stesso batch.
  - I duplicati (su DB o interni al batch) vengono **saltati silenziosamente**, con conteggio in `skippedDuplicates`.

- **Repository e accesso a Supabase**
  - Il flusso TESTO usa **solo**:
    - `catalogRepository.getArticoli()` per leggere.
    - `catalogRepository.addArticolo()` (alias di `createArticolo`) per creare.
  - Non ci sono chiamate dirette a `supabase.from('articoli')` nella page o nei pannelli; tutte passano dal repository.

- **UX di sicurezza**
  - L'avviso duplicato nel wizard è chiaro: se il nome coincide con un esistente, l'import lo salterà.
  - Il pulsante "Applica importazione" è disabilitato finché:
    - Non sono state prese decisioni su tutti gli articoli (`pending > 0` → disabled).
    - Non esiste almeno un articolo marcato come `create` (`createCount === 0` → disabled).

- **Edge case/rischi residui**
  - In caso di errore in `getArticoli()` o `addArticolo`, gli errori sono solo loggati, senza feedback UI esplicito (oltre al mancato incremento dei contatori).
  - L'import massivo è sequenziale: molti articoli potrebbero rendere l'operazione lenta; non ci sono ottimizzazioni tipo batch insert.

### 4.2 Flusso CSV

**File chiave**:
- `components/import/CSVImportPanel.tsx`.
- `pages/import/CSVImportPage.tsx`.
- Riuso di `TextImportWizard.tsx`.

#### Pannello CSV (CSVImportPanel)

- Lettura file:
  - `input type="file" accept=".csv"`.
  - `FileReader.readAsText(file)` lato frontend.
  - Nessun accesso a Supabase.

- Parsing CSV:
  - Split per newline.
  - Per ogni riga non vuota:
    - Tentativo split su `;`, se prima colonna mancante, fallback a `,`.
    - `rawName = columns[0].trim()`.
    - Filtri: lunghezza minima, no solo numeri.
    - `normalizeName` identico al testo (trim, single-spaces, lower, title-case parola per parola).
    - Deduplica tramite `Map` keyed su `normalized.toLowerCase()`.
  - Se nessun item valido → `errorMessage = 'Nessun articolo valido trovato nel CSV.'`.
  - Preview:
    - Lista di `ParsedItem` con checkbox `included`.
    - Pulsante "Prosegui alla revisione" chiama `onConfirmSelection(includedItems)`.

- Messaggi di errore/stato:
  - Usano `className="import-note"` (uniformato).

#### Pagina CSV (CSVImportPage)

- Stato e caricamento:
  - Struttura quasi identica a `TextImportPage`:
    - `reviewItems`, `currentIndex`, `decisions`, `existingArticoli`, `importResultMessage`.
  - `useEffect` su mount:
    - Chiama `getArticoli()` dal repository.
    - Logga eventuali errori con `console.error('...wizard CSV', result.error)`.

- Selezione dal pannello:
  - `handleConfirmSelectionFromCsv(items: ParsedItem[])`:
    - `setReviewItems(items)`.
    - `setCurrentIndex(0)`.
    - `setDecisions({})`.
    - `setImportResultMessage(null)`.

- Wizard:
  - Rende `<TextImportWizard>` con esattamente lo stesso set di props del flusso testo (`existingNames`, `tipologie`, ecc.).

- Salvataggio (`handleApplyImport`):
  - Ricarica articoli esistenti via `getArticoli()`.
  - Normalizza e costruisce `seenNames` come nel flusso testo (anche se il nome locale della funzione è `normalize`).
  - Loop con stesso pattern:
    - `decision.action === 'create'`.
    - Validazione `nome` e `tipologiaId`.
    - Deduplica su `normalized` vs `seenNames`.
    - `addArticolo({ nome, tipologiaId })`.
    - Conta `actuallyCreated`, `skippedDuplicates`, `invalidItems`. Variabile `totalToCreate` non usata.
  - Messaggio finale `importResultMessage` con lo stesso formato del flusso testo.
  - Reset stato wizard e log `console.log('Importazione CSV completata');`.

#### Coerenza con flusso TESTO

- **Parsing e normalizzazione**
  - Le funzioni `normalizeName` nei pannelli testo e CSV sono equivalenti come semantica (title-case, deduplica case-insensitive).

- **Deduplica/salvataggio**
  - Entrambi i flussi usano `getArticoli` + `addArticolo`.
  - Entrambi applicano deduplica case-insensitive su DB + batch attraverso `seenNames`.
  - Entrambi producono un messaggio riassuntivo con le stesse categorie.

- **Wizard**
  - Entrambe le pagine passano i `ParsedItem[]` a `TextImportWizard` con la stessa struttura di props.
  - `existingNames` è calcolato in modo identico (`trim().toLowerCase()` su `nome`).

- **Differenze residue**
  - I nomi delle funzioni interne (`normalizeName` vs `normalize`) sono diversi ma equivalenti.
  - `console.log` hanno messaggi leggermente diversi (testo vs CSV) ma stesso scopo.

### 4.3 Pannello PDF (Beta)

**File chiave**:
- `components/import/PDFImportPanel.tsx`.
- `pages/import/PDFImportPage.tsx`.

#### Verifica logica

- `PDFImportPanel`:
  - Root: `<section className="import-panel">`.
  - Contenuto:
    - `<h2>Importa da PDF (Beta)</h2>`.
    - Paragrafo introduttivo che specifica che l'analisi automatica non è ancora disponibile.
    - `div.import-actions` con:
      - `input type="file" accept=".pdf"`.
      - paragrafo con nome file selezionato (se presente).
      - pulsante "Analizza PDF (Beta)" (`db-box settings-button`), che **non** esegue parsing né salvataggio, ma imposta solo uno `statusMessage` locale.
    - `statusMessage` mostrato con `className="import-note"`.
  - Nessun uso di repository o Supabase.

- `PDFImportPage`:
  - Header standard con logo + titolo.
  - `<section className="list">` che contiene solo `<PDFImportPanel />`.
  - Nessun wizard, nessun handleApplyImport, nessuna chiamata a repository.

Conclusione: il flusso PDF è puramente UI/Beta, senza alcuna logica di import reale o accesso a DB.

---

## Coerenza con backup e routing

### Compatibilità con sistema di backup

- **Backup automatico**
  - `backupRepository.ts` definisce:
    - `saveBackupSnapshot(payload)` su tabella `backups_barnode`.
    - `getLatestBackupSnapshot()`.
    - `restoreBackupSnapshot()` via RPC Supabase `restore_last_backup`.
    - `createAndSaveCurrentSnapshot()` che:
      - Legge `tipologie`, `articoli` (con relazioni) e `missingItems`.
      - Costruisce un payload unico `BackupPayload`.
      - Salva un nuovo backup se necessario.

- **Integrazione con `useCatalog` e `useMissingItems`**
  - `useCatalog`:
    - Dopo il caricamento iniziale e il primo backup (se assente), ad ogni operazione mutante (create/update/delete di articoli o tipologie) chiama `createAndSaveCurrentSnapshot()` **se** Supabase è configurato.
    - Questo significa che anche gli articoli importati tramite flusso testo/CSV vanno nel backup automatico, perché:
      - La page `TextImportPage` / `CSVImportPage` chiama direttamente `addArticolo` del `catalogRepository`, **non** il `useCatalog.addArticolo`.
      - Tuttavia, gli hook di state sono responsabili di mantenere lo stato UI / mock; il backup snapshot invece è creato da `useCatalog` e `useMissingItems` quando si usano i loro metodi.
      - Nel flusso import, il backup automatico non è chiamato direttamente; ci si affida ai meccanismi esistenti interni a Supabase (trigger/policies) e/o a futuri snapshot manuali.
  - **Compatibilità**:
    - Gli articoli importati esistono nella tabella `articoli` e quindi saranno inclusi in `getArticoliWithRelations()` e nel prossimo snapshot creato da `createAndSaveCurrentSnapshot()`.
    - Non vi è alcuna violazione della struttura del backup: la forma dei dati di `articoli` e `tipologie` usata dall'import è la stessa di quella prevista dal backup.

### Routing e navigazione

- **Rotte Import**
  - `/settings/import` (hub) → `ImportPage` con 3 pulsanti.
  - `/settings/import/text` → `TextImportPage`.
  - `/settings/import/csv` → `CSVImportPage`.
  - `/settings/import/pdf` → `PDFImportPage`.

- **Coerenza con nav principale**
  - La Bottom Nav punta solo a:
    - `/` (Home: lista mancanti).
    - `/archivio` (Archivio articoli).
    - `/settings` (Impostazioni).
  - Da `SettingsPage` si accede a `/settings/import`, `/settings/tipologie`, `/settings/backup`.
  - Dal hub Import si arriva alle tre sotto-pagine.

- **Percorsi morti / componenti orfani**
  - Tutte le pagine `ImportPage`, `TextImportPage`, `CSVImportPage`, `PDFImportPage` sono effettivamente raggiungibili:
    - `SettingsPage` → `/settings/import`.
    - `ImportPage` → sotto-rotte.
  - Nessun vecchio componente di import è rimasto non referenziato.

Conclusione: l'introduzione delle nuove rotte di import è coerente con la navigazione globale e non crea duplicati né rotte orfane.

---

## Rischi e punti deboli

### 1. Lint non pulito (bloccante per CI rigorosa)
- **Dove**: `TextImportWizard.tsx`, `TextImportPanel.tsx`, pannelli Import, repository vari.
- **Perché**: `npm run lint` non passa a causa di errori (non solo warning). In un contesto enterprise questa situazione bloccherebbe pipeline CI/CD.
- **Bloccante**: Sì, per un flusso di build automatizzato rigido.

### 2. Regola `react-hooks/rules-of-hooks` nel wizard import
- **Dove**: `components/import/TextImportWizard.tsx` (uso di `useState` dopo early-return).
- **Perché**: anche se a runtime l'uso è probabilmente sicuro (componenti che non renderizzano del tutto se `items` è vuoto), il lint segnala una violazione formale delle regole dei hook, considerata critica per robustezza.
- **Bloccante**: Alto impatto su qualità del codice; nel lungo periodo da sistemare.

### 3. Mancanza di feedback UI in caso di errori di import
- **Dove**: `TextImportPage.tsx` e `CSVImportPage.tsx` (`handleApplyImport`).
- **Perché**:
  - Se `getArticoli()` fallisce → solo `console.error`, nessuna informazione all'utente.
  - Se `addArticolo()` fallisce per un singolo articolo → il flusso continua silenziosamente, con possibili discrepanze tra quanto l'utente si aspetta e quanto viene effettivamente creato.
- **Bloccante**: Non bloccante per un MVP, ma critico per UX enterprise (diagnosticabilità e trasparenza dei fallimenti).

### 4. Uso diretto di repository nelle pagine di import
- **Dove**: `TextImportPage.tsx`, `CSVImportPage.tsx` (chiamano direttamente `getArticoli` e `addArticolo` del `catalogRepository`).
- **Perché**:
  - La maggior parte dell'app passa tramite `useCatalog`, che a sua volta gestisce backup e stato locale.
  - L'import aggira `useCatalog` per la parte di salvataggio, affidandosi solo al repository.
  - Coerente con il requisito "frontend-only + repository", ma potenzialmente asimmetrico rispetto a come altre parti dell'app aggiornano lo stato.
- **Bloccante**: No, ma importante da documentare e tenere coerente.

### 5. Log di debug in produzione
- **Dove**: `console.log('Importazione completata')`, `console.log('Importazione CSV completata')`, log dei repository.
- **Perché**:
  - In produzione, log non strutturati possono "sporcare" la console e non essere centralizzati.
  - In scenari enterprise, si preferisce un logging layer configurabile.
- **Bloccante**: No, ma da considerare per hardening.

### 6. File lunghi e responsabilità miste
- **Dove**: `useCatalog` (catalogStore.ts), `TextImportWizard.tsx`.
- **Perché**:
  - Accumulano molte responsabilità (caricamento, backup, deduplica, validazioni, UI complesse) in file unici.
- **Bloccante**: No, ma aumenta il costo di manutenzione.

### 7. Accessibilità e form elements
- **Dove**:
  - `TextImportWizard.tsx`: select senza label titolo (warning accessibilità noti).
  - `CSVImportPanel.tsx`, `PDFImportPanel.tsx`: input file senza label esplicita (segnalati lato lint/axe in passaggi precedenti).
- **Perché**:
  - In ottica enterprise e WCAG, andrebbero aggiunti label ARIA/title.
- **Bloccante**: Non bloccante per funzionamento, ma importante per compliance.

---

## To-do enterprise-ready

### Alta priorità

1. **Ripulire `npm run lint` fino a zero errori**
   - **File**: `TextImportWizard.tsx`, `TextImportPanel.tsx`, `CSVImportPage.tsx`, `TextImportPage.tsx`, repository vari.
   - **Azione**: allineare il codice a Prettier/ESLint (indentazione, stringhe, virgole) e rimuovere variabili inutilizzate (`totalToCreate`).
   - **Motivazione**: requisito base per pipeline CI e standard enterprise.

2. **Rifattorizzare `TextImportWizard` per soddisfare `react-hooks/rules-of-hooks`**
   - **File**: `components/import/TextImportWizard.tsx`.
   - **Azione**: spostare `useState` prima di qualsiasi early-return oppure estrarre la parte che usa hook in un sotto-componente; evitare return condizionali prima di dichiarazioni di hook.
   - **Motivazione**: eliminare una violazione formale delle regole hooks che potrebbe creare bug sottili se il componente evolvesse.

3. **Gestione esplicita degli errori di import nella UI**
   - **File**: `TextImportPage.tsx`, `CSVImportPage.tsx`.
   - **Azione**:
     - Introdurre uno stato di errore nel page-level (es. `importErrorMessage`).
     - Visualizzare un messaggio all'utente se `getArticoli` o `addArticolo` falliscono.
   - **Motivazione**: migliorare l'affidabilità percepita e la trasparenza verso l'utente finale.

4. **Allineare il flusso di salvataggio import con `useCatalog` o documentare la scelta**
   - **File**: `TextImportPage.tsx`, `CSVImportPage.tsx`, `shared/state/catalogStore.ts`.
   - **Azione**:
     - O: introdurre un metodo nel `useCatalog` per import batch (che internamente usi repository + backup snapshot).
     - O: documentare chiaramente che l'import usa solo repository e che i backup snapshot vengono comunque aggiornati da altre operazioni.
   - **Motivazione**: ridurre disallineamenti tra strati (store vs repository) e facilitare l'evoluzione.

### Media priorità

5. **Unificare la logica di normalizzazione/deduplica**
   - **File**: `TextImportPanel.tsx`, `CSVImportPanel.tsx`, `TextImportPage.tsx`, `CSVImportPage.tsx`.
   - **Azione**: estrarre `normalizeName` e logica di deduplica in una utility condivisa (`shared/utils/import.ts` o simile) per evitare divergenze future.
   - **Motivazione**: migliorare DRY e coerenza tra flussi testo e CSV.

6. **Estrarre logica di backup da `useCatalog`/`useMissingItems`**
   - **File**: `shared/state/catalogStore.ts`, `shared/state/missingItemsStore.ts`, `shared/repositories/backupRepository.ts`.
   - **Azione**: creare un piccolo servizio di "backup manager" che espone funzioni chiare (es. `ensureInitialBackup`, `snapshotOnChange`).
   - **Motivazione**: ridurre la complessità dei custom hook e chiarire la responsabilità del backup.

7. **Migliorare l'accessibilità dei pannelli Import**
   - **File**: `TextImportWizard.tsx`, `CSVImportPanel.tsx`, `PDFImportPanel.tsx`.
   - **Azione**: aggiungere label esplicite o `aria-label` per select e input file, e collegare correttamente label e form controls.
   - **Motivazione**: avvicinarsi a requisiti WCAG/enterprise.

### Bassa priorità

8. **Introdurre un sistema di logging strutturato**
   - **File**: tutti i repository (`catalogRepository.ts`, `backupRepository.ts`, `missingItemsRepository.ts`) e pagine con log (`TextImportPage.tsx`, `CSVImportPage.tsx`).
   - **Azione**: sostituire i `console.*` con un logger (es. wrapper su `console` configurabile per ambiente) o un servizio di telemetry.
   - **Motivazione**: governance migliore dei log in ambienti multi-istanza.

9. **Eventuale modularizzazione di `TextImportWizard` e `catalogStore`**
   - **File**: `components/import/TextImportWizard.tsx`, `shared/state/catalogStore.ts`.
   - **Azione**: dividere in più componenti/hook più piccoli (es. `UseImportDecisions`, `ImportSummary`, `CatalogBackupHandler`) quando si faranno evoluzioni significative.
   - **Motivazione**: migliorare leggibilità per team più grandi.

10. **Pulizia e normalizzazione delle stringhe hard-coded**
   - **File**: varie pagine (messaggi di stato, errori, testi UI).
   - **Azione**: valutare l'estrazione di stringhe in un sistema di i18n o constants centralizzati.
   - **Motivazione**: readiness per multilanguage / UX team.

---

## Stato finale della diagnosi

- Nessuna modifica è stata applicata ai file `.ts`, `.tsx`, `.css`, `.json` del codice applicativo.
- La diagnosi conferma che:
  - I flussi di import TESTO e CSV usano solo `catalogRepository.getArticoli` e `catalogRepository.addArticolo` per l'accesso a Supabase, con deduplica case-insensitive e wizard condiviso.
  - Il flusso PDF (Beta) è puramente UI, senza parsing né salvataggio.
  - Il sistema di backup/ripristino via `backupRepository` è coerente con la struttura dei dati usata dall'import.
  - Il routing è consistente con la navigazione globale e non ci sono rotte orfane.
- Il principale ostacolo all'adozione "enterprise-ready" è la presenza di errori lint e di alcune scelte strutturali (hook + logging) da rifinire.
