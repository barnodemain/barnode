# REPORT ICONE — BARnode Web (migrazione iniziale)

## 1. Sistema icone attuale (prima della migrazione)

- Nessuna libreria di icone esterna in uso.
- Icone presenti solo come:
  - emoji inline per la lente di ricerca (`🔍`) in:
    - `web/src/pages/MissingItemsPage.tsx` (search della Home)
    - `web/src/pages/ArchivePage.tsx` (search dell'Archivio)
  - emoji inline per il cestino (`🗑️`) in:
    - `web/src/pages/MissingItemsPage.tsx` (rimozione articolo mancante)
- La NavBar inferiore (`web/src/App.tsx`) mostrava solo testo:
  - `Home`, `Archivio`, `Impostazioni` senza icone.
- Nessun wrapper comune per le icone e nessun SVG custom.

## 2. Nuova libreria scelta

Libreria selezionata: **lucide-react**

Motivazioni principali:

- Stile **outline/lineare** con tratto sottile e moderno.
- Icone **monocromatiche** per impostazione predefinita, che rispettano `currentColor`.
- Design professionale, adatto a una web app gestionale (derivato da Lucide Icons).
- Libreria **stabile e mantenuta**, con buona documentazione e supporto TypeScript.
- API semplice: ogni icona è un componente React (es. `Home`, `Search`, `Settings`) facilmente componibile.

Dipendenza aggiunta:

- `lucide-react` installata in `web/` con npm.

## 3. Wrapper applicativo per le icone

Per centralizzare la gestione delle icone e mantenere un set minimale, è stato introdotto un wrapper dedicato:

- File: `web/src/components/AppIcon.tsx`
- Esporta:
  - `type AppIconName = 'home' | 'archive' | 'settings' | 'search' | 'trash'`.
  - `function AppIcon({ name, size = 20, ...rest })`.
- Mappa interna (`ICON_MAP`) che associa i nomi logici dell'app alle icone Lucide:
  - `home` → `Home` icon.
  - `archive` → `Archive` icon.
  - `settings` → `Settings` icon.
  - `search` → `Search` icon.
  - `trash` → `Trash2` icon.
- Caratteristiche del wrapper:
  - Dimensione controllabile via prop `size` (default 20).
  - Passa `width`, `height` e `strokeWidth={1.8}` all'icona Lucide per un tratto sottile ma leggibile.
  - Eredita il colore da `currentColor`, quindi si integra automaticamente con i contesti:
    - bianco sulla NavBar.
    - nero nelle card Archivio o nei pulsanti.

Questo wrapper permette una sostituzione e un controllo centralizzati: aggiungere nuove icone o cambiare libreria richiede solo modifiche in `AppIcon.tsx`.

## 4. Migrazione iniziale effettuata

### 4.1 Home (MissingItemsPage)

File: `web/src/pages/MissingItemsPage.tsx`

- Prima:
  - Search bar:
    - `<span className="search-icon" aria-hidden="true">🔍</span>`
  - Pulsante rimozione articolo mancante:
    - `<button ...>🗑️</button>`
- Dopo:
  - Search bar:
    - Usa `AppIcon`:
      - `<AppIcon name="search" size={16} />` dentro lo span `.search-icon`.
    - Mantiene la stessa struttura CSS (`.search-row`, `.search-icon`, `.search-input`).
  - Pulsante rimozione:
    - Usa `AppIcon`:
      - `<AppIcon name="trash" size={18} />` dentro il bottone `.item-delete-button`.
    - Etichetta ARIA invariata (`aria-label` con nome articolo).

Risultato:

- Le icone nella Home sono ora outline monocromatiche, controllate via CSS e coerenti col design moderno.

### 4.2 Archivio (ArchivePage)

File: `web/src/pages/ArchivePage.tsx`

- Prima:
  - Search bar Archivio:
    - `<span className="search-icon" aria-hidden="true">🔍</span>`
- Dopo:
  - Import di `AppIcon` da `../components/AppIcon`.
  - Search bar:
    - `<AppIcon name="search" size={16} />` dentro lo span `.search-icon`.

Risultato:

- La lente di ricerca nella pagina Archivio è ora allineata stilisticamente con quella della Home, usando lo stesso set Lucide.

### 4.3 NavBar inferiore

File: `web/src/App.tsx`

- Prima:
  - NavLink solo testo:
    - `Home`
    - `Archivio`
    - `Impostazioni`
- Dopo:
  - Import di `AppIcon` da `./components/AppIcon`.
  - Ogni `NavLink` contiene ora icona + testo:
    - Home:
      - `<AppIcon name="home" size={18} />` + `<span>Home</span>`.
    - Archivio:
      - `<AppIcon name="archive" size={18} />` + `<span>Archivio</span>`.
    - Impostazioni:
      - `<AppIcon name="settings" size={18} />` + `<span>Impostazioni</span>`.

Aggiornamento CSS NavBar (`web/src/styles/layout.css`):

- `nav-item` prima:
  - centrato solo testo; padding verticale adatto a label singola.
- `nav-item` dopo:
  - trasformato in piccolo layout verticale icona + testo:
    - `display: flex; flex-direction: column; align-items: center; justify-content: center;`
    - `gap: 4px;`
    - `font-size: 0.9rem;`
    - `padding: 4px 0;`

Risultato:

- La NavBar mostra ora icone outline bianche sopra il testo, mantenendo le geometrie esistenti della barra.
- Le icone ereditano il colore dalla NavBar (`color: #ffffff`), risultando monocromatiche e coerenti con il tema.

## 5. Strategia di migrazione globale (fasi successive)

1. Fase completata (questa PR):
   - Introduzione di `lucide-react` come libreria standard.
   - Creazione del wrapper `AppIcon` con set minimo (`home`, `archive`, `settings`, `search`, `trash`).
   - Sostituzione delle emoji in:
     - Home (search + trash).
     - Archivio (search).
   - Aggiunta icone nella NavBar per le tre sezioni principali.

2. Fasi consigliate per step futuri:

   - Estendere l'uso di `AppIcon` ad altre parti dell'app non ancora coperte (eventuali nuove funzionalità).
   - Mantenere il set di nomi logici limitato e coerente (`'home' | 'archive' | 'settings' | ...`) per evitare proliferazione incontrollata.
   - Se necessario, introdurre varianti di dimensione standard (es. `size={16}` per icone inline, `size={18}` per NavBar, `size={20}` per pulsanti principali) e documentarle brevemente nel wrapper.

3. Garanzie di qualità:

- Dopo le modifiche è stato eseguito:
  - `npm run lint` → OK.
  - `npm run build` → OK.
- Nessun nuovo warning specifico sulle icone.
- L'unico warning rimasto è quello già noto di Vite sul CJS Node API deprecato.

## 6. Sintesi

- Il progetto BARnode Web utilizza ora **lucide-react** come libreria di icone standard, tramite il wrapper `AppIcon`.
- Le icone sono:
  - outline, monocromatiche, professionali.
  - controllate via `currentColor`, integrate con i colori esistenti.
- La NavBar e le principali interazioni (ricerca e rimozione articoli) sono già migrate al nuovo sistema; ulteriori estensioni saranno semplici grazie al wrapper centralizzato.
