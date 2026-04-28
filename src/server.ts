import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { generateSpec } from './openapi.js';
import { createRateLimiter } from './middleware/rateLimit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Rate limiting: 100 requests/min per IP on all /api/* routes
  const apiLimiter = createRateLimiter();
  app.use('/api', apiLimiter);

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Swagger UI served at /docs
  const spec = generateSpec();
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

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
