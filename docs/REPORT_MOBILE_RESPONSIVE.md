# BARnode Web — Report Mobile / PWA

## Sezione A — Bug "Not found" su mobile

- Causa individuata: routing SPA basato su `BrowserRouter` senza route catch-all e manifest con `start_url` impostato a `"./"`, che su alcune installazioni PWA porta ad aprire l'app su path non coperti (es. `/index.html`), risultando in "Not found"/schermata vuota.
- File modificati per il fix:
  - `web/public/manifest.webmanifest`
  - `web/src/App.tsx`
- Soluzione applicata (riassunto):
  - `manifest.webmanifest`: `start_url` impostato a `"/"` e aggiunto `"scope": "/"` per allineare il punto di ingresso al routing SPA.
  - `App.tsx`: aggiunta route `*` che mostra la pagina principale (`MissingItemsPage`) per qualunque path non riconosciuto, evitando schermate "Not found" quando l'app viene aperta su URL atipici (es. `/index.html`).

## Sezione B — Diagnosi responsive

- Pagine analizzate:
  - `web/src/pages/MissingItemsPage.tsx`
  - `web/src/pages/OrdersPage.tsx`
  - `web/src/pages/orders/*.tsx` (Create, Manage, Edit, OrderCreated)
  - `web/src/pages/database/*.tsx` (modali gestione articoli, fornitori, tipi)
- CSS/layout analizzati:
  - `web/src/styles/index.css` (importa base, layout, components, database, orders)
  - `web/src/styles/base.css`
  - `web/src/styles/layout.css`
  - `web/src/styles/components.css`
  - `web/src/styles/orders.css`
  - `web/src/styles/database.css`
- Esito diagnosi (sintesi):
  - Struttura già pensata per mobile-first: contenitori a colonna, liste verticali, bottom nav fissa con safe-area, tipografia compatta.
  - Le principali viste usano container con `flex` e scroll verticale dedicato, evitando scroll orizzontale.
  - Nessun overflow orizzontale evidente sulle larghezze tipiche smartphone (320–430px) dai CSS ispezionati.
  - Nessun vincolo desktop-only (es. width fisse troppo grandi) che rompa il layout su mobile.
- Micro-fix applicati lato responsive: al momento nessun cambiamento strutturale ai CSS; la configurazione esistente risulta coerente con l'uso mobile-first. Eventuali ulteriori aggiustamenti verranno fatti in base a feedback reali d'uso.

## Sezione C — Checklist test

### 1. Test in sviluppo

1. Da `web/` eseguire:
   - `npm run dev`
2. Aprire l'app su:
   - Browser desktop con DevTools in modalità device (iPhone/Android).
   - Smartphone reale, puntando all'URL del dev server.
3. Verificare:
   - L'app si apre su una pagina valida (lista "Articoli mancanti") senza "Not found".
   - Navigazione tra Home, Database e Ordini dalla bottom nav funziona correttamente.
   - Nessuno scroll orizzontale imprevisto; lo scroll è solo verticale all'interno delle liste.

### 2. Test PWA / installazione su Home screen

1. In ambiente di build (o dev con HTTPS, se configurato), aprire l'app su Chrome Android.
2. Usare "Installa app" / "Aggiungi a schermata Home".
3. Verificare:
   - L'icona installata è quella di BARnode (derivata da `home.png`).
   - Quando si apre l'app installata, parte sulla pagina principale, senza "Not found".
   - Nessun errore 404 in Network per `manifest.webmanifest` o per le route principali (`/`, `/database`, `/orders`, ecc.).

### 3. Test di build

1. Da `web/` eseguire:
   - `npm run lint`
   - `npm run build`
2. Verificare:
   - Nessun errore TypeScript/ESLint.
   - Nessun errore in fase di build.
   - Nessun warning nuovo collegato a manifest/routing.

## Note finali

- La logica di dominio (ordini, database, missing items, Supabase) non è stata modificata.
- Non sono state aggiunte dipendenze al `package.json`.
- Le modifiche sono limitate a manifest PWA e routing di alto livello per garantire un avvio corretto dell'app su mobile e come PWA.
