# AI Usage Transcript — COMS3011A Lab 1: Todo App

**Tool used:** Claude (Anthropic), claude.ai web interface
**Model:** Claude Sonnet 5
**Scope:** Planning, code generation, and debugging across the full project — Next.js/SQLite setup, feature implementation, styling, testing (Vitest + Playwright), and documentation.

This transcript is presented as a condensed but complete record of the working conversation, preserving the sequence of requests, guidance given, and — per the rubric's AI Usage criteria — the specific points where output was corrected, rejected, or redirected.

---

## 1. Planning

**Prompt:** Uploaded the lab brief and asked how to approach completing it.

Claude broke the brief down into a concrete stack decision (Next.js App Router + Server Actions, `better-sqlite3`, Vitest) and a schema design mapped directly to the brief's constraints: a single `tasks` table with a nullable `archived_at` timestamp (so archiving never deletes data), a `status` column restricted via a `CHECK` constraint to `'todo' | 'in-progress' | 'complete'`, and no stored `overdue` field — overdue is computed at read time from `due_date` and `status`. Claude also proposed a commit-slicing plan (scaffold → schema → create → list → edit → archive → sort → overdue → tests → docs) to satisfy the commit-history rubric criterion, and flagged which "extra features" would be safe additions versus which would violate the brief's fixed rules (e.g. never add a 4th status, never actually delete a task).

**Follow-up:** Asked for a full step-by-step walkthrough assuming minimal prior knowledge of Next.js, SQLite, Git, or testing. Claude produced an ordered guide from `git init` through documentation, explaining concepts (what a commit is, what SQLite is, what a Server Action is) at the point each became necessary rather than as an upfront dump.

---

## 2. Code generation — core setup

