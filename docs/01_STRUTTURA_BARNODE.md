# 01 STRUTTURA BARnode Web

## 1. Introduzione

BARnode Web è una web app/mobile web (PWA-friendly) pensata per gestire il catalogo articoli di un bar e la relativa **lista degli articoli mancanti**. L’applicazione è strutturata come single-page application React + TypeScript, con routing client-side e un layout ottimizzato per smartphone.

Stato attuale dei dati:
- La logica è già pronta per **Supabase**, ma al momento il caricamento iniziale avviene tramite **mock locali** quando Supabase non è configurato.
- Il vecchio modulo ordini/fornitori è stato rimosso; restano solo **Home (lista articoli mancanti)**, **Archivio articoli** e **Impostazioni**.
- È presente una prima implementazione di **creazione/modifica/eliminazione articoli** in Archivio, con flusso di aggiunta tramite modale "Aggiungi articolo".

Questo documento fotografa la struttura attuale e deve essere mantenuto aggiornato a ogni modifica strutturale (nuove pagine, nuovi store/repository, cambio flussi principali, collegamento Supabase, sistema di backup, ecc.).

---

## 2. Routing e pagine principali

L’entrypoint dell’app è `web/src/main.tsx`, che monta `<App />` dentro `BrowserRouter`.

### 2.1 Tabella route

Definite in `web/src/App.tsx`:

- `/`
  - **Componente**: `MissingItemsPage` (`web/src/pages/MissingItemsPage.tsx`)
  - **Ruolo**: Home. Mostra la "Lista articoli mancanti" con barra di ricerca e messaggio di stato quando la lista è vuota.

- `/archivio`
  - **Componente**: `ArchivePage` (`web/src/pages/ArchivePage.tsx`)
  - **Ruolo**: Archivio principale degli articoli. Mostra elenco articoli con tipologia, permette di modificare/eliminare articoli esistenti e, tramite pulsante "+", di aggiungerne di nuovi.

- `/database`
  - **Componente**: `Navigate` verso `/archivio` (redirect permanente).
  - **Ruolo**: route legacy mantenuta per compatibilità; non esiste più una pagina Database separata.

- `/settings`
  - **Componente**: `SettingsPage` (`web/src/pages/SettingsPage.tsx`)
  - **Ruolo**: pagina Impostazioni, attualmente con 4 pulsanti-card (IMPORTA, ARTICOLI, TIPOLOGIE, BACKUP) usati come entry point per funzionalità gestionali future.

- `*`
  - **Componente**: `MissingItemsPage`
  - **Ruolo**: fallback per qualsiasi route non riconosciuta, ridireziona di fatto alla Home.

### 2.2 NavBar

Sempre in `App.tsx` viene definita la **bottom navigation** con tre voci:

- **Home** → `to="/"`, icona `home` (`AppIcon`)
- **Archivio** → `to="/archivio"`, icona `archive`
- **Impostazioni** → `to="/settings"`, icona `settings`

`NavLink` usa `className={({ isActive }) => (isActive ? 'nav-item nav-item-active' : 'nav-item')}` per colorare di **ambra** icona+testo della pagina attiva.

---

## 3. Layout globale e UX

Gli stili principali sono in `web/src/styles` (`base.css`, `layout.css`, `components.css`, `archive.css`, ecc.).

### 3.1 Blocco viewport e scroll

- `base.css` blocca lo scroll globale di `html` e `body` con `overflow: hidden` e imposta `width/height: 100%`.
- L’app viene renderizzata in un wrapper tipo `.app-root`/`.page-content`.
- Lo scroll verticale avviene **solo** nelle aree centrali dedicate:
  - `.home-scroll` in Home
  - `.archive-scroll` in Archivio

### 3.2 Layout a 3 fasce

Per Home (`MissingItemsPage`) e Archivio (`ArchivePage`) viene usato lo stesso pattern in `archive.css`:

- **Header fisso** (`.home-header` / `.archive-header`):
  - contiene logo + titolo + (per Home e Archivio) search bar.
  - ha background crema (`#f7f3e8`) e rimane fisso in alto.

