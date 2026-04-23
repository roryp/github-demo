import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server.js';

describe('POST /api/auth/login', () => {
  it('rejects invalid credentials', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('should redirect to dashboard after successful login', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toMatch(/^demo-token-/);
    expect(res.body.user.email).toBe('ada@example.com');
  });
});
