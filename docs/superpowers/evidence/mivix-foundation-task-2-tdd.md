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

## P1 — RED → GREEN

Après la revue qualité, les tests de régression ont été ajoutés avant les corrections.

Commande RED exacte :

```bash
npm test -- --run tests/auth/login-page.test.jsx tests/auth/supabase-config.test.js
```

Résultats observés avant correction : 6 tests échouent sur 8, avec 3 rejets non gérés.

```text
❯ tests/auth/supabase-config.test.js (2 tests | 2 failed)
❯ tests/auth/login-page.test.jsx (6 tests | 4 failed)

Test Files  2 failed (2)
Tests  6 failed | 2 passed (8)
Errors  3 errors
```

Les erreurs concernaient les rejets de connexion/réinitialisation, les erreurs et rejets de `getSession` qui n’étaient pas affichés et pouvaient laisser le chargement bloqué, ainsi que l’absence de validation de configuration avant `createClient`.

Commande GREEN exacte :

```bash
npm test -- --run tests/auth/login-page.test.jsx tests/auth/supabase-config.test.js
```

Résultat observé après correction : les 8 tests ciblés passent.

```text
✓ tests/auth/supabase-config.test.js (2 tests) 1ms
✓ tests/auth/login-page.test.jsx (6 tests) 64ms

Test Files  2 passed (2)
Tests  8 passed (8)
```

## Validation finale

Suite complète :

```bash
npm test -- --run
```

```text
✓ tests/auth/supabase-config.test.js (2 tests) 2ms
✓ tests/smoke/app-shell.test.jsx (1 test) 9ms
✓ tests/auth/login-page.test.jsx (6 tests) 68ms

Test Files  3 passed (3)
Tests  9 passed (9)
```

Build :

```bash
npm run build
```

```text
vite v6.0.5 building for production...
✓ 73 modules transformed.
✓ built in 576ms
```
