# Governance, manutenzione e regole di sviluppo

## Standard UX

- Azioni dirette (quick-add, trash, consolidamento) non richiedono modali per velocità
- Duplicate protection: hide non-applicable actions per UX clarity
- Consistenza visiva: spacing e padding allineati tra Home, Archivio e Analysis
- Event handling: `stopPropagation()` su tutti i button nested nelle card
- Mobile-optimized: Radio button e button accessibility per Analysis

## Performance

- Hook `useMissingItems` espone `isArticoloMissing()` per render condizionali efficienti
- List items hanno stable key props (articolo.id)
- Avoided unnecessary re-renders tramite conditional rendering selettivo
- Analysis algorithm: Client-side grouping, no database query optimization needed

## Stability

- Codebase mantiene solo file effettivamente usati
- Unused imports rimossi per ridurre bundle size
- No console warnings o TypeScript errors
- Analysis grouping: Stopwords hardcoded set per performance (non database-driven)

## Linting e qualità codice

- ESLint configurato con preset standard per TypeScript + React
- Script `npm run lint` per eseguire i controlli statici sull'intero progetto
- Possibile usare `npm run lint -- --fix` per applicare automaticamente i fix non breaking
- Lint pulito (nessun errore) richiesto prima di considerare una modifica "completa"

## Safety (Consolidamento)

- Consolidamento non è reversibile senza backup manuale
- Update di articoli → Cascata automatica su missing_items via updateArticolo
- Snapshot backup creato dopo ogni consolidamento
- Transazioni: Ogni consolidamento è atomico (non parziale)
