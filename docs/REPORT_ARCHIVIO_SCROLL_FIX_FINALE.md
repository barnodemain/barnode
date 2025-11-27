# REPORT FINALE — Fix scroll Archivio BARnode Web

## 1. Struttura DOM finale della pagina Archivio

Percorso per la route `/archivio`:

- `App` (`web/src/App.tsx`)
  - `<div className="app-root">`
    - `<div className="page-content">`  ← **contenitore scroll principale**
      - `<Routes>` … `<Route path="/archivio" element={<ArchivePage />} />`
    - `<nav className="bottom-nav">`  ← **NavBar fissa in fondo (position: fixed)**

- `ArchivePage` (`web/src/pages/ArchivePage.tsx`)
  - `<main className="page">`
    - `<div className="db-page">`
      - `<header className="page-header">`  ← **header sticky**
        - `<div className="page-logo-wrapper">`
          - `<img src={logo} alt="Barnode" className="page-logo" />`
        - `<h1 className="page-title">Archivio articoli</h1>`
        - search bar (`.search-row` con icona `AppIcon name="search"` e `input.search-input`)
      - `<section className="list">`
        - `<div className="db-list-scroll">`
          - `<ul className="item-list">`
            - `<li className="item-card">` per ogni articolo
              - `<button className="db-item-button">`
                - `<div className="db-item-main">`
                  - `<div className="db-item-name">{item.nome}</div>`
                  - `<div className="db-item-meta">{item.tipologiaNome}</div>`
    - `<EditArticleModal ... />` (modale di edit articol0)

## 2. CSS finale dei container chiave

### 2.1 Layout globale

File: `web/src/styles/base.css`

- `html, body, #root`:
  - `height: 100%;`
  - `margin: 0;`
  - `overflow: hidden;`

Quindi nessuno scroll sul body: tutto lo scroll avviene all'interno dell'app.

File: `web/src/styles/layout.css`

- `.app-root`:
  - `min-height: 100vh;`
  - `display: flex; flex-direction: column;`

- `.page-content` (contenitore scroll principale):
  - `flex: 1 1 auto;`
  - `display: flex; flex-direction: column;`
  - `overflow-y: auto;`  ← **scroll verticale qui**
  - `padding: 1rem;`
  - `padding-bottom: 5.8rem;` (spazio per la NavBar fissa)
  - `min-height: 0;`

- `.page` (main per ogni pagina):
  - `display: flex; flex-direction: column;`
  - `flex: 1 1 auto;`
  - `min-height: 0;`

- `.page-header` (header Archivio e Home):
  - `position: sticky; top: 0; z-index: 1;`
  - `display: flex; flex-direction: column; align-items: center; gap: 0.75rem;`
  - `background-color: #f7f3e8;`  ← stesso colore dello sfondo app, così lo sticky è invisibile.

- `.list` (sezione lista, usata sia in Home che in Archivio):
  - `margin-top: 1rem;`
  - `display: flex; flex-direction: column;`
  - `flex: 1 1 auto;`
  - `min-height: 0;`

- `.bottom-nav`:
  - `position: fixed; left: 0; right: 0; bottom: 0;`
  - `display: flex; justify-content: space-around; align-items: center;`
  - `background-color: #215936; color: #ffffff;`
  - padding con `env(safe-area-inset-bottom, 0px)`;
  - `min-height: 64px;`

### 2.2 CSS specifico Archivio

File: `web/src/styles/archive.css`

- `.db-page`:
  - `display: flex; flex-direction: column;`
  - `flex: 1 1 auto;`
  - `min-height: 0;`

- `.db-list-scroll`:
  - `flex: 1 1 auto;`
  - `padding-bottom: 1.5rem;`  ← margine inferiore per gli ultimi item sotto la NavBar
  - **nessun `overflow-y` qui**: lo scroll è delegato a `.page-content`.

Tutti gli altri selettori `.db-item-*` sono puramente estetici (card, testi, ecc.) e non influenzano l'overflow.

## 3. Sorgente dati articoli (mock vs Supabase)

File: `web/src/shared/state/catalogStore.ts`

