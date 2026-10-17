# MIVIX Foundation — Task 3 : preuve TDD

## Migration

La migration a été créée avec la commande demandée :

```bash
npx supabase@latest migration new mivix_core
```

Fichier généré : `supabase/migrations/20261017111454_mivix_core.sql`.

## RED

Le contrat SQL a été écrit avant le contenu de la migration dans :

```text
tests/database/core-schema.sql
```

L’exécution contre Supabase local n’a pas pu atteindre la phase de test, car Docker/Colima n’expose pas son socket :

```text
failed to connect to the docker API at unix:///Users/alex/.colima/default/docker.sock
```

La tentative de démarrer un PostgreSQL temporaire indépendant a également été bloquée : seul le client `psql` et les outils `initdb`/`pg_ctl` sont installés, pas le serveur `postgres`.

## GREEN / validation disponible

La validation statique locale vérifie les huit tables, leurs clés `owner_id` vers `auth.users`, RLS, les 32 policies publiques owner-scoped, les clauses `USING`/`WITH CHECK` des écritures, le bucket privé et les quatre policies Storage nécessaires à l’upsert.

Résultat observé :

```text
Static SQL contract checks passed: 8 tables, 32 public policies, 4 Storage policies, private bucket.
```

La commande de lint Supabase disponible localement a été tentée, mais nécessite le Postgres local lancé par Docker :

```bash
npx supabase@latest db lint --local --fail-on error
```

Résultat : connexion refusée sur `127.0.0.1:54322`, avec recommandation de lancer `supabase start`.

La vérification complète contre Supabase local devra être rejouée lorsque Docker/Colima sera disponible :

```bash
npx supabase@latest start
npx supabase@latest db reset
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/database/core-schema.sql
npx supabase@latest db lint --local --fail-on error
```

## Périmètre vérifié

- `profiles`, `contacts`, `projects`, `content_items`, `media_assets`, `entity_links`, `astrology_profiles`, `ai_summaries` sont privés par ownership `auth.uid()`.
- Les tables publiques ont RLS activé et des policies `TO authenticated` pour SELECT, INSERT, UPDATE et DELETE.
- Les policies UPDATE utilisent `USING` et `WITH CHECK` pour empêcher le transfert d’une ligne vers un autre owner.
- Le bucket `mivix-media` est privé.
- Les policies Storage limitent chaque opération au premier segment du chemin égal à l’`owner_id`, avec SELECT + INSERT + UPDATE pour couvrir l’upsert.
- `MIVIX Central.html` n’a pas été modifié.
