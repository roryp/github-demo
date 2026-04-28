import { Router } from 'express';
import { z } from 'zod';
import type { UserService } from '../services/UserService.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
});

export function createAuthRouter(users: UserService) {
  const router = Router();

  router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const user = await users.authenticate(parsed.data.email, parsed.data.password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      token: `demo-token-${user.id}`,
      user: { id: user.id, email: user.email, name: user.name },
    });
  });

  return router;
}
