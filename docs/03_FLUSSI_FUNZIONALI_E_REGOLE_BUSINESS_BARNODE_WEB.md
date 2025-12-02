# Flussi funzionali e regole business

## Flusso Quick-Add su Archivio

- Quando l'utente tappa il pulsante "+" su una carta articolo nella pagina Archivio, l'articolo viene aggiunto immediatamente alla lista dei mancanti
- Non viene aperto alcun modal - è un'azione diretta
- Il flusso utilizza il medesimo hook `useMissingItems` già utilizzato nella Home
- La UI rimane consistente: lo spazio verticale tra titolo, ricerca e lista è stato affinato per una migliore leggibilità su dispositivi mobili
