# BARnode Web — STEP 6 Performance (pre/post code splitting)

## Baseline (PRIMA del code splitting)

- Data/ora snapshot: 26/11/2025
- Comando: `npm run build` eseguito in `web/`
- Tool: Vite v5.4.21
- Risultato build (prima di qualsiasi code splitting esplicito):
  - Moduli trasformati: **141**
  - Bundle JS principale: `dist/assets/index-3Cry44sm.js`
    - Dimensione non compressa: **383.75 kB**
    - gzip: **108.75 kB**
  - CSS principale: `dist/assets/index-DqbuAUWh.css`
    - Dimensione non compressa: **11.04 kB**
    - gzip: **2.49 kB**
  - HTML: `dist/index.html` ≈ 0.40 kB (0.26 kB gzip)
- Warning rilevati:
  - Avviso Vite: "The CJS build of Vite's Node API is deprecated" (warning noto legato a Vite stesso, non al codice dell’app).

Questa sezione rappresenta lo stato di partenza, con import statici per tutte le pagine principali nel router (`App.tsx`).

## Dopo code splitting (DOPO STEP 6.2)

- Data/ora snapshot: 26/11/2025 (dopo introduzione di React.lazy/Suspense nel router `App.tsx`).
- Comando: `npm run build` eseguito in `web/`.
- Tool: Vite v5.4.21.

Risultato build dopo il code splitting delle pagine principali:

- Moduli trasformati: **142** (1 in più rispetto alla baseline, dovuto alla scomposizione in chunk).
- Bundle JS principale:
  - `dist/assets/index-vDrKprsM.js`
    - Dimensione non compressa: **168.73 kB**
    - gzip: **55.14 kB**
- Chunk principali aggiuntivi (lazy):
  - `dist/assets/OrdersPage-DYxZDpsp.js` → ≈ 0.83 kB (0.37 kB gzip)
  - `dist/assets/OrderCreatedPage-BzbyuHPX.js` → ≈ 1.55 kB (0.73 kB gzip)
  - `dist/assets/MissingItemsPage-BXn_t7Vg.js` → ≈ 1.65 kB (0.73 kB gzip)
  - `dist/assets/ManageOrdersPage-DM3X9U6A.js` → ≈ 3.46 kB (1.28 kB gzip)
  - `dist/assets/CreateOrderPage-CBJEp2Gv.js` → ≈ 7.67 kB (2.62 kB gzip)
  - `dist/assets/DatabasePage-3W0c8K99.js` → ≈ 8.63 kB (1.94 kB gzip)
  - Altri chunk condivisi (store/repository/supabase) sono stati separati dal bundle principale:
    - `dist/assets/ordersStore-quMsFc0H.js` → 7.64 kB (2.39 kB gzip)
    - `dist/assets/catalogStore-D4U6BF6U.js` → 2.61 kB (0.93 kB gzip)
    - `dist/assets/catalogRepository-B5s2cFuo.js` → 5.43 kB (1.41 kB gzip)
    - `dist/assets/missingItemsStore-Oy_yIIFg.js` → 2.07 kB (0.91 kB gzip)
    - `dist/assets/supabaseClient-BWVFMSEj.js` → 177.24 kB (46.02 kB gzip)

Confronto sintetico bundle principale:

- **Prima (baseline)**: ~383.75 kB (108.75 kB gzip) in un unico bundle JS principale.
- **Dopo code splitting**:
  - bundle entry principale: ~168.73 kB (55.14 kB gzip),
  - logica per pagine/feature distribuita in chunk separati caricati on-demand.

Warning:

- Rimane invariato l’avviso Vite: "The CJS build of Vite's Node API is deprecated".
- Nessun nuovo warning specifico all’applicazione è stato introdotto.

## Conclusioni STEP 6

- Il code splitting tramite `React.lazy` + `Suspense` in `App.tsx` ha ridotto in modo significativo il **bundle JS iniziale** caricato all’avvio, spostando parte della logica in chunk caricati solo quando l’utente naviga verso le pagine corrispondenti (Orders, Database, Missing Items, ecc.).
- L’impatto atteso è:
  - tempo di primo caricamento migliore per la home (bundle iniziale più leggero),
  - caricamento delle pagine ordini/database spostato al momento della prima visita, con un breve fallback "Caricamento...".
- Lint e build restano completamente puliti (0 errori / 0 warning), e la mappa di route non è stata modificata: tutti i path continuano a puntare alle stesse pagine di prima.
- Prossimi possibili step:
  - Analisi con un bundle analyzer per identificare ulteriori opportunità di split (es. dipendenze terze pesanti).
  - Lazy loading mirato di componenti particolarmente pesanti all’interno delle pagine (es. modali complesse), solo se necessario.
  - Eventuale ottimizzazione delle dipendenze Supabase/SDK se dovessero emergere come fattore dominante nel bundle.