- **Area centrale scrollabile** (`.home-scroll` / `.archive-scroll`):
  - `position: fixed` tra `top:160px` e `bottom:80px` (altezza header e NavBar)
  - `overflow-y: auto; -webkit-overflow-scrolling: touch;` per scroll fluido, soprattutto su iOS.
  - contiene la lista principale (articoli mancanti o archivio articoli).

- **NavBar fissa** (`.bottom-nav`):
  - definita in `layout.css` come barra verde in basso, con padding e gestione `env(safe-area-inset-bottom)`.

### 3.3 Floating button “+”

- Classe `floating-add-button` in `layout.css`:
  - `position: fixed; right: 1rem; bottom: ~5.5rem; width/height: 60px; border-radius: 50%; background: #215936; box-shadow` ecc.
  - icona `plus` (`AppIcon`) bianca al centro.

Comportamento:
- In **Home**: naviga a `/archivio`.
- In **Archivio**: apre la modale "Aggiungi articolo".

---

## 4. Pagine nel dettaglio

### 4.1 Home — Lista articoli mancanti (`MissingItemsPage.tsx`)

**Scopo:** gestire la **Lista articoli mancanti**, cioè ciò che bisogna acquistare.

Elementi principali:
- Header con logo (`page-logo-wrapper` + `page-logo`) e titolo `"Lista articoli mancanti"` (`page-title`).
- Search bar:
  - wrapper `.search-row` (box bianco arrotondato).
  - icona lente via `<AppIcon name="search" />`.
  - input `type="search"` con classe `.search-input` (stile custom, iOS nativo disattivato).
- Lista articoli mancanti (hook `useMissingItems` in `shared/state/missingItemsStore.ts`, non dettagliato qui ma responsabile di `missingItems`, `suggestedItems`, `query`, `setQuery`, `addMissing`, `removeMissing`).
- Messaggio quando la lista è vuota ("Nessun articolo in lista da acquistare.").
- Floating button “+” (vedi paragrafo layout) che **naviga verso Archivio**.

Logica principale:
- **Ricerca**: l’input aggiorna `query`; la lista è filtrata in base al nome.
- **Gestione lista**: la logica completa è incapsulata in `useMissingItems`; la Home si limita a renderizzare.
- **Navigazione**: il pulsante “+” usa `useNavigate` per portare l’utente a `/archivio` dove può gestire il catalogo.

### 4.2 Archivio — Lista articoli (`ArchivePage.tsx`)

**Scopo:** gestire il catalogo articoli con possibilità di **ricerca, modifica, eliminazione e creazione**.

Elementi principali:
- Header con logo + titolo `"Archivio articoli"` + search bar.
- Lista articoli da `useCatalog` (`articoli`), filtrata per nome (`query`).
- Card articolo (`li.item-card` + `button.db-item-button`):
  - nome (`.db-item-name`)
  - tipologia (`.db-item-meta > span` con `item.tipologiaNome`).
- Modale **"Modifica articolo"** (`EditArticleModal`):
  - usa `AppModal` come wrapper.
  - campo `Nome articolo`, pulsanti `Elimina`, `Salva`, `Annulla`.
- Modale **"Aggiungi articolo"** (`NewArticleModal`):
  - titolo "Aggiungi articolo".
  - campo `Nome articolo` (`modal-input`).
  - select `Tipologia` popolata da `tipologie` di `useCatalog`.
  - pulsanti in basso: `Annulla` (outline rosso) e `Salva` (verde), stessi stili di `EditArticleModal` ma **senza** bottone Elimina.
- Floating button “+” che apre `NewArticleModal`.

Logica principale:
- `useCatalog()` fornisce:
  - `tipologie` (già ordinate alfabeticamente).
  - `articoli` (ordinati alfabeticamente per nome).
  - `updateArticoloNome(id, nuovoNome)` per salvare modifiche.
  - `deleteArticolo(id)` per eliminare.
  - `addArticolo({ nome, tipologiaId })` per la creazione.
- **Modifica articolo**:
  - click su card → set `selectedArticleId` + `setIsEditArticleOpen(true)`.
  - `EditArticleModal` chiama `onSave` → `updateArticoloNome` + chiusura.
  - `onDelete` chiede conferma via `window.confirm` → `deleteArticolo` + chiusura.
