import { authRouter } from './routers/auth';
import { moviesRouter } from './routers/movies';
import { router } from './trpc';

export const appRouter = router({ auth: authRouter, movies: moviesRouter });
export type AppRouter = typeof appRouter;
