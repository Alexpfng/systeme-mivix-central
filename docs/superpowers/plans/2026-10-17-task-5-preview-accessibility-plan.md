# Task 5 Preview Security and Keyboard Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrict the MIVIX visual preview to Vite development, preserve the authenticated production bootstrap, and add visible keyboard focus styles with regression coverage.

**Architecture:** Keep the preview decision in `src/main.jsx`, but make the environment an explicit input so dev and production behavior can be tested independently. Keep the existing Supabase/AuthProvider path unchanged for normal and production-query URLs. Add the focus treatment in `tokens.css`, with a source-level CSS contract test and browser checks for route protection and keyboard visibility.

**Tech Stack:** React 18, Vite 6, Vitest, Testing Library, CSS, Playwright.

---

### Task 1: Lock the preview security contract with failing tests

**Files:**
- Modify: `tests/smoke/preview-bootstrap.test.jsx`
- Create: `tests/smoke/preview-security.test.js`

- [ ] **Step 1: Add the dev/prod decision tests before implementation**

Extend the preview bootstrap test to pass an explicit `{ DEV: true }` environment to the exported preview predicate and assert that `preview=mivix` is accepted in development. Add a security test that imports `isVisualPreview` and asserts both a missing dev flag and `{ DEV: false }` return false for the same URL.

```js
import { isVisualPreview } from '../../src/main';

test('only enables the visual preview in development', () => {
  const location = new URL('http://localhost/?preview=mivix');

  expect(isVisualPreview(location, { DEV: true })).toBe(true);
  expect(isVisualPreview(location, {})).toBe(false);
  expect(isVisualPreview(location, { DEV: false })).toBe(false);
});
```

- [ ] **Step 2: Run the focused tests and verify the expected RED failure**

Run: `npm test -- --run tests/smoke/preview-bootstrap.test.jsx tests/smoke/preview-security.test.js`

Expected: the new security test fails because the current predicate ignores the environment argument and returns true for production-like input.

### Task 2: Implement the minimal production-safe preview gate

**Files:**
- Modify: `src/main.jsx:5-13`

- [ ] **Step 1: Make the predicate environment-aware**

Change the signature to `isVisualPreview(location = window.location, environment = import.meta.env)` and return `Boolean(environment?.DEV) && ...`. Pass `import.meta.env` from `bootstrap` when deciding whether to render `VisualShell`.

```js
export function isVisualPreview(location = window.location, environment = import.meta.env) {
  return Boolean(environment?.DEV)
    && new URLSearchParams(location.search).get('preview') === 'mivix';
}

export async function bootstrap(root, location = window.location) {
  if (isVisualPreview(location, import.meta.env)) {
    // existing preview render
  }
  // existing AuthProvider/LoginPage render
}
```

- [ ] **Step 2: Run the focused tests and verify GREEN**

Run: `npm test -- --run tests/smoke/preview-bootstrap.test.jsx tests/smoke/preview-security.test.js`

Expected: all preview tests pass, including the dev preview that does not load Supabase.

- [ ] **Step 3: Run the full unit suite**

Run: `npm test -- --run`

Expected: all existing and new tests pass with zero failures.

### Task 3: Add the keyboard focus-visible contract

**Files:**
- Modify: `src/styles/tokens.css:45-62`
- Create: `tests/smoke/accessibility-styles.test.js`

- [ ] **Step 1: Write the failing CSS contract test**

Read `src/styles/tokens.css` and assert it contains a `:focus-visible` rule applying to `.mivix-search` and `.mivix-icon-button`, uses an outline, and includes an offset. The test must also assert the existing search input reset remains scoped to `outline: 0` so the parent focus ring is responsible for the visible treatment.

```js
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokens = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

test('defines a visible focus ring for search and icon controls', () => {
  expect(tokens).toMatch(/\.mivix-search:focus-within,\s*\.mivix-search:focus-visible,\s*\.mivix-icon-button:focus-visible/);
  expect(tokens).toMatch(/outline:\s*2px solid var\(--terracotta\)/);
  expect(tokens).toMatch(/outline-offset:\s*3px/);
});
```

- [ ] **Step 2: Run the focused style test and verify RED**

Run: `npm test -- --run tests/smoke/accessibility-styles.test.js`

Expected: FAIL because `tokens.css` currently has no `:focus-visible` rule.

- [ ] **Step 3: Add the minimal DA-consistent focus treatment**

Add a visible terracotta ring with a cream backing so it remains readable around the paper search pill and transparent icon controls. Keep the rule in `tokens.css` and do not remove the existing input reset or alter `MIVIX Central.html`.

```css
.mivix-search:focus-within,
.mivix-search:focus-visible,
.mivix-icon-button:focus-visible {
  outline: 2px solid var(--terracotta);
  outline-offset: 3px;
}
```

- [ ] **Step 4: Run the style test and full suite**

Run: `npm test -- --run tests/smoke/accessibility-styles.test.js tests/smoke/app-shell.test.jsx`

Expected: PASS; then rerun `npm test -- --run` and expect zero failures.

### Task 4: Verify dev and production behavior in real browsers

**Files:**
- Create: `tests/e2e/task-5-preview-accessibility.spec.mjs` (only if the repository’s existing Playwright setup requires a checked-in spec; otherwise use an ephemeral Playwright script outside the repository)

- [ ] **Step 1: Build the app**

Run: `npm run build`

Expected: Vite exits with code 0 and writes `dist/`.

- [ ] **Step 2: Start the dev server without Supabase variables**

Run: `env -u VITE_SUPABASE_URL -u VITE_SUPABASE_PUBLISHABLE_KEY npm run dev -- --host 127.0.0.1`

Use Playwright against `http://127.0.0.1:5173/?preview=mivix` and assert the visual shell heading is visible, no console errors occur, and keyboarding to the search control exposes a non-default visible outline/focus style.

- [ ] **Step 3: Start Vite preview with demo Supabase values**

Run: `VITE_SUPABASE_URL=https://demo.supabase.invalid VITE_SUPABASE_PUBLISHABLE_KEY=demo-publishable-key npm run preview -- --host 127.0.0.1`

Use Playwright against both `http://127.0.0.1:4173/` and `http://127.0.0.1:4173/?preview=mivix`. Assert the login heading/button is visible, the visual shell heading is absent, and no route renders the unauthenticated preview. Also assert the normal route remains the same protected auth surface.

- [ ] **Step 4: Run final static checks**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only the intended source/tests/docs changes are present, and `MIVIX Central.html` is untouched.

### Task 5: Review and commit the correction

**Files:**
- Review: `src/main.jsx`, `src/styles/tokens.css`, `tests/smoke/preview-bootstrap.test.jsx`, `tests/smoke/preview-security.test.js`, `tests/smoke/accessibility-styles.test.js`

- [ ] **Step 1: Inspect the final diff**

Run: `git diff -- src/main.jsx src/styles/tokens.css tests && git diff --name-only`

Confirm the production gate is based on `import.meta.env.DEV`, focus outlines remain present, tests cover dev and production semantics, and `MIVIX Central.html` is not listed.

- [ ] **Step 2: Commit the focused fix**

```bash
git add src/main.jsx src/styles/tokens.css tests/smoke/preview-bootstrap.test.jsx tests/smoke/preview-security.test.js tests/smoke/accessibility-styles.test.js
git commit -m "fix: protect preview in production and restore focus styles"
```
