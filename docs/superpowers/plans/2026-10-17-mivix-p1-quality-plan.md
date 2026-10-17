# MIVIX P1 quality hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce owner-preserving composite relations and verify owner-scoped CRUD plus Storage paths against Supabase/Postgres.

**Architecture:** Keep the existing core migration as the source of truth, add composite candidate keys/FKs and supporting indexes, and make the static contract inspect the resulting SQL. Add a pgTAP file under `supabase/tests` for runtime behavior and a small Node wrapper so the integration command distinguishes unavailable Docker/CLI from test failures.

**Tech Stack:** PostgreSQL/Supabase SQL, pgTAP, Supabase CLI, Vitest, Node.js, Vite.

---

### Task 1: Extend the static contract first

**Files:**
- Modify: `tests/database/core-schema-contract.test.js`
- Modify: `tests/database/core-schema.sql`

- [ ] Add failing assertions for composite uniqueness, composite FKs, indexes, exact authenticated roles, and Storage policy role restrictions.
- [ ] Run the focused Vitest contract test and confirm it fails for the missing migration features.
- [ ] Add matching static SQL checks.
- [ ] Run `npm test -- --run tests/database/core-schema-contract.test.js` and confirm it passes after migration changes.

### Task 2: Implement owner-preserving SQL constraints

**Files:**
- Modify: `supabase/migrations/20261017111454_mivix_core.sql`

- [ ] Add `unique (owner_id, id)` to `profiles` and `contacts`.
- [ ] Replace relation FKs with composite owner-carrying FKs and add `contacts_owner_profile_idx` and `astrology_profiles_owner_contact_idx`.
- [ ] Update contract expectations without changing public RLS semantics.
- [ ] Run `npm run validate:sql`.

### Task 3: Add executable pgTAP behavior tests and command

**Files:**
- Create: `supabase/tests/rls_core.sql`
- Create: `scripts/test-database.js`
- Modify: `package.json`
- Modify: `README.md`

- [ ] Add pgTAP CRUD tests for owner/other-owner behavior on `contacts` and `astrology_profiles`, composite FK rejection, and Storage owner paths.
- [ ] Add `npm run test:database` wrapper with explicit unavailable-environment vs failed-test output.
- [ ] Document local Docker prerequisites and the static fallback command.
- [ ] Run the integration command and record environmental failure separately when Docker is unavailable.

### Task 4: Full verification and commit

**Files:**
- Verify: all changed files; `MIVIX Central.html` must remain unchanged.

- [ ] Run `npm test -- --run`, `npm run validate:sql`, `npm run build`, and `git diff --check`.
- [ ] Run `npm run test:database`.
- [ ] Commit all changes with a focused message.
