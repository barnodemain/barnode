# BARnode — Backup Policy

Questa policy definisce come gestire i backup locali del repository BARnode dopo la migrazione a sola web app.

## Obiettivi

- Garantire sempre un punto di ripristino completo e sicuro.
- Evitare crescita incontrollata dello spazio disco occupato dai backup.

## Numero di backup da mantenere localmente

- Mantenere **gli ultimi 3 backup generali** generati dallo script `scripts/backup_barnode.sh`.
- Mantenere **sempre** il backup speciale di pre-rimozione Expo:
  - `backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz`

In pratica, nella cartella `backup/` devono essere presenti:

- `Backup_ExpoPreRemoval_20251126_0216.tar.gz` (sempre).
- Gli ultimi 3 backup più recenti creati dallo script standard.

## Regole di rotazione consigliate

1. Quando viene creato un nuovo backup tramite `scripts/backup_barnode.sh`:
   - Verificare il contenuto di `backup/`.
   - Se il numero di backup generali supera 3, eliminare manualmente quelli più vecchi, **escludendo sempre** `Backup_ExpoPreRemoval_20251126_0216.tar.gz`.

2. Se si creano backup manuali aggiuntivi (es. tar personalizzati):
   - Valutare se vanno considerati “generali” (soggetti a rotazione) o “speciali” (da preservare).
   - In generale, i backup speciali dovrebbero avere un nome descrittivo e andrebbero mantenuti o spostati su storage esterno.

## Preservazione del backup pre-rimozione Expo

Il file:

- `backup/Backup_ExpoPreRemoval_20251126_0216.tar.gz`

rappresenta lo snapshot completo del repository (senza `node_modules` e `.git`) immediatamente prima della rimozione definitiva della parte Expo/React Native.

Regola:

- **Non deve mai essere eliminato** come parte della rotazione standard.
- In caso di migrazione o archiviazione del progetto, questo file va copiato su uno storage sicuro di lungo periodo.

## Suggerimento: storage esterno

Per evitare che la cartella `backup/` cresca troppo:

- È consigliato spostare periodicamente i backup più vecchi su:
  - storage cloud (es. S3, Google Drive, ecc.), oppure
  - disco esterno/volume di archiviazione.

Dopo la copia verificata, è possibile eliminare localmente i backup più datati, mantenendo comunque:

- `Backup_ExpoPreRemoval_20251126_0216.tar.gz`.
- Gli ultimi 3 backup generali più recenti.