- `useCatalog` decide tra Supabase e mock in base a `isSupabaseConfigured`:
  - se Supabase **non è configurato**:
    - usa `mockTipologie` e `mockArticoli` da `web/src/shared/data/mockCatalog.ts`.
  - se Supabase è **configurato** e le query vanno a buon fine:
    - carica le tipologie e gli articoli reali dal database.
  - in caso di errore Supabase:
    - fallback ai mock (`mockTipologie` / `mockArticoli`).

Nel contesto di sviluppo in cui è stato testato lo scroll:
- Supabase non è configurato, quindi vengono usati i **mock**.

File: `web/src/shared/data/mockCatalog.ts`

- `mockArticoli` contiene **40 articoli** (`art-1` … `art-40`).
- Le tipologie usate (`tip-gin`, `tip-amaro`, `tip-vino`, `tip-soft`, `tip-garnish`) sono coerenti con `Tipologia`.
- Questo garantisce liste sufficientemente lunghe sia in Home (`useMissingItems`) che in Archivio (`useCatalog`) per testare lo scroll.

## 4. Cliccabilità articoli + scroll compatibili

Markup per ogni articolo Archivio (semplificato):

```tsx
<li className="item-card">
  <button
    type="button"
    className="db-item-button"
    onClick={() => {
      setSelectedArticleId(item.id);
      setIsEditArticleOpen(true);
    }}
  >
    <div className="db-item-main">
      <div className="db-item-name">{item.nome}</div>
      <div className="db-item-meta">
        <span>{item.tipologiaNome}</span>
      </div>
    </div>
  </button>
</li>
```

Non sono presenti handler `onTouchStart`/`onTouchMove` personalizzati né `preventDefault` globali sui tocchi:
- lo scroll verticale avviene sul contenitore `.page-content`;
- il **tap singolo** sul bottone apre ancora correttamente `EditArticleModal`;
- lo swipe verticale sopra la lista viene interpretato come scroll, non come click multiplo.

## 5. Comportamento finale (desktop + iPhone/PWA)

### 5.1 Desktop

- `/archivio`:
  - Logo Barnode, titolo "Archivio articoli" e barra di ricerca restano sempre visibili in alto (header sticky).
  - La NavBar verde rimane fissa in basso (position fixed).
  - Solo l'area centrale scorre, tramite `overflow-y:auto` su `.page-content`.
  - Gli ultimi elementi della lista non vengono coperti dalla NavBar, grazie al `padding-bottom` di `.page-content` e di `.db-list-scroll`.

- `/` (Home):
  - Stesso schema di scroll: header sticky, lista articoli mancanti che scorre dentro `page-content`.

### 5.2 iPhone / PWA (scenario testato)

- Nessuno scroll sul body (resta `overflow:hidden`).
- Lo scroll verticale avviene nel contenitore `.page-content` dell'app.
- L'header Archivio (logo + titolo + search) rimane sempre visibile grazie a `position: sticky`.
- La NavBar verde resta ancorata in fondo allo schermo.
- La lista di articoli, sufficientemente lunga, scorre in modo fluido e touch-friendly nella zona centrale.
- Il tap singolo su un articolo apre l'edit modal corretta; dopo la chiusura della modale lo scroll continua a funzionare normalmente.

## 6. Stato finale lint/build

Da `web/` sono stati eseguiti:

- `npm run lint` → **OK** (nessun errore eslint/TS).
- `npm run build` → **OK**.

Warning residui:
- quello noto di Vite sul CJS Node API deprecato;
- warning degli strumenti browser su `-webkit-overflow-scrolling` non supportato in alcuni ambienti (irrilevante: la regola viene semplicemente ignorata fuori da iOS).

Nel complesso, la pagina Archivio soddisfa ora il requisito UX non negoziabile: header e NavBar fissi, lista articoli scrollabile in modo fluido (anche su iPhone/PWA) e articoli pienamente cliccabili per l'apertura della modale di modifica.

## 7. Cambio di strategia: scroll di pagina semplice

In una fase successiva è stata abbandonata la strategia "app shell" con `html/body/#root` bloccati e scroll interno annidato, in favore di un approccio più semplice e robusto:

