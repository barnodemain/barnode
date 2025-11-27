# REPORT DIAGNOSTICO — Pagina Archivio & Scroll lista articoli

## 1. Struttura attuale della pagina Archivio

### 1.1 Gerarchia React / JSX

Componente pagina Archivio:
- File: `web/src/pages/ArchivePage.tsx`
- Route associata: `/archivio` (definita in `App.tsx`).

Struttura JSX principale:

- `App` (`web/src/App.tsx`)
  - `<div className="app-root">`
    - `<div className="page-content">`
      - `<Routes>` … `<Route path="/archivio" element={<ArchivePage />} />`
    - `<nav className="bottom-nav">` (NavBar fissa)

- `ArchivePage` (`web/src/pages/ArchivePage.tsx`)
  - `<main className="page">`
    - `<div className="db-page">`
      - `<header className="page-header">`
        - `<h1 className="page-title">Archivio articoli</h1>`
        - search bar (`.search-row` con icona e `input.search-input`)
      - `<section className="list">`
        - `<div className="db-list-scroll">`
          - `<ul className="item-list">`
            - `<li className="item-card">` per ogni articolo
              - `<button className="db-item-button">`
                - `<div className="db-item-main">`
                  - `<div className="db-item-name">`
                  - `<div className="db-item-meta">`
    - `<EditArticleModal ... />` (modale, fuori da `db-page`)

Elementi chiave rispetto allo scroll:
- Contenitore globale della pagina Archivio: `main.page` **dentro** `div.page-content`.
- Wrapper Archivio: `div.db-page`.
- Header fisso desiderato: `header.page-header` (titolo + search bar).
- Lista da scrollare: blocco `section.list > div.db-list-scroll > ul.item-list`.
- NavBar fissa: `nav.bottom-nav` **fuori** da `page-content`, posizionata `fixed` al fondo del viewport.

### 1.2 Gerarchia CSS globale (layout)

File: `web/src/styles/base.css`

- `html, body, #root`:
  - `height: 100%;`
  - `margin: 0;`
  - `overflow: hidden;`

Implicazioni:
- Il **viewport effettivo** per lo scroll non è il body/root (che sono bloccati), ma eventuali contenitori interni devono gestire lo scroll.
- Questo è coerente con l’obiettivo di avere una shell app stile “mobile app” con bottom-nav fissa.

File: `web/src/styles/layout.css`

- `.app-root`:
  - `min-height: 100vh;`
  - `display: flex;`
  - `flex-direction: column;`
  - `background-color: #f7f3e8;`

- `.page-content`:
  - `flex: 1 1 auto;`
  - `display: flex;`
  - `flex-direction: column;`
  - `overflow: hidden;`
  - `padding: 1rem;`
  - `padding-bottom: 5.8rem;` (spazio per la NavBar fissa)
  - `min-height: 0;`

- `.page-header`:
  - semplice colonna centrata (non influisce direttamente sullo scroll).

- `.list`:
  - `margin-top: 1rem;`
  - `display: flex;`
  - `flex-direction: column;`
  - `flex: 1 1 auto;`
  - `min-height: 0;`

- `.bottom-nav`:
  - `position: fixed; left: 0; right: 0; bottom: 0;`
  - `display: flex; justify-content: space-around; align-items: center;`
  - `background-color: #215936; color: #ffffff;`
  - `padding: 16px 16px calc(6px + env(safe-area-inset-bottom, 0px));`
  - `min-height: 64px;`

Implicazioni per l’Archivio:
- `app-root` occupa tutto il viewport.
- `page-content` è un flex container in colonna, con `overflow: hidden`: non scrolla di per sé, ma i figli possono.
- `.list` è l’unico elemento dentro `page-content` marcato con `flex: 1 1 auto;`.
- `min-height: 0` su `.page-content` e `.list` è un pattern corretto per consentire a un figlio flex di diventare scroll container.

### 1.3 CSS specifico Archivio

File: `web/src/styles/archive.css`

- `.db-page`:
  - `display: flex;`
  - `flex-direction: column;`
  - `flex: 1 1 auto;`
  - `min-height: 0;`

- `.db-list-scroll`:
  - `flex: 1 1 auto;`
  - `overflow-y: auto;`
  - `padding-bottom: 1.5rem;`

- `.db-item-*` e `.db-box`:
  - gestione estetica (card, testi, ecc.), non rilevante per l’overflow salvo padding.

Osservazione importante:
- Nel JSX, `db-page` è figlio di `main.page` (che a sua volta è figlio di `.page-content`).
- La classe `.list` è applicata alla `section` **che contiene `db-list-scroll`**, ma `db-page` non è direttamente il figlio con `.list`.

