import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import { createAuthRouter } from './routes/auth.js';
import { createUsersRouter } from './routes/users.js';
import { generateSpec } from './openapi.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { UserService } from './services/UserService.js';
import { InMemoryUserDb } from './services/db.js';
import { EmailSender } from './services/emailSender.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const db = new InMemoryUserDb();
  const email = new EmailSender();
  const userService = new UserService(db, email);

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Rate limiting: 100 requests/min per IP on all /api/* routes
  const apiLimiter = createRateLimiter();
  app.use('/api', apiLimiter);

  app.use('/api/auth', createAuthRouter(userService));
  app.use('/api/users', createUsersRouter(userService));

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
