import { appRouter } from '@/trpc/root';
import { createContext } from '@/trpc/trpc';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];
app.use(cors({ origin: corsOrigins }));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(express.json());
app.use(
  '/api/trpc',
  createExpressMiddleware({ router: appRouter, createContext })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend работает!' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