## 2. Configurazione CSS rilevante per lo scroll

Riassumendo gli aspetti critici:

1. `html, body, #root` hanno `overflow: hidden;` → lo scroll deve essere gestito da un contenitore interno.
2. `app-root` è un flex container in colonna, full-height.
3. `page-content` è un flex container in colonna con `overflow: hidden` e `min-height: 0`.
4. `.list` è un figlio diretto di `page-content` con `flex: 1 1 auto; min-height: 0;`.
5. `ArchivePage` inserisce all’interno di `main.page`:
   - `div.db-page` (con flex: 1 1 auto; min-height: 0;)
   - dentro `db-page`, un `header` e poi `section.list`.
6. `.db-list-scroll` è figlio di `section.list` e ha `overflow-y: auto; flex: 1 1 auto;`.

Dal punto di vista teorico, per avere “solo la lista scrolla” servirebbe:
- una catena di contenitori flex con `min-height: 0;` fino al contenitore scroll (`.db-list-scroll`), che ha `flex: 1` e `overflow-y: auto`.
- nessun `overflow: hidden` sul contenitore scroll o sui suoi discendenti.

Nel codice attuale:
- `page-content` ha `overflow: hidden;` (ok se lo scroll è delegato più in basso).
- `.db-page` e `.list` hanno flex + `min-height: 0`, ma `main.page` **non ha stile dedicato** (viene ereditato da `.page-content`).

## 3. Analisi del problema

### 3.1 Dove dovrebbe avvenire lo scroll

L’intento è chiaro dal naming CSS:

- `db-list-scroll` è il candidato naturale a essere il **contenitore scrollabile**.
- `db-page` dovrebbe fungere da contenitore flessibile verticale per:
  - header fisso (`page-header`).
  - sezione `list` che occupa lo spazio rimanente.

Quindi la catena ideale è:

`app-root (flex col, full vh)`
→ `page-content (flex col, overflow hidden, min-height 0)`
→ `main.page (?)`
→ `div.db-page (flex col, flex: 1, min-height 0)`
→ `section.list (flex col, flex: 1, min-height 0)`
→ `div.db-list-scroll (flex: 1, overflow-y auto)`

### 3.2 Punti critici individuati

1. `main.page` non è stilizzato

- In `layout.css` non esiste una regola `.page`.
- `main.page` eredita solo il comportamento di default (`display: block`), senza flex né `min-height: 0`.
- Dentro `page-content`, il figlio diretto è `main.page`, **non** `div.db-page`.
  - Questo significa che le regole `.list { flex: 1 ... }` e `.db-page { flex: 1 ... }` potrebbero non avere l’effetto desiderato, perché il nodo che partecipa direttamente al layout flex di `page-content` è `main.page`.

Conseguenza pratica:
- `page-content` vede un singolo figlio (`main.page`) che occupa la sua altezza naturale.
- `section.list` e `div.db-list-scroll` lavorano dentro un contesto di layout “normale” (non strettamente vincolato in altezza), quindi:
  - la lista può allungarsi quanto vuole.
  - lo scroll potrebbe avvenire a livello di `page-content` o di `body` (quando l’overflow hidden viene bypassato su piattaforme particolari), oppure non avvenire come previsto su alcuni device.

2. Doppio livello di flex tra `.list` e `.db-list-scroll`

- `.list` ha `display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0;` (in `layout.css`).
- `.db-list-scroll` ha `flex: 1 1 auto; overflow-y: auto;` (in `archive.css`).

Questo è in sé corretto per avere:
- header + lista in una colonna,
- con la lista che prende lo spazio residuo in `list`.

Ma se il contenitore genitore (`db-page` e soprattutto `main.page`) non è in un contesto flex con altezza vincolata, il meccanismo non funziona come “scroll interno”, bensì come semplice estensione verticale.

3. `overflow: hidden` su `page-content` e `html/body/#root`

- `overflow: hidden` su `html, body, #root` è voluto per bloccare lo scroll globale.
- `overflow: hidden` su `page-content` è gestibile **solo se** un discendente con altezza definita/derivata (`flex`) ha `overflow-y: auto`.

Se la catena non è completa (per colpa di `main.page` non flex), ci si può ritrovare con:
- contenitori interni che non hanno altura vincolata,
- comportamenti diversi tra browser (desktop vs mobile) su come trattano gli overflow annidati quando il root è hidden.

4. Differenze desktop / mobile / PWA

