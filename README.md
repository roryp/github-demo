# github-app-demo

A tiny Express + TypeScript app used as the hero codebase for the GitHub App
agentic development demo.

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
```

Sign in with `ada@example.com` / `password`.

## Layout

```
src/
  server.ts            # Express app factory + entrypoint
  routes/
    auth.ts            # POST /api/auth/login
    users.ts           # GET /api/users, /api/users/:id
  services/
    UserService.ts     # business logic (owns its deps — see issue #5)
    db.ts              # in-memory user store
    emailSender.ts     # noop email sender
  middleware/          # (rate limiting will live here — see issue #3)
public/                # static frontend (header, login, dashboard)
tests/
  login.spec.ts        # currently flaky — see issue #2
```

## Demo script — showcasing the GitHub App

Five issues are pre-filed, each chosen to highlight a specific capability of
the GitHub App. Run them in this order for the cleanest narrative, or cherry
pick whichever beat you need.

The "hero flow" used in the launch video is **Issue #1**. The other four are
staged as background context: one mid-flight, one in Plan mode, one in
Interactive mode, and one as an open PR ready to merge — so the Inbox looks
alive when the camera opens.

### Issue #1 — Add dark mode toggle to the app header
**Showcases:** Issue → session → diff → PR → merge, all in one surface.
**Mode:** Autopilot.

1. From the Inbox, click issue #1 and choose **Start session**.
2. Note the auto-generated branch (`add-dark-mode-toggle`) and isolated workspace.
3. Pick **Autopilot** and let it run. It should edit `public/styles.css`,
   add a `ThemeToggle` to each HTML page, and persist the choice in
   `localStorage`.
4. Open the **Diff** tab and scroll through the changes.
5. In the live preview, click the toggle — the app flips from light to dark.
   This is the money shot.
6. Click **Create pull request**, wait for checks, then **Merge**.
7. Back in the Inbox, issue #1 now shows as Closed.

### Issue #2 — Fix flaky login test in CI
**Showcases:** Plan mode, transparent reasoning before execution.
**Mode:** Plan.

1. Open issue #2 → **Start session** → **Plan**.
2. Let the agent produce its plan. It should identify the
   `setTimeout` race in `tests/login.spec.ts` and propose awaiting the
   response instead.
3. Review the plan on camera — this is the moment that proves the agent
   shows its work before touching code.
4. Approve the plan. The agent rewrites the test; `npm test` stays green
   without any arbitrary waits.

### Issue #3 — Add rate limiting middleware to the public API
**Showcases:** Real multi-file diffs, clean backend changes.
**Mode:** Autopilot.

1. Open issue #3 → **Start session** → **Autopilot**.
2. The agent creates `src/middleware/rateLimit.ts`, wires it into
   `src/server.ts`, adds per-route overrides, and writes unit tests.
3. Use this session as your "mid-flight" tile in the parallel-sessions
   scene — pause it while files are still changing for the best visual.

### Issue #4 — Generate OpenAPI spec from route definitions
**Showcases:** Docs + tooling work, PR lifecycle with green checks.
**Mode:** Pre-staged PR (no live session needed).

> **Use [PR #8](../../pull/8) for this tile.** It is already open against
> `main` with a real diff closing #4 (adds `src/openapi.ts`,
> `scripts/generate-openapi.ts`, `openapi.json`, and Swagger UI at `/docs`),
> and is parked in `mergeable: CLEAN` state. **Do not merge it before
> recording** — it is your Scene 6/7 "ready to merge" prop.

On camera:

1. From the session panel for issue #4, click through to **PR #8**.
2. Show the PR page: title, description, file tree, green checks.
3. Open the **Files changed** tab briefly to show the generated spec.
4. If the script calls for a merge beat, merge it live. Otherwise leave it
   open for future takes.

> If you need to re-stage this PR (for example after a retake that merges
> it), recreate it from the `copilot/generate-openapi-spec` branch or start
> a fresh Autopilot session on issue #4.

### Issue #5 — Refactor UserService to use dependency injection
**Showcases:** Interactive collaboration, human-in-the-loop control.
**Mode:** Interactive.

1. Open issue #5 → **Start session** → **Interactive**.
2. Send one message: "Start with the constructor signature."
3. Let the agent reply with a clarifying question (for example, whether
   to introduce an interface or keep concrete types).
4. Leave the session paused on that question — it's your "waiting on
   you" tile in the parallel-sessions scene.

### Staging summary for the Inbox shot

| Issue | State when you hit record          | Purpose                          |
|-------|------------------------------------|----------------------------------|
| #1    | Fresh, untouched                   | Hero flow                        |
| #2    | Plan mode, paused on plan          | Plan mode tile                   |
| #3    | Autopilot, ~60% through            | Mid-flight tile                  |
| #4    | [PR #8](../../pull/8) open, mergeable | Lifecycle / merge-ready tile     |
| #5    | Interactive, waiting on user       | Human-in-the-loop tile           |

### Tips

- Set the GitHub App's own theme to light before recording so the Scene 5
  light-to-dark flip reads clearly.
- Close every other repo in the sidebar. Only `github-app-demo` should be
  visible.
- Pre-record the agent-working scene at real speed and speed-ramp it in
  post. Do not try to capture 30 seconds of live tool calls on the first
  take.

See the [issues list](../../issues) for the full specs on each task.