- Scaffolded a Next.js app (TypeScript, App Router, Tailwind) and initialized/linked a GitHub repository.
- Generated the `tasks` table schema, first inline as a separate `db/schema.sql` file, **then simplified to an inline schema string inside `lib/db.ts` after comparing both approaches** — see Correction #1 below.
- Generated `lib/tasks.ts` query functions (`createTask`, `getTasks` with parameterized sort column, `updateTask`, `archiveTask`, `getArchivedTasks`, `getTaskCounts`).
- Generated Server Actions (`app/actions.ts`) for create, edit, and archive, wired to forms in `app/page.tsx`, `app/tasks/[id]/edit/page.tsx`, and `app/archived/page.tsx`.
- Generated the overdue-flag and relative due-date-label logic, later extracted into `lib/overdue.ts` so it could be unit tested directly rather than living inline in a page component.
- Generated a full visual redesign (index-card aesthetic: custom color tokens, Space Mono + Source Serif 4 fonts, per-topic tab coloring) after being asked "how would I make it look pretty."
- Generated extra features on request: task counts, empty states, a two-step inline archive confirmation (replacing an initial native `confirm()` suggestion — see Correction #3), and relative due-date labels ("in 3 days" / "2 days overdue").
- Generated a Vitest unit test suite (`tests/tasks.test.ts`) covering task creation, the `CHECK` constraint rejecting invalid statuses, editing, archiving without deletion, all three sort orders, and overdue derivation edge cases (in-progress + past-due still overdue; complete + past-due not overdue).
- Generated a Playwright end-to-end suite (`e2e/tasks.spec.ts`) covering creation, editing with reload persistence, archive confirmation (including cancel), sorting, the overdue visual flag, and the empty state — configured against a separate throwaway database (`DB_PATH` env var) so tests never touch the developer's real data.

---

## 3. Debugging (with corrections)

Real issues hit during development, worked through in sequence:

1. **GitHub repository setup failures** — a sequence of a 404 (repo never actually created), a `push` `refspec main does not match` error (renamed branch), a `Repository not found` 404 (wrong account referenced in the remote URL), and finally a `403 Permission denied` that revealed the terminal was authenticated as a different GitHub account than the one the repo was created under. Resolved by identifying the actual authenticated account and creating/targeting the repo consistently.
2. **Next.js breaking API change** — `searchParams` and dynamic route `params` became `Promise`-based in the installed Next.js version, causing a runtime error (`searchParams is a Promise and must be unwrapped with await`). Fixed by making the relevant page components `async` and awaiting the params.
3. **Server Action argument mismatch** — `archiveTaskAction` was written expecting a plain `id: number` argument, but the calling `<form action={...}>` actually invokes a directly-bound Server Action with a `FormData` object, not the named parameter. This produced `TypeError: SQLite3 can only bind numbers, strings, bigints, buffers, and null`. Fixed by reading `formData.get('id')` inside the action instead.
4. **CSS custom property naming collision** — a font-loading fix introduced `--font-mono: var(--font-mono)`, a circular self-reference caused by reusing the same CSS variable name in both `next/font`'s output and Tailwind's `@theme` block, silently breaking custom fonts with no visible error. Diagnosed and fixed by renaming the raw font variables (`--font-space-mono`, `--font-source-serif`) so they no longer collided with Tailwind's theme token names.
5. **Vitest/Playwright test-runner conflict** — Vitest attempted to execute Playwright's `e2e/tasks.spec.ts` file directly, throwing `Playwright Test did not expect test() to be called here`. Fixed with a `vitest.config.ts` excluding the `e2e/` directory from Vitest's test discovery.
6. **Windows file-locking during clean-clone verification** — repeated `EPERM: operation not permitted` errors when re-cloning and reinstalling a verification copy of the repo, traced first to a hypothesis of a stray `node` process (ruled out — none running), then correctly diagnosed as OneDrive actively syncing the project folder. Resolved by relocating the verification clone outside the OneDrive-synced user profile path.
7. **Native dependency build failure** — `better-sqlite3` failed to install via `npm install` with a `node-gyp rebuild` error, tracing to a missing Visual Studio C++ build toolchain on Windows (no prebuilt binary was being resolved for the installed Node version). Diagnosed the underlying Node engine mismatch first (`better-sqlite3` required Node ≥22; the project was initially set up on a non-LTS Node 24, then briefly on Node 20), settled on Node 22 LTS as the correct target, and separately addressed the build-tools gap with a documented Visual Studio Build Tools installation, including adding a troubleshooting section to the README so the same failure wouldn't block a marker's clean-clone attempt.

---

## Corrections and rejections of AI output (explicit examples)

- **Correction #1 — schema file structure.** Claude's first suggestion was a separate `db/schema.sql` file read via `fs.readFileSync` at startup. After reviewing both options side by side, this was rejected in favor of an inline schema string directly in `lib/db.ts` — a deliberate simplification to reduce moving parts, made after weighing the tradeoff rather than accepting the first suggestion.
- **Correction #2 — ambiguous test locator.** A Playwright test Claude generated used `taskRow.getByText('Overdue')` to check for the overdue badge. Once a separate due-date-label feature was added (rendering text like "2 days overdue"), this locator became ambiguous and the test failed with a Playwright "strict mode violation" (matched two elements). Diagnosed the cause and corrected it to `getByText('Overdue', { exact: true })`.
- **Correction #3 — archive confirmation UX.** Claude's first implementation used the browser's native `confirm()` dialog to confirm archiving. This was rejected as visually inconsistent with the app's custom design (a native OS dialog breaking the styled index-card aesthetic), and replaced with a custom two-step inline confirmation built with React state (`useState`) instead.
- **Correction #4 — declined a suggested dependency "fix."** `npm audit` reported 3 high-severity advisories in transitive dependencies of `next` (via `postcss` and `sharp`). The available automated fix (`npm audit fix --force`) would have force-upgraded `next` outside its tested version range. After evaluating the actual advisories (all describing exposure scenarios — untrusted CSS/images reaching a public-facing server — that don't apply to a local-only, single-user app), the fix was deliberately **not** applied, and the reasoning was documented directly in the README rather than followed blindly.

---

*This transcript summarizes and condenses the full working conversation for readability. The complete, unedited chat log is available on request / attached separately if required by the marker.*