- **Aggiungi articolo**:
  - click su “+” → `setIsNewArticleOpen(true)`.
  - `NewArticleModal` invoca `onSave({ nome, tipologiaId })` se nome non vuoto.
  - `ArchivePage` chiama `addArticolo` e chiude la modale.

### 4.3 Impostazioni (`SettingsPage.tsx`)

**Scopo:** concentratore per funzioni gestionali future.

Elementi principali:
- Header con logo + titolo `"Impostazioni"`.
- Sezione `.settings-grid` con 4 pulsanti-card grandi:
  1. **IMPORTA**
     - Card verde pieno (`background:#215936; color:#fff`).
     - Icona `upload` (`AppIcon name="upload"`).
     - Attualmente **non collegato** a logica; pensato per funzionalità di import/export dati.
  2. **ARTICOLI**
     - Card bianca con testo verde.
     - Icona `file-text`.
     - Placeholder per futura gestione avanzata articoli.
  3. **TIPOLOGIE**
     - Card con background bianco/verde chiarissimo.
     - Icona `tag`.
     - Placeholder per futura gestione delle tipologie dal frontend.
  4. **BACKUP**
     - Card bianca con icona `cloud`.
     - onClick attuale contiene solo un TODO; concettualmente destinata ad aprire schermate/impostazioni del **sistema di backup** (log Supabase delle modifiche al catalogo, ripristino, ecc.).

Stile:
- Card con border-radius alto, ombra morbida, layout `display:flex; align-items:center; justify-content:center; gap:0.5rem;`.
- Font-size ~1rem, weight 500, uppercase.
- Nessuno scroll verticale su iPhone medio: layout calibrato con `margin-top` + `gap` contenuti.

---

## 5. Componenti UI condivisi

### 5.1 AppIcon (`web/src/components/AppIcon.tsx`)

Wrapper per icone `lucide-react`.

- Tipo `AppIconName` include:
  - `home`, `archive`, `settings`, `search`, `trash`, `plus`,
  - `upload`, `file-text`, `tag`, `cloud`.
- `ICON_MAP` associa i nomi ai componenti Lucide.
- Il componente rende `<IconComponent width={size} height={size} strokeWidth={1.8} {...rest} />`.
- Uso:
  - NavBar (home/archive/settings).
  - Search bar (icona lente).
  - Floating `+` (plus).
  - Pulsanti Impostazioni (upload, file-text, tag, cloud).

### 5.2 AppModal (`web/src/shared/components/AppModal.tsx`)

Componente base per tutte le modali.

- Props: `isOpen`, `title`, `onClose`, `children`.
- Quando `isOpen` è false ritorna `null`.
- Quando true, mostra:
  - backdrop `.modal-backdrop` con `role="dialog"` e `aria-modal="true"`.
  - container `.modal-container` con header (`modal-header`, `modal-title`) e body.
- Chiude la modale se l’utente clicca sul backdrop (fuori dal contenuto).

### 5.3 Modali articolo

- `EditArticleModal` (`pages/archive/EditArticleModal.tsx`):
  - usa AppModal titolo "Modifica articolo".
  - input `Nome articolo` (`modal-input`).
  - Pulsanti: `Elimina` (rosso), `Salva` (verde), `Annulla` (outline rosso).

- `NewArticleModal` (`pages/archive/NewArticleModal.tsx`):
  - usa AppModal titolo "Aggiungi articolo".
  - input `Nome articolo` + select `Tipologia` (`modal-input`).
  - Pulsanti: `Annulla` (outline rosso) e `Salva` (verde).
  - All’apertura resetta il nome e seleziona la prima tipologia disponibile.

### 5.4 Altri componenti/stili riutilizzabili

- Search bar: definita via combinazione di `.search-row`, `.search-icon`, `.search-input` in `components.css`.
- Card articoli: `.item-card`, `.db-item-button`, `.db-item-main`, `.db-item-name`, `.db-item-meta` in `archive.css`.
- Card Impostazioni: `.settings-grid`, `.settings-button`, `.settings-button-icon`, `.settings-button-label` in `archive.css`.

---

## 6. State management / Store

