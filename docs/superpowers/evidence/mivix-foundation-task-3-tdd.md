# MIVIX Foundation — Task 3 : preuve TDD

## Migration

Migration vérifiée : `supabase/migrations/20261017111454_mivix_core.sql`.
`entity_links` possède désormais le même contrat de timestamps que les sept
autres tables : `created_at` et `updated_at`, tous deux `timestamptz not null
default now()`.

## RED

Le test de contrat a été ajouté avant la correction de la migration :

```bash
npm test -- --run tests/database/core-schema-contract.test.js
```

Résultat RED observé : 3 assertions échouaient, dont l’absence de
`entity_links.updated_at` et la couverture Storage attendue.

## GREEN / validation reproductible

Le contrat statique est maintenant exécutable depuis le dépôt :

```bash
npm run validate:sql
```

Résultat observé :

```text
Core SQL contract passed: 8 tables, 8 owner references, coherent timestamps, 10 key indexes, RLS, 32 public policies, 4 Storage policies, private bucket.
```

Le test TDD ciblé passe également :

```bash
npm test -- --run tests/database/core-schema-contract.test.js
```

Le script échoue avec une liste explicite si le contrat n’est plus respecté.
Il contrôle notamment :

- les huit `owner_id REFERENCES auth.users(id)` ;
- `created_at` et `updated_at` cohérents sur les huit tables ;
- les dix indexes owner/relation clés ;
- RLS sur les huit tables ;
- les 32 policies publiques et leurs 40 occurrences exactes de
  `(select auth.uid()) = owner_id` ;
- les quatre policies Storage et les cinq expressions couvrant SELECT,
  INSERT, UPDATE `USING`, UPDATE `WITH CHECK` et DELETE ;
- le bucket `mivix-media` privé.

## Vérification SQL complète

Le test d’intégration PostgreSQL reste :

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/database/core-schema.sql
```

Ce fichier vérifie maintenant les huit références owner, les timestamps,
les indexes, RLS, les policies publiques avec l’expression exacte
`(select auth.uid())`, et l’égalité du premier segment Storage avec l’owner
authentifié.

Le lint Supabase est optionnel et dépend de Docker/Colima :

```bash
npx supabase@latest db lint --local --fail-on error
```

S’il est indisponible, relancer avec un Supabase local démarré :

```bash
npx supabase@latest start
npx supabase@latest db reset
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/database/core-schema.sql
npx supabase@latest db lint --local --fail-on error
```

## Commandes finales

```bash
npm test -- --run
npm run validate:sql
npm run build
git diff --check
```

`MIVIX Central.html` n’est pas modifié.
