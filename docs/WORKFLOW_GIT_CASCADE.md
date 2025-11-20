# Workflow Git – Cascade

## Frase trigger

- **"esegui commit in github nel main"**

## Cosa deve fare Cascade

Quando riceve la frase trigger, Cascade deve:

1. Verificare di essere nel progetto Barnode.
2. Usare lo script npm:

   ```bash
   npm run commit:main
   ```

3. Lo script `commit:main` esegue:
   - `git status`
   - `git add -A`
   - commit solo se ci sono modifiche con messaggio:
     - `chore: sync from Cascade <timestamp ISO UTC>`
   - `git push origin main`

4. Al termine dell'esecuzione, mostrare in chat:
   - output di `git status` finale,
   - hash e messaggio dell'ultimo commit (`git log -1 --oneline`),
   - eventuali errori di push (permessi, branch protetto, ecc.).

## Note importanti

- Nessun token, password o chiave SSH deve essere creato o gestito da Cascade.
- Viene usata solo la configurazione Git già presente sulla macchina.
- Lo script non crea né modifica branch: lavora sempre su `main`.
- Se non ci sono modifiche, lo script non crea commit e non effettua push.