Dal solo codice non emergono media query specifiche o hack per mobile/iOS relativi a `.db-page`/`.db-list-scroll`.
Tuttavia:
- l’uso di `height: 100%; overflow: hidden` su `html/body/#root` + `min-height: 100vh` su `.app-root` è tipico di layout “full app” che possono reagire in modo diverso tra:
  - Safari iOS standalone (PWA)
  - Safari in tab
  - Chrome desktop
- In mancanza di uno stile esplicito per `main.page`, i diversi motori possono calcolare altezze e overflow in maniera non uniforme.

## 4. Possibili soluzioni (concettuali, non ancora implementate)

Di seguito alcune strategie concrete, **descritte in termini concettuali**, senza ancora toccare il codice.

### Strategia A — Rendere `main.page` parte del layout flex

Obiettivo:
- Inserire `main.page` correttamente nella catena flex tra `page-content` e `db-page`, in modo che `db-page` e poi `list` e `db-list-scroll` possano realmente usare l’altezza residua.

Idea:
- Definire una regola `.page` (in `layout.css`) che faccia di `main.page` un contenitore flex verticale:
  - `display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0;`
- In questo modo:
  - `page-content` (flex col, overflow hidden) → `main.page` (flex col, flex:1) → `db-page` (flex col, flex:1) → `list` (flex col, flex:1) → `db-list-scroll` (flex:1, overflow-y:auto).

Vantaggi:
- Minimo cambiamento strutturale.
- Aderente all’intento originario (sono già presenti `flex: 1` e `min-height: 0` su `db-page` e `list`).

Rischi/attenzioni:
- Verificare che anche la Home (`MissingItemsPage`) usi `main.page` nello stesso modo, per non rompere la coerenza tra pagine.
- Curare il padding inferiore (`padding-bottom: 5.8rem` su `.page-content`) per evitare che la lista venga nascosta dietro la NavBar fissa.

### Strategia B — Spostare la responsabilità dello scroll direttamente su `page-content`

Obiettivo:
- Lasciare `db-list-scroll` come semplice wrapper e delegare lo scroll a `page-content`.

Idea:
- Rimuovere (concettualmente) `overflow: hidden` da `.page-content` e sostituirlo con `overflow-y: auto`.
- Garantire che l’header Archivio e la NavBar restino comunque fissi relativamente al viewport.

Problema:
- Poiché la NavBar è `position: fixed` a livello globale, se `page-content` inizia a scrollare, si rischia che **anche l’header di Archivio** (titolo + search) scorra fuori vista, contraddicendo l’obiettivo (“header sempre fisso, solo lista scrolla”).
- Questa strategia avvicina il comportamento a una pagina web classica, non a una “app shell”.

Conclusione:
- Non è ideale per il requisito “solo lista scrollabile”, ma può essere un fallback semplice se si accetta di perdere l’header fisso.

### Strategia C — Ridurre un livello di annidamento (semplificare `db-page` / `list`)

Obiettivo:
- Semplificare la catena di container che partecipano al flex per evitare ambiguità.

Idea:
- Invece di avere `db-page` + `list` + `db-list-scroll`, spostare parte della responsabilità su meno livelli, ad esempio:
  - `main.page` → `div.page-inner` con `display:flex; flex-direction:column;`
  - `header` in alto,
  - `div.scroll-area` con `flex:1; overflow-y:auto;` che contiene direttamente la lista.

Questa strategia implicherebbe:
- un refactor più ampio del naming/classi (`db-page`, `list`, `db-list-scroll`).
- potenziale impatto su altre pagine (Home) che riusano `.list`.

Conclusione:
- Più invasiva; probabilmente da considerare solo se la Strategia A non fosse sufficiente o se si decidesse di normalizzare tutte le pagine con un layout unico.

## 5. Rischi e punti di attenzione

- **iOS / PWA:**
  - L’uso di `height: 100%` + `min-height: 100vh` + `overflow: hidden` può comportare differenze di comportamento tra Safari in PWA e Safari in tab.
  - È importante testare il futuro fix sia in browser desktop che su iPhone (Safari + PWA installata) per verificare:
    - che la lista scrolli fluidamente;
    - che l’header resti fisso;
    - che la NavBar non copra gli ultimi elementi (padding bottom sufficiente).

- **Safe-area:**
  - La NavBar usa `env(safe-area-inset-bottom, 0px)` nel padding.
  - Va mantenuto un adeguato `padding-bottom` sulla zona scrollabile per evitare che gli ultimi elementi risultino parzialmente nascosti dietro la NavBar / home indicator.

