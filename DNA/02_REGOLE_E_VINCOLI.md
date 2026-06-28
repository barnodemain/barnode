# Regole e vincoli non negoziabili

## Sicurezza
- Mai segreti/token/password in chiaro nel codice o nei commit.
- `.env`, `.agent/`, `.mcp.json` sempre in `.gitignore`. Verificare `git status` prima di ogni push.
- RLS attive su tutte le tabelle Supabase con dati. L'app usa la `anon key` (nessun login utente); le scritture passano per le tabelle consentite dalla RLS.

## Deploy
- Un push su `main` = deploy in produzione (autoDeploy Render). Azione ad alto rischio: chiedere conferma.
- Deploy unico per progetto (free tier): frontend statico, nessun backend separato.

## PIN impostazioni
- L'area Settings (import, backup, analysis, note, export) è protetta da PIN numerico: **1909**.
- Sblocco salvato in `sessionStorage` per la sessione corrente.

## Operazioni irreversibili
- Il **consolidamento** (analysis) e il **ripristino backup** sovrascrivono dati in modo non reversibile senza backup precedente. Ogni consolidamento crea uno snapshot prima/dopo; resta operazione delicata.
- Svuotamento/ripristino tabelle `articoli`/`missing_items`: solo con conferma esplicita.

## Governance di lavoro
- Codice = unica fonte di verità; se la doc diverge, vale il codice e si riallinea il DNA.
- Prima di toccare DB, auth, deploy o dati: fermarsi e chiedere conferma.
- Minimo codice necessario; nessuna area non dichiarata.
- Lint pulito (nessun errore) richiesto prima di considerare una modifica completa.
- File piccoli e modulari, niente duplicazione di logica.
- App sempre avviabile e verificabile in locale (porta 5001).