Gli store principali sono in `web/src/shared/state`.

### 6.1 useCatalog (`catalogStore.ts`)

Gestisce tipologie + articoli per l’Archivio.

- Stato interno:
  - `tipologie: Tipologia[]`
  - `articoli: ArticoloWithRelations[]`
  - `loadedFromSupabase: boolean` (indica se i dati provengono da Supabase o dai mock).

- Effetto iniziale:
  - Se `!isSupabaseConfigured` → carica `mockTipologie` e `mockArticoli` da `shared/data`, `loadedFromSupabase = false`.
  - Se Supabase configurato → chiama `getTipologie()` e `getArticoliWithRelations()` dal repository; in caso di errore fa fallback ai mock.

- Derivati (useMemo):
  - `sortedTipologie`: tipologie ordinate per nome.
  - `sortedArticoli`: articoli ordinati per nome.

- API esposta:
  - `tipologie`, `articoli` (ordinati).
  - `updateArticoloNome(id, nuovoNome)`:
    - mock: aggiorna in memoria.
    - Supabase: chiama `repoUpdateArticoloNome` e poi aggiorna lo stato.
  - `deleteArticolo(id)`:
    - mock: filtra in memoria.
    - Supabase: chiama `repoDeleteArticolo` e, se ok, rimuove dallo stato.
  - `addArticolo({ nome, tipologiaId })`:
    - trim del nome; se vuoto, no-op.
    - mock (`!loadedFromSupabase || !isSupabaseConfigured`):
      - trova la tipologia corrispondente o usa la prima come fallback.
      - genera id `mock-${Date.now()}`.
      - aggiunge un nuovo `ArticoloWithRelations` a `articoli`.
    - Supabase:
      - chiama `repoCreateArticolo({ nome: trimmed, tipologiaId })`.
      - mappa il record restituito a `ArticoloWithRelations` usando le tipologie in stato.
      - aggiunge il nuovo articolo alla lista.

### 6.2 Altri store

- `useMissingItems` (file non elencato qui nel dettaglio, ma presente in `shared/state`):
  - gestisce la lista degli articoli mancanti, la query di ricerca e operazioni come `addMissing`/`removeMissing`.
  - usa mock locali da `shared/data/mockItems.ts`.

---

## 7. Data layer (repository e mock)

### 7.1 catalogRepository (`shared/repositories/catalogRepository.ts`)

- Usa `supabase` e `isSupabaseConfigured` da `shared/services/supabaseClient`.
- `wrapQuery` incapsula chiamate Supabase e uniforma la gestione errori in `RepositoryResult<T>`.

Funzioni principali:

- `getTipologie(): Promise<RepositoryResult<Tipologia[]>>`
  - Query sulla tabella `tipologie` per le tipologie attive.

- `getArticoliWithRelations(): Promise<RepositoryResult<ArticoloWithRelations[]>>`
  - Query sulla tabella `articoli` con join su `tipologie`.
  - Mappa i risultati a `ArticoloWithRelations` (id, nome, tipologiaId, tipologiaNome).

- `updateArticoloNome(id, nuovoNome): Promise<RepositoryResult<Articolo>>`
  - Update del nome articolo.

- `deleteArticolo(id): Promise<RepositoryResult<null>>`
  - Delete dell’articolo.

- `createArticolo(input: CreateArticoloInput): Promise<RepositoryResult<Articolo>>`
  - Insert nella tabella `articoli` con `nome` e `tipologia_id`.
  - Restituisce l’articolo base con id/nome/tipologiaId.

Stato attuale Supabase per Archivio:
- Quando `isSupabaseConfigured === true`, le tipologie e gli articoli dell’Archivio vengono letti dalle
  tabelle reali `tipologie` e `articoli` dello schema `public` su Supabase.
- In caso di errore nelle query Supabase con env presenti, lo store azzera le liste in memoria e logga
  l’errore, senza tornare ai mock.

### 7.2 Mock data (`shared/data`)

- `mockCatalog.ts`:
  - `mockTipologie`: elenco di tipologie fisse.
  - `mockArticoli`: elenco di articoli con nome e tipologia (lista estesa per test di scroll).

