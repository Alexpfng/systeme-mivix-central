# MIVIX Composite FK Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the composite-owner RLS regression and database schema contracts prove the referenced columns and `ON DELETE SET NULL` behavior.

**Architecture:** Keep the migration unchanged and strengthen only its static and live contract tests. The RLS fixture will use deterministic UUIDs for cross-owner references so visibility policies cannot hide the adverse key. The SQL and JavaScript validators will compare both local and referenced column ordinals and the delete action.

**Tech Stack:** PostgreSQL pgTAP, Supabase SQL tests, Node.js, Vitest, Vite.

---

### Task 1: Strengthen composite FK static contracts

**Files:**
- Modify: `tests/database/core-schema-contract.test.js`
- Modify: `scripts/validate-core-schema.js`

- [x] Add failing assertions that each composite FK references `(owner_id, id)` and contains `ON DELETE SET NULL`.
- [x] Run the focused contract test and static validator to confirm the assertions exercise the current migration.
- [x] Refactor shared expectations only after the tests are green.

### Task 2: Make the inter-owner RLS regression independent of RLS visibility

**Files:**
- Modify: `supabase/tests/rls_core.sql`

- [x] Replace adverse-owner subqueries with deterministic profile/contact UUIDs supplied by the test fixture.
- [x] Keep existing allow/deny assertions and assert `23503` for owner A referencing owner B's profile/contact composite key.
- [x] Run the database test when Supabase CLI and Docker are available; otherwise capture the exact unavailable dependency output.

### Task 3: Verify all requested commands and commit

**Files:**
- No additional production files.

- [x] Run `npm test -- --run`.
- [x] Run `npm run validate:sql`.
- [x] Run `npm run build`.
- [x] Run `git diff --check` and verify `MIVIX Central.html` is unchanged.
- [x] Run `npm run test:database` and record its exact exit status/output if unavailable.
- [ ] Commit the focused changes with a descriptive message.
