import { Router } from 'express';
import { z } from 'zod';
import { getDefaultUserService } from '../services/UserService.js';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export const userListSchema = z.array(userSchema);

export const usersRouter = Router();

const users = getDefaultUserService();

usersRouter.get('/', async (_req, res) => {
  const all = await users.list();
  res.json(all.map((u) => ({ id: u.id, email: u.email, name: u.name })));
});

usersRouter.get('/:id', async (req, res) => {
  const user = await users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name });
});
