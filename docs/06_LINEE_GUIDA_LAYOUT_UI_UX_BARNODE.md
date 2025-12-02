# Linee guida UI/UX

## Spacing e Layout

### Verticale tra elementi
- **Title ↔ Search box**: gap 18px per respiro visivo
- **Search box ↔ First item**: 6px margin-bottom per vicinanza
- **Item cards**: gap 4px per densità compatta
- **Header margin**: 6px bottom per evitare excessive spacing

### Consistenza
- Home e Archivio seguono lo stesso pattern
- Scrollable content inizia subito dopo search box

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

### Dimensioni
- Tutti i button: 44px × 44px, border-radius 50%
- Gap tra icone: 8px
- Icon size: 22px

## Colori

- Titolo: `--color-text` (#333)
- Background card: `--color-white`
- Background pagina: `--color-cream`
- Green light: `--color-green-light` (#4a9c3d)
- Red: `--color-red` (#c04a4a)
