# Task 5 Preview Security and Keyboard Accessibility Design

## Goal

Make the MIVIX visual preview available only during Vite development, keep production URLs behind the existing Supabase authentication bootstrap, and restore a visible keyboard focus treatment for the search and interactive controls without changing the approved visual shell or `MIVIX Central.html`.

## Behavior

- `isVisualPreview(location, environment)` returns true only when the query parameter is `preview=mivix` and the supplied environment is development.
- Development preview continues to render `VisualShell` without importing Supabase configuration, including when no Supabase environment variables are present.
- A production build treats both `/` and `/?preview=mivix` as normal authenticated routes. The production preview query must not select or import the unauthenticated visual shell.
- The existing Supabase-backed `AuthProvider`/`LoginPage` path remains the normal bootstrap path and is exercised with demo environment values in browser verification.
- `tokens.css` keeps the existing visual tokens and adds a coherent, clearly visible `:focus-visible` treatment for the search control and interactive controls. The style must not depend on removing the browser outline.

## Implementation and tests

Keep the security decision in `src/main.jsx`, make the environment explicit enough to unit-test both dev and production behavior, and add regression tests for the two bootstrap modes. Add a focused CSS contract test for the focus-visible selectors and keyboard browser checks for dev preview, normal production, and production preview. The browser checks must also confirm that the production routes show the auth surface and not the visual shell.

No changes are permitted to `MIVIX Central.html`.

## Verification

Run the complete Vitest suite, `npm run build`, `git diff --check`, and Playwright against the Vite dev server without Supabase env values. Then run the built app through Vite preview with demo Supabase env values and verify `/` and `/?preview=mivix` remain protected. Review the final diff and commit the focused correction.
