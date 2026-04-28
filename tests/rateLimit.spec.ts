import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createRateLimiter } from '../src/middleware/rateLimit.js';

function buildApp(options?: Parameters<typeof createRateLimiter>[0]) {
  const app = express();
  const limiter = createRateLimiter(options);
  app.use('/api', limiter);
  app.get('/api/test', (_req, res) => res.json({ ok: true }));
  app.get('/api/other', (_req, res) => res.json({ route: 'other' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  return { app, limiter };
}

describe('Rate limiting middleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under the limit', async () => {
    const { app } = buildApp({ maxRequests: 5, windowMs: 60_000 });

    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.headers['x-ratelimit-limit']).toBe('5');
    expect(res.headers['x-ratelimit-remaining']).toBe('4');
  });

  it('returns 429 when limit is exceeded', async () => {
    const { app } = buildApp({ maxRequests: 3, windowMs: 60_000 });

    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/api/test');
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).get('/api/test');
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe('Too Many Requests');
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('includes Retry-After header on 429 responses', async () => {
    const { app } = buildApp({ maxRequests: 1, windowMs: 30_000 });

    await request(app).get('/api/test');
    const blocked = await request(app).get('/api/test');

    expect(blocked.status).toBe(429);
    const retryAfter = Number(blocked.headers['retry-after']);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(30);
  });

  it('resets the window after the time period', async () => {
    const { app } = buildApp({ maxRequests: 2, windowMs: 10_000 });

    await request(app).get('/api/test');
    await request(app).get('/api/test');

    const blocked = await request(app).get('/api/test');
    expect(blocked.status).toBe(429);

    // Advance time past the window
    vi.advanceTimersByTime(11_000);

    const afterReset = await request(app).get('/api/test');
    expect(afterReset.status).toBe(200);
    expect(afterReset.headers['x-ratelimit-remaining']).toBe('1');
  });

  it('does not rate-limit non-API routes', async () => {
    const { app } = buildApp({ maxRequests: 1, windowMs: 60_000 });

    await request(app).get('/api/test');
    const blocked = await request(app).get('/api/test');
    expect(blocked.status).toBe(429);

    // /health is outside /api, so not rate-limited
    const healthRes = await request(app).get('/health');
    expect(healthRes.status).toBe(200);
  });

  it('supports per-route override via separate limiter instance', async () => {
    const app = express();
    const globalLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
    const strictLimiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });

    app.use('/api/strict', strictLimiter);
    app.use('/api', globalLimiter);
    app.get('/api/test', (_req, res) => res.json({ ok: true }));
    app.get('/api/strict/action', (_req, res) => res.json({ ok: true }));

    // Strict route allows only 2
    await request(app).get('/api/strict/action');
    await request(app).get('/api/strict/action');
    const strictBlocked = await request(app).get('/api/strict/action');
    expect(strictBlocked.status).toBe(429);

    // Global route still works
    const globalRes = await request(app).get('/api/test');
    expect(globalRes.status).toBe(200);
  });

  it('tracks allowed and throttled metrics', async () => {
    const { app, limiter } = buildApp({ maxRequests: 2, windowMs: 60_000 });

    await request(app).get('/api/test');
    await request(app).get('/api/test');
    await request(app).get('/api/test');

    expect(limiter.metrics.allowed).toBe(2);
    expect(limiter.metrics.throttled).toBe(1);
  });

  it('uses default options (100 req/min) when none provided', async () => {
    const { app } = buildApp();

    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.headers['x-ratelimit-limit']).toBe('100');
    expect(res.headers['x-ratelimit-remaining']).toBe('99');
  });
});
