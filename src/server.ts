import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { openApiSpec } from './openapi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec as never));

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
