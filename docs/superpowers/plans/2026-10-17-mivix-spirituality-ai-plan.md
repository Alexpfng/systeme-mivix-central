# MIVIX Spirituality and AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Spiritualité branch with a primary astrology profile, on-demand close-person links, and secure AI summaries.

**Architecture:** Spirituality reuses contacts, media and entity links from the foundation. Astrology records store structured values plus imported chart images. AI requests pass through a server-side function and persist editable results in `ai_summaries`.

**Tech Stack:** React, Supabase JS, Supabase Edge Functions, Postgres, Storage, Gemini-compatible provider, Vitest, Playwright.

---

### Task 1: Add astrology profile domain model

**Files:**
- Create: `src/spirituality/astrologyTypes.js`
- Create: `src/spirituality/astrologyRepository.js`
- Create: `tests/spirituality/astrology-profile.test.js`

- [ ] Write tests for a primary profile, a close-person profile, optional birth data, chart image references and editable interpretations.
- [ ] Verify failure before implementation.
- [ ] Implement validated profile payloads and repository methods scoped to the authenticated user.
- [ ] Run `npm test -- --run tests/spirituality/astrology-profile.test.js` and verify PASS.
- [ ] Commit with `git add src/spirituality tests/spirituality && git commit -m "feat: add astrology profile domain"`.

### Task 2: Build the Spiritualité widget and celestial visual branch

**Files:**
- Create: `src/spirituality/SpiritualityWidget.jsx`
- Create: `src/spirituality/AstrologyProfilePage.jsx`
- Create: `src/spirituality/CelestialGlyph.jsx`
- Modify: `src/styles/tokens.css`
- Create: `tests/spirituality/spirituality-widget.test.jsx`

- [ ] Write tests for showing the user's profile first, listing close profiles only when present, and opening a profile detail view.
- [ ] Verify failure before implementation.
- [ ] Implement the widget with the approved MIVIX card grammar and a celestial palette limited to soft navy, prune, lavender, astral rose and gold.
- [ ] Add chart image attachments and structured fields for signs, houses, aspects and angles.
- [ ] Add copy that frames astrology as personal interpretation and reflection.
- [ ] Run focused tests and build; verify no existing universe styles regress.
- [ ] Commit with `git add src/spirituality src/styles tests/spirituality && git commit -m "feat: add MIVIX spirituality widget"`.

### Task 3: Add explicit profile and project links

**Files:**
- Modify: `src/relations/LinkPicker.jsx`
- Create: `src/spirituality/ProfileLinkPanel.jsx`
- Create: `tests/spirituality/profile-links.test.jsx`

- [ ] Write tests for linking a close profile to a project or media item only after confirmation, and for removing the link without deleting either record.
- [ ] Verify failure before implementation.
- [ ] Implement an explicit link panel with readable relationship labels and no automatic sharing.
- [ ] Run focused tests and build.
- [ ] Commit with `git add src/relations src/spirituality tests/spirituality && git commit -m "feat: add explicit spirituality relationships"`.

### Task 4: Add the secure AI summary function

**Files:**
- Create: `supabase/functions/ai-summarize/index.ts`
- Create: `src/ai/aiSummaryRepository.js`
- Create: `src/ai/SummaryAction.jsx`
- Create: `tests/ai/summary-action.test.jsx`

- [ ] Write tests for manual action only, loading/error states, persisted result display and editable summary text.
- [ ] Verify failure before implementation.
- [ ] Implement an Edge Function that validates the authenticated user, accepts only selected content IDs and an explicit action (`summarize`, `analyze`, `compare`), fetches authorized source content, calls the configured provider, and returns a bounded result.
- [ ] Store provider name, source IDs, action, timestamps and generated text in `ai_summaries`.
- [ ] Keep provider credentials server-side and use an adapter so Gemini can be replaced without changing UI code.
- [ ] Run focused tests with a stub provider and verify no secret appears in client bundles.
- [ ] Commit with `git add supabase/functions src/ai tests/ai && git commit -m "feat: add on-demand secure AI summaries"`.

### Task 5: Add summaries to Projects, Spiritualité and media selection

**Files:**
- Modify: `src/projects/ProjectPage.jsx`
- Modify: `src/spirituality/AstrologyProfilePage.jsx`
- Modify: `src/media/MediaLibrary.jsx`
- Create: `tests/ai/summary-integration.test.jsx`

- [ ] Write tests for a project summary, an astrology-profile summary and a selected-media summary.
- [ ] Verify failure before integration.
- [ ] Add the same explicit action component to each surface with context-specific labels and no automatic invocation on upload or save.
- [ ] Show summaries as editable cards marked “Généré par IA”.
- [ ] Run focused tests, build and browser checks.
- [ ] Commit with `git add src/projects src/spirituality src/media tests/ai && git commit -m "feat: expose AI summaries across MIVIX"`.

### Task 6: Verify safety, responsive experience and production deployment

**Files:**
- Create: `tests/e2e/spirituality-ai.spec.js`
- Modify: `README.md`

- [ ] Verify sign-in, create primary astrology profile, add a close profile, import a chart image, explicitly link it to a project, request a summary, edit the result and reload.
- [ ] Verify no AI call occurs after a normal upload, no unauthorized profile or media is visible, and no secret is present in browser logs or bundles.
- [ ] Run `npm run test:e2e && npm run build`.
- [ ] Commit and push to `main`, then verify Vercel is `Ready` and validate the production flow on desktop and mobile.
