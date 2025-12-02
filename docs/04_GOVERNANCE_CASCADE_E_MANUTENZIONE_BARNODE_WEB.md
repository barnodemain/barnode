# Governance, manutenzione e regole di sviluppo

## Standard UX

- Ogni azione diretta (quick-add) non deve richiedere conferme modali per operazioni non distruttive
- La consistenza visiva tra Home e Archivio è fondamentale - spacing e padding devono essere allineati
- Uso di `event.stopPropagation()` su tutti i pulsanti d'azione nelle carte per evitare conflitti con gestori parent
