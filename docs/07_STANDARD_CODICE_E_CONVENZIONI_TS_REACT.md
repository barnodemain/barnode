# Standard codice e convenzioni React/TypeScript

## Gestione degli event handler

- Tutti gli event handler su icone nelle carte devono usare `event.stopPropagation()` per evitare che genitore (card click) intercetti l'evento
- Handler quick-add deve essere async per supportare operazioni async su Supabase (es. `addMissingItem`)
- Tipatura: `handleQuickAdd: (e: React.MouseEvent, articolo: Articolo) => Promise<void>`

## Reusability dei hook

- Hook `useMissingItems` è riusabile su qualsiasi pagina per aggiungere/rimuovere dalla lista
- Chiamate a `addMissingItem` devono sempre essere non-blocking per mantenere responsività UI
