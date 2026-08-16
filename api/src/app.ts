import express from 'express';
import cors from 'cors';
import * as helmetModule from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { apiReference } from '@scalar/express-api-reference';
import { env } from './config/env.js';
import { GetCurrentUser, LoginUser, RegisterUser } from './modules/auth/application/auth.js';
import { BcryptPasswordHasher } from './modules/auth/infrastructure/bcrypt-password-hasher.js';
import { PrismaUserRepository } from './modules/auth/infrastructure/prisma-user-repository.js';
import { JwtTokenService } from './modules/auth/infrastructure/jwt-token-service.js';
import { AuthController } from './modules/auth/interfaces/controllers/auth.controller.js';
import { authRouter } from './modules/auth/interfaces/routes/auth.routes.js';
import { authenticate } from './interfaces/http/middleware/authenticate.js';
import { PrismaTaskRepository } from './modules/tasks/infrastructure/prisma-task-repository.js';
import { CreateTask, DeleteTask, GetTask, ListTasks, UpdateTask } from './modules/tasks/application/tasks.js';
import { TaskController } from './modules/tasks/interfaces/controllers/task.controller.js';
import { taskRouter } from './modules/tasks/interfaces/routes/task.routes.js';
import { AppError } from './shared/errors.js';
import { validationError } from './interfaces/http/middleware/error-handler.js';
import { openApiDocument } from '../openapi.js';

const helmet = helmetModule.default;

export const createApp = () => {
  const app = express();
  const users = new PrismaUserRepository();
  const passwords = new BcryptPasswordHasher();
  const tokens = new JwtTokenService();
  const register = new RegisterUser(users, passwords, tokens);
  const login = new LoginUser(users, passwords, tokens);
  const getCurrentUser = new GetCurrentUser(users);
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        'script-src': [
          "'self'",
          'https://cdn.jsdelivr.net',
          "'sha256-rzwAAbtXKA0k5x2VFQzcawESvfwM+IxfW8NBGTfYOcE='",
        ],
      },
    },
  }));
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
  app.use((req, _res, next) => {
    console.log(`[request] ${req.method} ${req.originalUrl}`);
    next();
  });
  app.get('/', (_req, res) => {
    res.json({ name: 'Iris To-do API', status: 'ok' });
  });
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/openapi.json', (_req, res) => res.json(openApiDocument));
  app.use('/docs', apiReference({ url: '/openapi.json' }));
  const taskRepository = new PrismaTaskRepository();
  const taskController = new TaskController(
    new CreateTask(taskRepository),
    new ListTasks(taskRepository),
    new GetTask(taskRepository),
    new UpdateTask(taskRepository),
    new DeleteTask(taskRepository),
  );
  const authController = new AuthController(register, login, getCurrentUser);
  app.use('/api/auth', authRouter(authController, authenticate(tokens)));
  app.use('/api/tasks', authenticate(tokens), taskRouter(taskController));
  app.use((_req, _res, next) => next(new AppError(404, 'Route not found')));
  app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(`ERROR ${req.method} ${req.originalUrl}:`, error);
    const normalized = validationError(error);
    const appError = normalized instanceof AppError ? normalized : null;
    const status = appError?.statusCode ?? 500;
    res.status(status).json({ error: { code: status === 500 ? 'INTERNAL_SERVER_ERROR' : `HTTP_${status}`, message: appError?.message ?? 'Internal server error', details: appError?.details } });
  });
  return app;
};
