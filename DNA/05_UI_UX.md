# UI / UX

Mobile-first. Riferimenti che non si ricavano dal solo codice.

## Spacing (verticale)
- Titolo ↔ search box: 18px · search box ↔ primo item: 6px · gap tra card: 4px · header margin-bottom: 6px.
- Home, Archivio e Analysis seguono lo stesso pattern; lo scroll inizia subito dopo la search box.

## Icone d'azione
- Tutti i button azione: 44×44px, border-radius 50%, icon 22px, gap 8px.
- "+" quick-add: verde chiaro, a sinistra del trash, condizionale (nascosto se già nei mancanti), non apre modal.
- Trash: rosso, a destra, sempre visibile.
- Back (Analysis): colore testo, a sinistra del logo.

## Colori (CSS vars)
- `--color-text` #333 · `--color-cream` (sfondo pagina) · `--color-white` (card)
- `--color-green-light` #4a9c3d · `--color-green-dark` #2d5a27
- `--color-red` #c04a4a · `--color-yellow-amber` #f4c430 (Analysis, testo scuro)
- **Archivio** ha sfondo dedicato più scuro `#e6e3c3` (classe `.page-wrapper-archivio`, wrapper+header); le altre pagine restano `--color-cream`.

## Settings — big buttons
- IMPORTA: verde scuro · BACKUP: verde chiaro · ANALYSIS: giallo-ambrato (testo scuro).
- Standard touch-friendly: `min-height 56px`, padding 16px, radius 12px, **width 84% centrati** (`align-items:center` sul contenitore), gap tra pulsanti 8px. Font 16px weight 600, icona 22px, gap icona-testo 12px.

## Analysis — card gruppo
- Header: titolo "Possibile gruppo duplicato (X articoli)" verde scuro + sottotitolo corsivo con keyword condivise + "Ignora" in alto a destra.
- "Articoli trovati": card compatte con checkbox + nome in Title Case.
- "Nome finale": radio "Usa nome esistente" / "Inserisci nuovo nome" (input full-width).
- Footer: "Consolida" (verde, abilitato solo con input valido) e "Ignora" (grigio, sempre attivo), min-height 44px.

## Convenzioni codice UI (da rispettare)
- Button nested in card: `onClick={(e) => { e.stopPropagation(); handler(...) }}`.
- Async handler in try/finally per cleanup stato; prefisso `handle*`.
- Key di lista sempre stabili (`articolo.id` / `item.id`); niente oggetti/array inline nel render.

## Safe-area (PWA installata)
- `index.html` ha `viewport-fit=cover`. `.page-header-fixed` usa `env(safe-area-inset-top)` e `.bottom-nav` usa `env(safe-area-inset-bottom)` per non finire sotto notch/gesture-bar in modalità installata. Su desktop/browser questi valgono 0 (nessun effetto).
