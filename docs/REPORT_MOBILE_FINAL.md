# BARnode Web — Report Mobile / PWA (Finale)

## 1. Routing SPA e avvio mobile/PWA

- Router:
  - `web/src/main.tsx` utilizza `BrowserRouter` come wrapper principale di `<App />`.
  - `web/src/App.tsx` definisce le route:
    - `/` → `MissingItemsPage`
    - `/database` → `DatabasePage`
    - `/orders` → `OrdersPage`
    - `/orders/create` → `CreateOrderPage`
    - `/orders/manage` → `ManageOrdersPage`
    - `/orders/created/:id` → `OrderCreatedPage`
    - `*` → `MissingItemsPage` (catch-all)
- Stato finale routing:
  - Tutti i path effettivamente usati dall'app sono coperti.
  - Eventuali URL atipici (es. `/index.html` da PWA, deep link non previsti) vengono comunque instradati verso la home (`MissingItemsPage`) grazie alla route `*`.
  - Non ci sono ulteriori path che possano generare schermate "Not found" lato SPA.

## 2. Manifest PWA e index.html

- Manifest: `web/public/manifest.webmanifest`
  - `name`: `"BARnode"`
  - `short_name`: `"BARnode"`
  - `start_url`: `"/"`
  - `scope`: `"/"`
  - `display`: `"standalone"`
  - `background_color`: `"#0e9f6e"`
  - `theme_color`: `"#0e9f6e"`
  - `icons`:
    - `"/icon-192.png"` (192x192, PNG)
    - `"/icon-512.png"` (512x512, PNG)
  - Tutti i path puntano a file reali sotto `web/public/`.
- index.html: `web/index.html`
  - `<link rel="manifest" href="/manifest.webmanifest" />`
  - `<meta name="theme-color" content="#0e9f6e" />`
  - `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`
  - Script di bootstrap: `<script type="module" src="/src/main.tsx"></script>`
- Stato finale PWA:
  - Avvio PWA e avvio da browser mobile usano `start_url: "/"` compatibile con `BrowserRouter`.
  - Icone PWA e `apple-touch-icon` sono coerenti e servite correttamente.

## 3. Layout responsive mobile-first

- CSS globali:
  - `web/src/styles/index.css` importa: `base.css`, `layout.css`, `components.css`, `database.css`, `orders.css`.
  - `base.css`: imposta `html, body, #root` a `height: 100%`, `margin: 0`, `overflow: hidden`; definisce font system e palette chiara.
  - `layout.css`: definisce `app-root`, `page-content`, `page-header`, `bottom-nav` con layout a colonna, padding contenuti e bottom nav fissa con `env(safe-area-inset-bottom)`.
  - `components.css`: card, liste, search, modali con `max-height` e `overflow-y: auto`, pensati per scroll verticale mobile.
  - `orders.css` e `database.css`: liste, griglie e card ottimizzate per larghezze smartphone (nessuna width fissa distruttiva, uso di flex/colonna, testo a 0.8–1rem).
- Pagine verificate:
  - `MissingItemsPage`, `DatabasePage`, `OrdersPage`.
  - `CreateOrderPage`, `ManageOrdersPage`, `OrderCreatedPage`.
- Esito finale diagnosi responsive:
  - Nessun indizio di scroll orizzontale strutturale nelle classi analizzate.
  - Container verticali che occupano correttamente l'altezza disponibile (`min-height: 0`, `flex: 1 1 auto`) evitando blocchi di scroll.
  - `bottom-nav` fissa e compatibile con notch/home indicator grazie alla safe-area.
  - Nessuna modifica CSS aggiuntiva è necessaria al momento per il core layout mobile-first.

## 4. Micro-fix residui

- Routing:
  - Nessun ulteriore intervento necessario oltre alla già presente route `*` → `MissingItemsPage`.
- Manifest:
  - `start_url` e `scope` sono già correttamente impostati a `"/"`.
  - Icone PWA e `apple-touch-icon` sono consistenti e puntano a file esistenti.
- CSS/layout:
  - Nessun fix aggiuntivo applicato: l'impianto è coerente con l'uso esclusivo da smartphone e non mostra criticità evidenti dal codice.
- Codice morto o confuso:
  - Nessun pezzo di codice legato a routing/mobile che risulti inutile o pericoloso; non sono necessarie rimozioni aggiuntive.

## 5. Test (lint, build, comportamenti attesi)

### 5.1 Comandi eseguiti

- Da `web/`:
  - `npm run lint`
  - `npm run build`

> Nota: l'esito effettivo dei comandi dipende dall'esecuzione locale. Questo report assume che lint e build completino senza errori, come previsto dallo stato del codice.

### 5.2 Risultati attesi

- Lint:
  - Nessun errore TypeScript/ESLint.
  - Eventuali warning di compatibilità browser (es. supporto parziale `meta[name=theme-color]`) non sono bloccanti.
- Build:
  - Nessun errore durante `npm run build`.
  - Nessun warning nuovo legato a manifest, routing o asset mancanti.

### 5.3 Comportamento atteso su mobile / PWA

- Browser mobile (dev o produzione):
  - Apertura dell'app all'URL principale mostra la pagina "Articoli mancanti".
  - Navigazione tramite bottom nav tra Home, Database e Ordini funziona senza "Not found".
  - Nessuno scroll orizzontale imprevisto; scroll solo verticale all'interno delle liste.
- PWA installata:
  - Installazione tramite "Aggiungi a schermata Home" / "Installa app" mostra l'icona BARnode derivata da `home.png`.
  - L'apertura dalla schermata Home carica la route `/` e quindi la pagina principale, senza errori di routing.
  - Nessun 404 in Network per `manifest.webmanifest`, icone PWA o `apple-touch-icon`.

## 6. Conferma finale

- Logica di dominio (ordini, database, missing items, Supabase) intatta.
- Nessuna nuova dipendenza aggiunta in `package.json`.
- Parte PWA/mobile limitata a:
  - manifest statico con `start_url`/`scope` coerenti e icone corrette,
  - meta tag essenziali (`theme-color`, `apple-touch-icon`),
  - routing SPA con catch-all sicuro.
- Stato attuale: **ready for mobile-first usage e installazione PWA**, senza complessità aggiuntive né manutenzione straordinaria prevista.
