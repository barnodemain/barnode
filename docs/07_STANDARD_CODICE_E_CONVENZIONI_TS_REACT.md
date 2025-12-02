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

## Analysis Algorithm (Fixed)

### Normalizzazione
- Lowercase tutti i nomi
- Remove accenti tramite `normalize('NFD')`
- Split per whitespace
- Filter: length > 2, not pure numbers, not stopwords

### Filtraggio Stopwords
- Set hardcoded di ~45 stopwords comuni (vodka, rum, gin, di, al, con, mini, size, ml, cc, etc.)
- Case-insensitive matching
- Rimozione prima di raggruppamento

### Raggruppamento (CORRETTO)
- Per ogni articolo: estrai keywords non-stopword
- Mappa keyword → Set di article IDs che contengono quel keyword
- Per OGNI articolo, trova tutti gli articoli che condividono almeno UN keyword
- Crea gruppo solo se risulta hanno 2+ DISTINTI articoli
- Deduplicazione: Stesso set di articoli non appare due volte
- Sort per dimensione decrescente
- IMPORTANTE: Un singolo articolo con multiple keywords NON crea gruppo

## Reusability

- Hooks are used across multiple pages
- `isArticoloMissing()` per render condizionali (es. hide "+" se già present)
- Backup `createAndSaveCurrentSnapshot()` called post-CRUD non-blocking
- Analysis component standalone, importabile in future features

## Types

- `Articolo`: { id: string; nome: string; created_at?: string }
- `MissingItemWithRelation`: { id: string; articoloId: string; articoloNome: string }
- `ArticleGroup`: { keyword: string; articles: Articolo[] }

## Performance

- List key props: sempre stabile (articolo.id, item.id)
- Conditional render prima di JSX render
- No inline object/array creation in render
- Analysis useMemo() per memoizzare grouping computation
