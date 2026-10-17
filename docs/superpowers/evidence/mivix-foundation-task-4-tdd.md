# Task 4 — preuve TDD

Date : 2026-10-17

## RED

Les tests ont d’abord été étendus dans `tests/migration/legacy-storage.test.js`, `tests/auth/content-items-upsert.test.js`, `tests/smoke/app-shell.test.jsx` et `tests/smoke/app-migration-integration.test.jsx`.

- Le run ciblé a échoué sur les exports absents (`legacyIdToUuid`, `createContentItemsUpsert`), l’absence de refus sans `userId` et la propagation directe de l’erreur Supabase.
- L’assertion d’intégration vérifie le branchement de `userId` et `upsertContentItems` entre `AuthProvider`, `App` et `MigrationDialog`.

## GREEN

Après implémentation minimale puis corrections guidées par les assertions :

- Tests ciblés migration + upsert + shell : **4 fichiers, 13 tests passés**.
- Suite complète `npm test -- --run` : **8 fichiers, 59 tests passés**.
- `npm run build` avec les variables Supabase de test : build Vite réussi.
- `git diff --check` : aucune erreur.

## Garanties couvertes

- Conversion de chaque couple `(univers, id legacy)` en UUID v4 déterministe et stable, compatible avec `content_items.id`.
- Conservation de l’ID original dans `metadata.legacy.id` et documentation de la table de correspondance `idMapping` dans le backup, le résultat et le marker version 2.
- Renseignement de `owner_id` depuis l’utilisateur Supabase authentifié ; refus explicite et aucune mutation distante sans `userId`.
- Upsert réel via `supabase.from('content_items').upsert(rows, { onConflict: 'id' })`, avec remontée des erreurs distantes.
- Conservation des pièces jointes et références connues dans `metadata`.
- Backup JSON horodaté de la forme legacy brute exporté avant l’upsert distant et l’écriture du marker.
- Marker écrit seulement après succès distant ; en cas d’échec du marker, état `marker-failed` signalé et IDs déterministes réutilisables sans doublons.
- Idempotence via marker `mivix-content-items-migration-v1` en version de contenu `2`.
- Aucun `removeItem`, `clear` ou vidage automatique du stockage legacy.
- Données invalides et absence de `localStorage` gérées sans exception non contrôlée.
- Confirmation explicite dans `MigrationDialog` avant migration.