- `html` e `body` non hanno più `overflow: hidden`; usano invece:

  ```css
  html,
  body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    overflow-y: auto;
  }

  #root {
    min-height: 100%;
  }
  ```

- `.page-content` non è più un contenitore di scroll interno:

  ```css
  .page-content {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    padding-bottom: 5.8rem; /* spazio visivo sopra la NavBar fissa */
  }
  ```

- La pagina Archivio espone una struttura lineare:

  ```tsx
  <main className="page archive-page">
    <header className="page-header"> ... </header>
    <ul className="archive-item-list"> ... </ul>
    <EditArticleModal ... />
  </main>
  ```

  con CSS corrispondente:

  ```css
  .archive-page {
    max-width: 800px;
    margin: 0 auto;
  }

  .archive-item-list {
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  ```

In questo assetto:

- è la **pagina intera** (body) a scrollare in modo naturale, come in un sito web classico;
- la NavBar verde resta `position: fixed` in fondo allo schermo;
- l'header Archivio può scorrere con la pagina (sticky non è più un requisito forte);
- non esistono più container con `overflow-y: auto` dedicati alla lista: l'overflow è gestito dal browser sul documento.

Questo riduce al minimo i rischi di comportamenti differenti tra desktop, Safari mobile e PWA, concentrando lo scroll su un singolo livello (il body) e lasciando la NavBar come overlay sempre visibile.

## 8. Layout a 3 fasce per /archivio

Per ottenere un comportamento ancora più controllato su `/archivio`, è stato introdotto un layout a 3 fasce locale alla pagina Archivio, basato su `position: fixed`:

- Struttura JSX finale di `ArchivePage`:

  ```tsx
  <main className="page archive-page">
    <header className="archive-header"> ... logo + titolo + search ... </header>
    <div className="archive-scroll">
      <ul className="archive-item-list"> ... card articoli ... </ul>
    </div>
    <EditArticleModal ... />
  </main>
  ```

- CSS chiave in `archive.css`:

  ```css
  .archive-page {
    position: relative;
    min-height: 100vh;
  }

  .archive-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 1rem 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    background-color: #f7f3e8;
    z-index: 10;
  }

  .archive-scroll {
    position: fixed;
    left: 0;
    right: 0;
    top: 160px;   /* altezza stimata header */
    bottom: 80px; /* altezza stimata NavBar */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 1rem 1.5rem;
  }

  .archive-item-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  ```

In questo schema:

- l'**header Archivio** (logo + titolo + search) rimane sempre visibile in alto;
- la **NavBar** continua a essere fissa in basso (`position: fixed` in `layout.css`);
- la lista articoli scorre solo dentro `archive-scroll`, l'area centrale compresa tra `top: 160px` e `bottom: 80px`;
- il body resta scrollabile in generale, ma per la pagina Archivio la porzione visivamente scrollabile è `archive-scroll`, con supporto allo scroll inerziale su iOS grazie a `-webkit-overflow-scrolling: touch`.

## 9. Layout 3 fasce Home

La pagina Home (`MissingItemsPage`, route `/`) è stata allineata allo stesso schema a 3 fasce usato per `/archivio`:

- Struttura JSX finale della Home:

  ```tsx
  <main className="page home-page">
    <header className="home-header"> ... logo + titolo + search ... </header>
    <div className="home-scroll">
      {/* suggerimenti + lista mancanze */}
      <section className="list">
        <ul className="home-item-list"> ... card mancanze ... </ul>
      </section>
    </div>
  </main>
  ```

- CSS chiave in `archive.css`:

  ```css
  .home-page {
    position: relative;
    min-height: 100vh;
  }

  .home-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 1rem 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    background-color: #f7f3e8;
    z-index: 10;
  }

  .home-scroll {
    position: fixed;
    left: 0;
    right: 0;
    top: 160px;   /* altezza stimata header Home */
    bottom: 80px; /* altezza stimata NavBar */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 1rem 1.5rem;
  }

  .home-item-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  ```

In questo modo, anche la Home espone un layout a 3 fasce:

- header sempre visibile in alto;
- NavBar fissa in basso;
- solo la lista delle mancanze scorre dentro `home-scroll`, con comportamento coerente tra desktop e iPhone/PWA.
