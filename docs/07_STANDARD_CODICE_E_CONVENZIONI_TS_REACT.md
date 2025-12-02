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

### Raggruppamento con Fuzzy Matching
- **FONTE DATI:** Solo `articoli`, mai `missing_items`
- Per ogni articolo: estrai keywords non-stopword
- Mappa keyword → Set di article IDs che contengono quel keyword
- Per OGNI keyword: cerca esatta match E fuzzy match
  - Fuzzy: Edit distance Levenshtein ≤ 1 per token ≥ 3 caratteri
  - Esempio: "ipa" vs "tipa" = distanza 1 = raggruppati
- Crea gruppo solo se risulta hanno 2+ DISTINTI articoli
- Deduplicazione: Stesso set di articoli non appare due volte
- Sort per dimensione decrescente
- IMPORTANTE: Un singolo articolo con multiple keywords NON crea gruppo
- **CONSOLIDAMENTO:** Elimina non-primari (via `deleteArticolo`), non rinomina
- **RISULTATO:** Dopo consolidazione, solo 1 articolo rimane → nessun gruppo mostrato

### Normalizzazione Nomi
- Helper: `normalizeArticleName(name: string): string` in `src/lib/normalize.ts`
- Converte: "birra tipa" → "Birra Tipa" (Title Case per ogni word)
- Applica in: Archivio add/edit, Home FAB add, ImportText create, Analysis consolidazione
- Salva: Nome normalizzato in Supabase articoli.nome
- Visualizza: Nome normalizzato in UI
- Regola: Trim, uppercase prima lettera, lowercase resto, collapse spazi multipli

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

## Linting e formattazione

- ESLint configurato con regole standard per JavaScript/TypeScript e React
- Controlli di lint eseguiti tramite `npm run lint`
- Correzioni automatiche applicabili con `npm run lint -- --fix` (senza modificare la logica di business)
- Obiettivo: nessun warning o errore ESLint nei file di produzione
