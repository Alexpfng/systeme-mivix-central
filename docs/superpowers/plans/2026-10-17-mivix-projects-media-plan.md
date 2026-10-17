# MIVIX Projects and Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the transversal Projects widget and a global private media library with batch photo/file imports available to every widget.

**Architecture:** Projects and media use the foundation tables and shared relation layer. A project page owns project-specific notes, tasks and status while media remains globally searchable and can be linked to many entities through `entity_links`.

**Tech Stack:** React, Supabase JS, Supabase Storage, Postgres, Vitest, Testing Library, Playwright.

---

### Task 1: Add project domain types and status transitions

**Files:**
- Create: `src/projects/projectTypes.js`
- Create: `src/projects/projectStatus.js`
- Create: `tests/projects/project-status.test.js`

- [ ] Write tests for all seven statuses and the allowed forward/back transitions.
- [ ] Run `npm test -- --run tests/projects/project-status.test.js` and verify failure.
- [ ] Implement explicit status constants, labels and transition validation.
- [ ] Run the test again and verify PASS.
- [ ] Commit with `git add src/projects tests/projects && git commit -m "feat: define MIVIX project lifecycle"`.

### Task 2: Build the Projects widget and project detail page

**Files:**
- Create: `src/projects/ProjectsWidget.jsx`
- Create: `src/projects/ProjectCard.jsx`
- Create: `src/projects/ProjectPage.jsx`
- Create: `src/projects/projectRepository.js`
- Create: `tests/projects/projects-widget.test.jsx`

- [ ] Write tests for creating a project, displaying its status, and opening its detail page.
- [ ] Verify the tests fail because the components and repository are missing.
- [ ] Implement repository methods for list, create, update and archive using the authenticated owner ID.
- [ ] Implement cards using the current MIVIX rounded layout, geometric accent and warm palette.
- [ ] Add project notes, objectives and task sections without introducing a dense enterprise dashboard.
- [ ] Run `npm test -- --run tests/projects/projects-widget.test.jsx && npm run build` and verify PASS.
- [ ] Commit with `git add src/projects tests/projects && git commit -m "feat: add transversal MIVIX projects"`.

### Task 3: Add shared attachment controls to widget forms

**Files:**
- Create: `src/media/AttachmentPicker.jsx`
- Create: `src/media/AttachmentPreview.jsx`
- Create: `src/content/EntryEditor.jsx`
- Modify: `src/projects/ProjectPage.jsx`
- Create: `tests/media/attachment-picker.test.jsx`

- [ ] Write tests for selecting multiple files, canceling selection, showing previews and preserving the owning entity ID.
- [ ] Verify failure before implementation.
- [ ] Implement a reusable picker accepting `multiple`, `entityType` and `entityId`, with no widget-specific upload logic.
- [ ] Add the picker to existing entry editing and project editing surfaces.
- [ ] Run focused tests and build; verify files are queued but not uploaded until the user confirms save.
- [ ] Commit with `git add src/media src/content src/projects tests/media && git commit -m "feat: make attachments available across widgets"`.

### Task 4: Implement private batch uploads

**Files:**
- Create: `src/media/uploadBatch.js`
- Create: `src/media/mediaRepository.js`
- Create: `src/media/MediaLibrary.jsx`
- Create: `tests/media/upload-batch.test.js`

- [ ] Write tests for a mixed batch, progress callbacks, one failed upload, retrying the failed item, and cancellation.
- [ ] Verify the tests fail before the uploader exists.
- [ ] Implement bounded concurrency, MIME/size validation, private Storage paths under the authenticated user, metadata upserts, and per-file error states.
- [ ] Implement the global gallery with filters for project, universe, contact and file type.
- [ ] Run `npm test -- --run tests/media/upload-batch.test.js && npm run build` and verify PASS.
- [ ] Commit with `git add src/media tests/media && git commit -m "feat: add private batch media uploads"`.

### Task 5: Add relation management and global media search

**Files:**
- Create: `src/relations/entityLinksRepository.js`
- Create: `src/relations/LinkPicker.jsx`
- Create: `src/search/globalSearch.js`
- Create: `tests/relations/entity-links.test.js`
- Create: `tests/search/global-search.test.js`

- [ ] Write tests for linking one media item to multiple entities, unlinking one relation without deleting the file, and searching by title/tag/type.
- [ ] Verify failure before implementation.
- [ ] Implement idempotent links, ownership checks and search queries scoped to the authenticated user.
- [ ] Add link controls to project detail and media detail views.
- [ ] Run focused tests, build and browser checks.
- [ ] Commit with `git add src/relations src/search tests/relations tests/search && git commit -m "feat: connect MIVIX media and content"`.

### Task 6: Verify desktop/mobile UX and deployment

**Files:**
- Create: `tests/e2e/projects-media.spec.js`
- Modify: `README.md`

- [ ] Verify the full flow: sign in, create project, import multiple photos plus a document, attach media to two entities, search, and archive the project.
- [ ] Verify mobile layout, keyboard focus, upload progress and clean console.
- [ ] Run `npm run test:e2e && npm run build`.
- [ ] Commit and push to `main`, then verify the Vercel deployment is `Ready` and the production flow persists data after reload.
