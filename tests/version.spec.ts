import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server.js';

describe('GET /api/version', () => {
  it('returns the app version', async () => {
    const app = createApp();
    const res = await request(app).get('/api/version');
    expect(res.status).toBe(200);
    expect(res.body.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
