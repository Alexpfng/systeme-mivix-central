# MIVIX Foundation — Task 1 : preuve TDD

Ce document conserve la preuve durable du cycle RED → GREEN réalisé pour le smoke test du shell applicatif. Aucun fichier de code produit n’a été modifié pour ajouter cette preuve.

## RED

Commande exécutée :

```bash
npm test -- --run tests/smoke/app-shell.test.jsx
```

Résultat observé : échec attendu, car le shell n’était pas encore implémenté.

```text
❯ tests/smoke/app-shell.test.jsx (0 test)

FAIL  tests/smoke/app-shell.test.jsx [ tests/smoke/app-shell.test.jsx ]
Error: Failed to resolve import "../../src/app/App" from "tests/smoke/app-shell.test.jsx". Does the file exist?
Plugin: vite:import-analysis
File: /Users/alex/.config/superpowers/worktrees/systeme-mivix-central/mivix-foundation/tests/smoke/app-shell.test.jsx:3:16
```

## GREEN

Commande exécutée après l’implémentation minimale du shell :

```bash
npm test -- --run tests/smoke/app-shell.test.jsx && npm run build
```

Résultat observé : smoke test réussi et build Vite réussi.

```text
✓ tests/smoke/app-shell.test.jsx (1 test) 9ms

Test Files  1 passed (1)
Tests  1 passed (1)

vite v6.0.5 building for production...
✓ 26 modules transformed.
✓ built in 341ms
```
