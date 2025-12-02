# Governance, manutenzione e regole di sviluppo

## Standard UX

- Azioni dirette (quick-add, trash) non richiedono modali per velocità
- Duplicate protection: hide non-applicable actions per UX clarity
- Consistenza visiva: spacing e padding allineati tra Home e Archivio
- Event handling: `stopPropagation()` su tutti i button nested nelle card

## Performance

- Hook `useMissingItems` espone `isArticoloMissing()` per render condizionali efficienti
- List items hanno stable key props (articolo.id)
- Avoided unnecessary re-renders tramite conditional rendering selettivo

## Stability

- Codebase mantiene solo file effettivamente usati
- Unused imports rimossi per ridurre bundle size
- No console warnings o TypeScript errors
