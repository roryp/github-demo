# Demo

A tiny Express + TypeScript app used as a sample codebase for demonstrating the "Flight Deck" app.

## Stack
- Node.js 20+
- Express 4 + TypeScript
- Zod for request validation
- Vitest + Supertest for tests
- Vanilla HTML/CSS/JS frontend served from `public/`

## Running

```bash
npm install
npm run dev    # http://localhost:3000
npm test
npm run docs:api   # regenerate openapi.json from the zod schemas
```

Sign in with `ada@example.com` / `password`.

API docs are served at [http://localhost:3000/docs](http://localhost:3000/docs)
when the dev server is running.

## Layout

```
src/
  server.ts            # Express app factory + entrypoint
  routes/
    auth.ts            # POST /api/auth/login
    users.ts           # GET /api/users, /api/users/:id
  services/
    UserService.ts     # business logic (owns its deps - see issue #5)
    db.ts              # in-memory user store
    emailSender.ts     # noop email sender
  middleware/          # (rate limiting will live here - see issue #3)
public/                # static frontend (header, login, dashboard)
tests/
  login.spec.ts        # currently flaky - see issue #2
```

## Demo guide

Five issues are pre-filed, each chosen to highlight a specific capability of
Flight Deck. They can be walked through in order for a full end-to-end
story, or used individually to demonstrate a single capability.

Issue #1 is the suggested end-to-end flow (issue -> session -> diff -> PR ->
merge). The other four are designed to be staged in different session
states so the Inbox shows a realistic mix of work in progress.

### Issue #1 - Add dark mode toggle to the app header
**Showcases:** Issue -> session -> diff -> PR -> merge, all in one surface.
**Suggested mode:** Autopilot.

1. From the Inbox, open issue #1 and start a new session.
2. Note the auto-generated branch (`add-dark-mode-toggle`) and isolated workspace.
3. Run the session in **Autopilot**. The agent should edit
   `public/styles.css`, add a `ThemeToggle` to each HTML page, and persist
   the choice in `localStorage`.
4. Open the **Diff** tab and scroll through the changes.
5. In the live preview, click the toggle to flip the app from light to
   dark.
6. Create the pull request, wait for checks, and merge.
7. Issue #1 closes automatically in the Inbox.

### Issue #2 - Fix flaky login test in CI
**Showcases:** Plan mode - the agent explains its approach before
changing code.
**Suggested mode:** Plan.

1. Open issue #2 and start a session in **Plan** mode.
2. The agent produces a plan that should identify the `setTimeout` race in
   `tests/login.spec.ts` and propose awaiting the response instead.
3. Review the plan, then approve it.
4. The agent rewrites the test; `npm test` stays green without arbitrary
   waits.

Staging tip: pause on the plan review step to use this session as a
"Plan mode" tile when showing multiple sessions side by side.

### Issue #3 - Add rate limiting middleware to the public API
**Showcases:** Multi-file backend changes and test coverage.
**Suggested mode:** Autopilot.

1. Open issue #3 and start a session in **Autopilot**.
2. The agent creates `src/middleware/rateLimit.ts`, wires it into
   `src/server.ts`, adds per-route overrides, and writes unit tests.

Staging tip: pause this session mid-run to use it as a "work in progress"
tile when showing multiple sessions side by side.

### Issue #4 - Generate OpenAPI spec from route definitions
**Showcases:** PR lifecycle - reviewing and merging work that has already
been done.
**Suggested mode:** Pre-staged PR (no live session required).

[PR #8](../../pull/8) is kept permanently open as the ready-to-merge prop
for this issue. It closes #4 with a real diff (`src/openapi.ts`,
`scripts/generate-openapi.ts`, `openapi.json`, and Swagger UI at `/docs`)
and is parked in a mergeable, clean state.

1. From issue #4, navigate to [PR #8](../../pull/8).
2. Walk through the PR page: title, description, checks, and the
   **Files changed** tab.
3. Merge the PR if the demo calls for it, otherwise leave it open.

If the PR has been merged and needs to be re-staged, recreate it from the
`copilot/generate-openapi-spec` branch or run a fresh Autopilot session on
issue #4.

### Issue #5 - Refactor UserService to use dependency injection
**Showcases:** Interactive collaboration - the agent pauses to ask a
question before continuing.
**Suggested mode:** Interactive.

1. Open issue #5 and start a session in **Interactive** mode.
2. Send one short instruction, for example: "Start with the constructor
   signature."
3. The agent replies with a clarifying question (such as whether to
   introduce an interface or keep concrete types).

Staging tip: leave the session paused on that question to use it as a
"waiting on user" tile when showing multiple sessions side by side.

### Suggested staging for a side-by-side Inbox view

| Issue | Suggested state                        | Purpose                  |
|-------|-----------------------------------------|--------------------------|
| #1    | Fresh, untouched                        | End-to-end flow          |
| #2    | Plan mode, paused on plan review        | Plan mode tile           |
| #3    | Autopilot, partway through              | Work-in-progress tile    |
| #4    | [PR #8](../../pull/8) open, mergeable   | Merge-ready tile         |
| #5    | Interactive, paused on agent question   | Human-in-the-loop tile   |

### Tips

- Set Flight Deck to the light theme first so the dark-mode toggle in
  issue #1 reads clearly.
- Close unrelated repositories in the sidebar so the Inbox focuses on this
  repo.
- Sessions can be run at any pace; slower runs make each step easier to
  follow when presenting.

See the [issues list](../../issues) for the full specs on each task.


