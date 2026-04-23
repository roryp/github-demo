import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { rateLimit } from './middleware/rateLimit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Global API rate limit: 100 requests / minute / IP.
  app.use('/api', rateLimit({ windowMs: 60_000, max: 100 }));

  // Stricter limit on auth endpoints to slow down credential-stuffing.
  app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 10 }), authRouter);
  app.use('/api/users', usersRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const publicDir = path.resolve(__dirname, '../public');
  app.use(express.static(publicDir));

  return app;
}

const port = Number(process.env.PORT ?? 3000);

if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  app.listen(port, () => {
    console.log(`Demo app listening on http://localhost:${port}`);
  });
}
