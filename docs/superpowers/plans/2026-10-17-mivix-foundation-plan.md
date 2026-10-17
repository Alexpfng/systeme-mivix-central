# MIVIX Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move MIVIX from local-only persistence to a private Supabase-backed foundation without losing existing local data.

**Architecture:** Keep `MIVIX Central.html` as a fallback during the migration, while introducing a small Vite/React application with focused modules. Supabase Auth handles the single private account; Postgres and private Storage hold structured data and files. RLS is enabled before any authenticated data is exposed.

**Tech Stack:** React 18, Vite, TypeScript, Supabase JS, Supabase Auth, Postgres, Supabase Storage, Vitest, Playwright.

---

### Task 1: Create the application shell and test harness

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Modify: `index.html`
- Create: `src/main.jsx`
- Create: `src/app/App.jsx`
- Create: `tests/smoke/app-shell.test.jsx`

- [ ] **Step 1: Write the failing smoke test**

```jsx
import { render, screen } from '@testing-library/react';
import App from '../../src/app/App';

test('renders the MIVIX shell', () => {
  render(<App />);
  expect(screen.getByText('MIVIX Central')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --run tests/smoke/app-shell.test.jsx`
Expected: FAIL because the new app shell does not exist.

- [ ] **Step 3: Implement the minimal Vite shell**

Create `src/app/App.jsx` with the MIVIX title and an empty content region, then mount it from `src/main.jsx`.

- [ ] **Step 4: Run the test and build**

Run: `npm test -- --run tests/smoke/app-shell.test.jsx && npm run build`
Expected: PASS and a successful `dist` build.

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.js index.html src tests
git commit -m "feat: add modular MIVIX application shell"
```

### Task 2: Add Supabase configuration and authenticated client

**Files:**
- Create: `src/lib/supabase.js`
- Create: `src/auth/AuthProvider.jsx`
- Create: `src/auth/LoginPage.jsx`
- Create: `tests/auth/login-page.test.jsx`
- Create: `.env.example`

- [ ] **Step 1: Write the failing auth test**

Test that a signed-out user sees email, password and submit controls, while a signed-in state renders the application shell.

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `npm test -- --run tests/auth/login-page.test.jsx`
Expected: FAIL because AuthProvider and LoginPage are not implemented.

- [ ] **Step 3: Implement AuthProvider and LoginPage**

Use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the browser. Add password sign-in, sign-out, and password-reset email actions. Do not add a service-role key to `.env.example`.

- [ ] **Step 4: Run auth tests and lint/build**

Run: `npm test -- --run tests/auth/login-page.test.jsx && npm run build`
Expected: PASS and successful build.

- [ ] **Step 5: Commit**

```bash
git add src/auth src/lib/supabase.js tests/auth .env.example
git commit -m "feat: add private Supabase authentication"
```

### Task 3: Add the core schema, RLS and private media bucket

**Files:**
- Create: `supabase/migrations/20261017_mivix_core.sql`
- Create: `tests/database/core-schema.sql`

- [ ] **Step 1: Write the failing schema checks**

The SQL checks must assert that `profiles`, `contacts`, `projects`, `content_items`, `media_assets`, `entity_links`, `astrology_profiles`, and `ai_summaries` exist, RLS is enabled, and the media bucket is private.

- [ ] **Step 2: Run the checks against a local Supabase instance**

Run: `supabase start && supabase db reset`
Expected: the checks fail before the migration is applied.

- [ ] **Step 3: Add the migration**

Create UUID primary keys, `owner_id` columns referencing `auth.users`, timestamps, JSON metadata where needed, foreign keys, indexes for owner and relation lookups, RLS policies using `(select auth.uid())`, and a private `mivix-media` bucket. Storage policies must cover SELECT, INSERT, UPDATE and DELETE for the authenticated owner path.

- [ ] **Step 4: Verify the schema and security**

Run: `supabase db reset && supabase db advisors`
Expected: migration succeeds and no unreviewed RLS or exposed-secret warning remains.

- [ ] **Step 5: Commit**

```bash
git add supabase tests/database
git commit -m "feat: add private MIVIX core schema"
```

### Task 4: Migrate existing localStorage data safely

**Files:**
- Create: `src/migration/legacyStorage.js`
- Create: `src/migration/MigrationDialog.jsx`
- Create: `tests/migration/legacy-storage.test.js`

- [ ] **Step 1: Write failing migration tests**

Cover conversion of existing universe entries into `content_items`, preservation of IDs/titles/types/favorites, idempotency, and a backup export before mutation.

- [ ] **Step 2: Run migration tests and confirm failure**

Run: `npm test -- --run tests/migration/legacy-storage.test.js`
Expected: FAIL because the adapter is missing.

- [ ] **Step 3: Implement the adapter and confirmation dialog**

Read the existing `mivix` localStorage shape, export a timestamped JSON backup, upsert converted records, record a migration marker, and never delete local data automatically.

- [ ] **Step 4: Verify with a fixture and a real browser session**

Run: `npm test -- --run tests/migration/legacy-storage.test.js && npm run build`
Expected: PASS; imported records match the fixture and repeated migration creates no duplicates.

- [ ] **Step 5: Commit**

```bash
git add src/migration tests/migration
git commit -m "feat: migrate existing MIVIX local data safely"
```

### Task 5: Preserve the current visual shell and deploy the foundation

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/app/App.jsx`
- Modify: `README.md`

- [ ] **Step 1: Add visual regression checks**

Use Playwright to assert the cream background, rounded card shell, search control, responsive mobile layout, and no console errors.

- [ ] **Step 2: Implement token and shell parity**

Extract the current tokens and typography from `MIVIX Central.html` without changing the approved palette or geometric compositions.

- [ ] **Step 3: Verify locally**

Run: `npm run build && npm run test:e2e`
Expected: build succeeds, the home shell renders at desktop and mobile widths, and the browser console is clean.

- [ ] **Step 4: Commit and deploy**

```bash
git add src/styles src/app README.md
git commit -m "feat: preserve MIVIX visual shell in modular app"
git push origin main
```

Verify the Vercel deployment reaches `Ready` and the production URL renders the shell before starting the next plan.
