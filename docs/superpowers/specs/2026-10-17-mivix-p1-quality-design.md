# MIVIX P1 quality hardening design

## Goal

Guarantee that contacts and astrology profiles cannot reference a parent row owned by another authenticated user, and provide executable database behavior tests for public RLS and private Storage ownership.

## Design

The core migration will make `(owner_id, id)` a unique candidate key on `profiles` and `contacts`. The relation columns will then use composite foreign keys carrying the child owner: `contacts(owner_id, profile_id)` references `profiles(owner_id, id)`, and `astrology_profiles(owner_id, contact_id)` references `contacts(owner_id, id)`. Existing `ON DELETE SET NULL` behavior is retained. Composite indexes support the relationship lookups; the owner-only indexes remain for RLS filtering.

The static SQL contract will assert the candidate keys, composite foreign keys, relationship indexes, exact `authenticated` policy roles, and exact owner expressions. A pgTAP suite in `supabase/tests/rls_core.sql` will run after migrations against Supabase local/Postgres. It will create two authenticated users, exercise select/insert/update/delete for the owner and another user on both related tables, verify cross-owner foreign keys are rejected, and exercise Storage paths under each owner prefix.

The package scripts and README will expose `npm run test:database` as the integration entry point. The command will delegate to `supabase db test` and report a distinct environment message when the Supabase CLI or Docker runtime is unavailable; static validation remains independently runnable with `npm run validate:sql`.

## Scope boundaries

Only the foundation SQL, database tests, validation scripts, package documentation, and this design/implementation documentation are changed. `MIVIX Central.html` is not touched.
