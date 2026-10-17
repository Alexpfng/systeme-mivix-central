# MIVIX Foundation — Task 2 : preuve TDD

Ce document conserve la preuve durable du cycle RED → GREEN réalisé pour l’authentification Supabase. Aucun fichier de code produit n’a été modifié pour ajouter cette preuve.

## RED

Commande exécutée avant l’implémentation de `AuthProvider` et `LoginPage` :

```bash
npm test -- --run tests/auth/login-page.test.jsx
```

Résultat observé : échec attendu lors de la résolution de l’import de `AuthProvider`.

```text
❯ tests/auth/login-page.test.jsx (0 test)

FAIL  tests/auth/login-page.test.jsx [ tests/auth/login-page.test.jsx ]
Error: Failed to resolve import "../../src/auth/AuthProvider" from "tests/auth/login-page.test.jsx". Does the file exist?
Plugin: vite:import-analysis
File: /Users/alex/.config/superpowers/worktrees/systeme-mivix-central/mivix-foundation/tests/auth/login-page.test.jsx:17:38
```

## GREEN

Commande ciblée exécutée après l’implémentation minimale :

```bash
npm test -- --run tests/auth/login-page.test.jsx
```

Résultat observé : les 2 tests LoginPage passent.

```text
✓ tests/auth/login-page.test.jsx (2 tests) 47ms

Test Files  1 passed (1)
Tests  2 passed (2)
```

Suite complète exécutée :

```bash
npm test -- --run
```

Résultat observé : 3 tests passent, dont le smoke test existant.

```text
✓ tests/smoke/app-shell.test.jsx (1 test) 10ms
✓ tests/auth/login-page.test.jsx (2 tests) 47ms

Test Files  2 passed (2)
Tests  3 passed (3)
```

Build exécuté :

```bash
npm run build
```

Résultat observé : build Vite réussi.

```text
vite v6.0.5 building for production...
✓ 72 modules transformed.
✓ built in 753ms
```