- **Condivisione delle classi tra Home e Archivio:**
  - `.list`, `.item-list`, `.item-card` sono condivise tra `MissingItemsPage` e `ArchivePage`.
  - Qualunque modifica strutturale (soprattutto su `.list`) va testata su entrambe le pagine, per non rompere lo scroll della Home (che usa anche suggerimenti e lista articoli mancanti).

## 6. Sintesi diagnostica

- La struttura è già quasi allineata a un pattern “solo lista scrolla”: ci sono
  - `flex: 1; min-height: 0;` su `.list` e `.db-page`;
  - `overflow-y: auto;` su `.db-list-scroll`.
- Il punto debole principale è `main.page`, che non è definito come elemento flex e quindi interrompe la catena di layout tra `.page-content` (flex col) e `.db-page` / `.list` / `.db-list-scroll`.
- In combinazione con `overflow: hidden` su `html/body/#root` e su `.page-content`, questo può generare comportamenti incoerenti dello scroll tra desktop e mobile (lista che non scrolla, o che scrolla insieme a tutto il contenuto invece che in un’area dedicata).

Strategia consigliata per il prossimo step:
- Implementare la **Strategia A**:
  - introdurre una regola `.page` che renda `main.page` un contenitore flex in colonna con `flex: 1` e `min-height: 0`;
  - verificare che, con questa modifica, la catena flex sia completa e che `.db-list-scroll` diventi realmente il contenitore scrollabile unico;
  - testare il comportamento su Home e Archivio, desktop e iPhone.

Questa soluzione è la meno invasiva e più coerente con la struttura già esistente, e dovrebbe permettere di ottenere l’obiettivo UX: header e NavBar fissi, lista Archivio scrollabile in modo indipendente.

## 7. Fix implementato (Strategia A)

È stata implementata la Strategia A descritta sopra, introducendo uno stile esplicito per `main.page`.

### 7.1 Modifica CSS applicata

- File: `web/src/styles/layout.css`
- Aggiunta la regola:

  ```css
  .page {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
  }
  ```

Questa regola rende `main.page` parte integrante della catena flex tra `page-content` e i container specifici dell'Archivio.

### 7.2 Catena flex finale

Lo schema aggiornato dei container che partecipano al layout e allo scroll è:

1. `div.page-content`
   - `display: flex; flex-direction: column; overflow: hidden; min-height: 0;`
2. `main.page`
   - `display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0;`
3. `div.db-page`
   - `display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0;`
4. `section.list`
   - `display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0;`
5. `div.db-list-scroll`
   - `flex: 1 1 auto; overflow-y: auto; padding-bottom: 1.5rem;`

In questo assetto:
- `page-header` (titolo + barra di ricerca) rimane nella parte alta della colonna e non partecipa allo scroll.
- `db-list-scroll` occupa esattamente lo spazio residuo tra header e NavBar, e diventa l'unico contenitore scrollabile.

### 7.3 Esito test (desktop e mobile)

- **Desktop (browser)**
  - `/archivio`:
    - Titolo "Archivio articoli" e search bar restano fissi in alto.
    - La NavBar verde rimane fissa in basso (position: fixed) come prima.
    - Solo l'area centrale con la lista (`db-list-scroll`) scrolla con mouse/trackpad.
    - Gli ultimi elementi della lista non risultano coperti dalla NavBar grazie al `padding-bottom` di `db-list-scroll` e al `padding-bottom` di `page-content`.
  - `/` (Home):
    - Il comportamento di scroll della lista articoli mancanti resta corretto.

- **Mobile (scenario atteso)**
  - Su device mobili, la struttura della catena flex è ora coerente anche con `overflow: hidden` su `html/body/#root`:
    - Header Archivio fisso in alto.
    - NavBar fissa in basso con gestione della safe-area.
    - Lista articoli scrollabile in modo indipendente e fluido al tocco.

Per facilitare i test di scroll è stato esteso anche il dataset mock (`mockArticoli` in `web/src/shared/data/mockCatalog.ts`) a circa 40 elementi, in modo da avere liste sufficientemente lunghe sia in Home che in Archivio.

### 7.4 Stato tecnico

- Dopo il fix è stato verificato che:
  - `npm run lint` (frontend `web/`) resta **OK**.
  - `npm run build` (Vite) resta **OK**.
  - Non sono stati introdotti nuovi warning, a parte quello già noto di Vite sul CJS Node API deprecato.

Il layout dell'Archivio rispecchia ora l'obiettivo UX definito: intestazione fissa, NavBar fissa e sola lista di articoli scrollabile all'interno del proprio contenitore.
