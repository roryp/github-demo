import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { rateLimit } from '../src/middleware/rateLimit.js';

function buildApp(max: number, windowMs = 60_000) {
  const app = express();
  app.use(rateLimit({ max, windowMs }));
  app.get('/ping', (_req, res) => res.json({ ok: true }));
  return app;
}

describe('rateLimit middleware', () => {
  it('allows requests under the limit', async () => {
    const app = buildApp(3);
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/ping');
      expect(res.status).toBe(200);
    }
  });

  it('returns 429 with Retry-After once the limit is exceeded', async () => {
    const app = buildApp(2);
    await request(app).get('/ping');
    await request(app).get('/ping');
    const res = await request(app).get('/ping');
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('Too Many Requests');
    expect(res.headers['retry-after']).toBeDefined();
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('advertises limit and remaining counts via headers', async () => {
    const app = buildApp(5);
    const res = await request(app).get('/ping');
    expect(res.headers['x-ratelimit-limit']).toBe('5');
    expect(res.headers['x-ratelimit-remaining']).toBe('4');
  });

  it('resets after the window elapses', async () => {
    const app = buildApp(1, 50);
    await request(app).get('/ping');
    const blocked = await request(app).get('/ping');
    expect(blocked.status).toBe(429);
    await new Promise((r) => setTimeout(r, 60));
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
  });
});
