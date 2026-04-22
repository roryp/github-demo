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

## Open work
See the [issues list](../../issues) — five curated tasks covering UI, tests,
security, docs and refactors.
