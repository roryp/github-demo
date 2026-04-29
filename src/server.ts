import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'),
) as { version: string };

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/version', (_req, res) => {
    res.json({ version: pkg.version });
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