- `mockItems.ts`:
  - `mockMissingItems`: dati mock per la Home (articoli mancanti).

Uso attuale:
- In assenza di Supabase configurato (`isSupabaseConfigured === false`), gli store usano questi mock
  come fonte unica di dati per Home e Archivio.

---

## 8. Logiche di funzionamento riassuntive

### 8.1 Home

- Mostra la lista articoli mancanti con ricerca.
- Non modifica direttamente il catalogo principale; è una vista dedicata al "cosa manca".
- Floating "+" serve come scorciatoia verso l’Archivio.

### 8.2 Archivio

- È la vista centrale di gestione del catalogo.
- Supporta:
  - ricerca per nome
  - modifica nome articolo (modale)
  - eliminazione articolo (con conferma)
  - creazione nuovo articolo (modale "Aggiungi articolo").
- Si appoggia completamente a `useCatalog` + `catalogRepository` + mock/Supabase.

### 8.3 Impostazioni

- Non altera ancora dati direttamente.
- Fornisce quattro entry point visuali (Importa/Articoli/Tipologie/Backup), ognuno destinato a future schermate o wizard.
- Il pulsante **Backup** è concepito per la futura gestione di un **sistema di backup automatico** (log Supabase di insert/update/delete articoli e strumenti di ripristino), ma al momento è solo UI.

### 8.4 NavBar

- Sempre visibile in fondo allo schermo.
- Route attiva evidenziata in ambra su icona + testo.
- Progettata per funzionare bene con le safe-area su dispositivi con notch.

### 8.5 Modali

- Tutte basate su `AppModal` con backdrop cliccabile.
- Stesso stile visivo: card centrale arrotondata, sfondo crema, titoli chiari, bottoni tondi.

### 8.6 Mock vs Supabase

- Determinato da `isSupabaseConfigured`:
  - `false` → caricamento da mock, tutte le operazioni (create/update/delete) agiscono solo in memoria.
  - `true` → store utilizza repository Supabase per caricare e mutare i dati.
- Questo permette di sviluppare e testare la UI senza dipendere da un backend già configurato.

---

## 9. Estensioni future previste / TODO strutturali

Questi elementi sono già presenti nella UI o nel codice, ma non ancora completati a livello di business logic:

- **Supabase completo per BARnode Web**:
  - definizione e creazione reale delle tabelle (articoli, tipologie, eventuali tabelle di backup/log).
  - collegamento definitivo degli store alla base dati.

- **Sistema di backup automatico**:
  - tabella/i di log su Supabase che registrano ogni insert/update/delete di articoli.
  - flusso di ripristino (es. pagina dedicata dietro il pulsante `BACKUP` nelle Impostazioni).
  - gestione delle impostazioni di backup (frequenza, scope, ecc.).

- **Pulsanti Impostazioni**:
  - IMPORTA: pagina o wizard per importare/esportare dati da file (CSV/JSON) o altre fonti.
  - ARTICOLI: eventuale vista avanzata di gestione massiva articoli.
  - TIPOLOGIE: UI per CRUD delle tipologie (oggi gestite solo via mock/DB direttamente).
  - BACKUP: schermata per gestire e lanciare backup/ripristino.

- **Ulteriore hardening UX**:
  - validazioni più ricche nelle modali (messaggi di errore inline per campi vuoti, ecc.).
  - miglioramenti di accessibilità (aria-label coerenti ovunque, focus management modali, ecc.).

---

## 10. Manutenzione di questo documento

Ogni volta che si introduce una modifica strutturale in BARnode Web, questo file deve essere aggiornato nella **stessa modifica/PR**, in particolare quando:

- si aggiungono o modificano route / pagine
- si introducono nuovi componenti UI principali (NavBar alternative, nuove modali, wizard, ecc.)
- si modificano gli store o si aggiungono nuovi hook di stato
- si estende il data layer (nuovi repository, attivazione Supabase, sistema di backup)
- si cambia in modo significativo il layout o il comportamento delle pagine principali

In caso di aggiunta di altra documentazione (es. report tecnici specifici), citare qui il nuovo file e lo scopo (es. `docs/REPORT_SUPABASE_SETUP.md` per i dettagli dell’integrazione backend).
