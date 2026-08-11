# Todo App

A local-first todo application built with Next.js and SQLite. Runs entirely on your machine — no accounts, no deployment, no external services.

## Third-Party Code

- **next** — application framework; provides file-based routing and Server Actions, which let forms call server-side database code directly without writing a separate API layer.
- **better-sqlite3** — synchronous SQLite driver. Chosen over an async driver because a local single-user app has no need for concurrent database access, and synchronous calls keep the code simpler.
- **vitest** — unit test runner. Fast startup and native TypeScript/ESM support with no extra configuration needed.
- **@playwright/test** — end-to-end test runner. Drives a real browser against the running app, covering interactions (creating, editing, archiving tasks) that unit tests can't verify on their own.

## Database Design

A single `tasks` table stores all task data:

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK, autoincrement) | Unique task identifier |
| `title` | TEXT, required | |
| `description` | TEXT | Optional |
| `due_date` | TEXT, required | ISO date (`YYYY-MM-DD`) |
| `topic` | TEXT, required | |
| `status` | TEXT, required | Constrained by `CHECK` to `'todo'`, `'in-progress'`, or `'complete'` — fixed, not user-editable |
| `archived_at` | TEXT, nullable | `NULL` = active task. A timestamp = archived. Tasks are never deleted — archiving only sets this column. |
| `created_at` | TEXT | Set automatically on insert |
| `updated_at` | TEXT | Bumped on every edit |

**Key design decisions:**
- **Archiving, not deleting:** `archived_at` is the only thing that changes when a task is archived. The row stays in the table permanently, so archived tasks remain viewable via a separate query (`WHERE archived_at IS NOT NULL`).
- **Overdue is never stored:** there is no `overdue` column or status. It's computed at read time — for the UI, from `due_date` and `status` (`lib/overdue.ts`); for the summary counts, with an equivalent SQL comparison (`lib/tasks.ts`). A task is overdue if its due date has passed and its status isn't `complete`.
- **Status is enforced at the database level**, not just the UI, via the `CHECK` constraint — so even a direct database write can't set an invalid status.

## Running It

**Node version:** v22 LTS

1. Clone the repository:
   ```bash
   git clone https://github.com/Alex-Gitee/To-Do-App.git
   cd To-Do-App
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright's browser binaries (required once, for end-to-end tests):
   ```bash
   npx playwright install
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:3000`

The database file is created automatically on first run at `data/tasks.sqlite`. Stopping and restarting the app preserves all data, since it's a real file on disk.

### Running Tests

Unit tests (Vitest — tests database logic and the overdue rule directly, using an in-memory database):
```bash
npm test
```

End-to-end tests (Playwright — drives a real browser against the app, using a separate throwaway database at `data/e2e-test.sqlite` so your own task data is never touched):
```bash
npm run test:e2e
```

Run both:
```bash
npm run test:all
```

### Troubleshooting: `npm install` fails with a `node-gyp` / Visual Studio error

`better-sqlite3` includes a native component that normally installs from a prebuilt binary with no extra steps. On some Windows machines, npm instead falls back to compiling it from source, which requires a C++ build toolchain that isn't installed by default. If you see an error mentioning `node-gyp rebuild` and `Could not find any Visual Studio installation`:

1. Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. In the installer, select the **"Desktop development with C++"** workload
3. Once installed, close and reopen your terminal (required for the new tools to be detected)
4. Re-run `npm install`

## A Note on `npm audit`

A clean install currently reports 3 high-severity advisories, all originating from `postcss` and `sharp` — internal dependencies bundled inside `next` itself (used for Tailwind's CSS processing and Next's image optimization pipeline), not packages this project depends on directly.

These were reviewed and deliberately left unpatched:

- The available fix (`npm audit fix --force`) forces an upgrade to a `next` version outside this project's tested range, risking breaking changes for no corresponding benefit here.
- Every advisory describes an attack surface — untrusted CSS/image input reaching a browser, or a server exposed to the internet — that doesn't apply to this application. It runs entirely on `localhost`, for a single local user, with no user-supplied images or externally hosted CSS ever processed at runtime.

This is a considered risk trade-off, not an oversight: patching would introduce real instability to fix a vulnerability class this app's local-only, single-user design isn't exposed to.