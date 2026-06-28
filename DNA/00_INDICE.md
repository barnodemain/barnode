# DNA BARnode — Indice

Contesto canonico del progetto. Un agent legge questi file in ordine per operare in sicurezza senza storico chat. Numerazione = priorità di lettura.

| File | Cosa contiene | Quando leggerlo |
|------|---------------|-----------------|
| `00_INDICE.md` | Questo indice | Sempre per primo |
| `01_STATO_E_INFRASTRUTTURA.md` | Repo, deploy Render, Supabase, branch, URL, allineamento servizi | **Indispensabile** prima di toccare deploy/DB/Git |
| `02_REGOLE_E_VINCOLI.md` | Regole non negoziabili, sicurezza, PIN, governance operativa | **Indispensabile** prima di modificare |
| `03_ARCHITETTURA_E_DATI.md` | Schema DB, RPC, backup singleton, routing, hook principali | Prima di lavorare su dati o pagine |
| `04_FLUSSI_E_DOMINIO.md` | Flussi funzionali e regole business (quick-add, analysis, note, export) | Quando si tocca una feature |
| `05_UI_UX.md` | Spacing, colori, icone, convenzioni layout mobile-first | Quando si tocca la UI |

**Regola base:** il **codice è la fonte di verità**. Se il DNA diverge dal codice, vale il codice e il DNA va riallineato.

**Riferimento operativo principale:** `CLAUDE.md` nella root (standard enterprise, scaricato da App Control).
