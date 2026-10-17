# Task 4 — preuve TDD

Date : 2026-10-17

## RED

Les tests ont d’abord été écrits dans `tests/migration/legacy-storage.test.js`, `tests/migration/migration-dialog.test.jsx` et l’intégration de `tests/smoke/app-shell.test.jsx`.

- `npm test -- --run tests/migration/legacy-storage.test.js` a échoué car `src/migration/legacyStorage` n’existait pas.
- `npm test -- --run tests/migration/migration-dialog.test.jsx` a échoué car `src/migration/MigrationDialog` n’existait pas.
- L’assertion d’intégration a échoué avant le branchement du dialog dans `App`.

## GREEN

Après implémentation minimale puis corrections guidées par les assertions :

- Tests ciblés migration + shell : **8 tests passés**.
- Suite complète `npm test -- --run` : **6 fichiers, 52 tests passés**.
- `npm run build` : build Vite réussi.
- `git diff --check` : aucune erreur.

## Garanties couvertes

- Conversion des univers et conservation de l’ID, du titre, du type, du favori et des métadonnées.
- Conservation des pièces jointes et références connues dans `metadata`.
- Backup JSON horodaté de la forme legacy brute exporté avant l’upsert distant et l’écriture du marker.
- Idempotence via marker `mivix-content-items-migration-v1`.
- Aucun `removeItem`, `clear` ou vidage automatique du stockage legacy.
- Données invalides et absence de `localStorage` gérées sans exception non contrôlée.
- Confirmation explicite dans `MigrationDialog` avant migration.
