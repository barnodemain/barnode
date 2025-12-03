# Linee guida UI/UX

## Spacing e Layout

### Verticale tra elementi
- **Title ↔ Search box**: gap 18px per respiro visivo
- **Search box ↔ First item**: 6px margin-bottom per vicinanza
- **Item cards**: gap 4px per densità compatta
- **Header margin**: 6px bottom per evitare excessive spacing

### Consistenza
- Home, Archivio e Analysis seguono lo stesso pattern
- Scrollable content inizia subito dopo search box
- Back button su Analysis page allineato con logo

### Layout gruppi Analysis

- Ogni gruppo duplicato è mostrato come card a larghezza quasi piena con padding interno
- Header card:
  - Titolo grande: "Possibile gruppo duplicato (X articoli)" in verde scuro
  - Sottotitolo piccolo e in corsivo: parole chiave condivise
  - Icona/pulsante "Ignora" in alto a destra
- Sezione "Articoli trovati":
  - Etichetta in bold
  - Lista verticale di card compatte con checkbox + nome articolo in Title Case
- Sezione "Nome finale":
  - Due radio:
    - "Usa nome esistente" → elenco di nomi tra quelli selezionati, ciascuno selezionabile con radio
    - "Inserisci nuovo nome" → input testo a tutta larghezza con placeholder
- Footer card:
  - Due pulsanti grandi, affiancati, min-height 44px
  - Sinistra: "Consolida" (verde, enabled solo quando input valido)
  - Destra: "Ignora" (grigio chiaro, sempre enabled)

## Icone d'azione

### "+" (Quick-add)
- Colore: verde chiaro (`--color-green-light`)
- Posizione: sinistra del trash icon
- Visibilità: condizionale (nascosto se articolo già in mancanti)
- Non apre modal

### Trash (Delete)
- Colore: rosso (`--color-red`)
- Posizione: destra della card
- Comportamento: sempre visibile, elimina articolo

### Back (Analysis)
- Colore: text default (`--color-text`)
- Posizione: sinistra del logo nella header
- Click: Naviga back a pagina precedente

### Dimensioni
- Tutti i button: 44px × 44px, border-radius 50%
- Gap tra icone: 8px
- Icon size: 22px
- Analysis group buttons: full-width, 40px height, side-by-side layout
  - Consolida: Green (enabled when primary selected)
  - Ignora: Light grey, always enabled

## Colori

- Titolo: `--color-text` (#333)
- Background card: `--color-white`
- Background pagina: `--color-cream`
- Green light: `--color-green-light` (#4a9c3d)
- Green dark: `--color-green-dark` (#2d5a27)
- Red: `--color-red` (#c04a4a)
- Yellow-Amber (Analysis): `--color-yellow-amber` (#f4c430)
- Text su giallo: scuro (`--color-text`)

## Settings Big Buttons

### Stili
- Primary (IMPORTA): verde scuro (`--color-green-dark`)
- Secondary (BACKUP): verde chiaro (`--color-green-light`)
- Tertiary (ANALYSIS): giallo-ambrato (`--color-yellow-amber`) con testo scuro
- Hover: opacity 0.9
- Gap tra icone e testo: 12px
- Font: 18px, weight 600
