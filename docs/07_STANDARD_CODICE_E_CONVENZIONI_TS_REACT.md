# Standard codice e convenzioni React/TypeScript

## Gestione degli event handler

- Button nested in card: `onClick={(e) => { e.stopPropagation(); handler(e, data) }}`
- Async handlers: sempre wrappati in try/finally per cleanup state
- Naming: `handle*` prefix per event handlers

## Hook patterns

### useArticoli
- `articoli[]`: current catalog
- `createArticolo(nome)`: create new article
- `updateArticolo(id, nome)`: update existing
- `deleteArticolo(id)`: delete and cascade (remove from missing_items)
- `searchArticoli(query)`: case-insensitive search

### useMissingItems
- `missingItems[]`: current missing list
- `addMissingItem(articolo)`: add with duplicate check
- `removeMissingItem(id)`: remove from missing
- `isArticoloMissing(id)`: boolean check for conditional renders

## Reusability

- Hooks are used across multiple pages
- `isArticoloMissing()` per render condizionali (es. hide "+" se già present)
- Backup `createAndSaveCurrentSnapshot()` called post-CRUD non-blocking

## Types

- `Articolo`: { id: string; nome: string; created_at?: string }
- `MissingItemWithRelation`: { id: string; articoloId: string; articoloNome: string }

## Performance

- List key props: sempre stabile (articolo.id, item.id)
- Conditional render prima di JSX render
- No inline object/array creation in render
