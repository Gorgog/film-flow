import { supabase } from '@/lib/supabase';
import type { User } from '@film-flow/shared/types';
import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export const createContext = async ({ req }: CreateExpressContextOptions) => {
  const authHeader = req.headers.authorization;
  const token =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
  let user: User = null;
  if (token) {
    const {
      data: { user: u },
    } = await supabase.auth.getUser(token);
    user = u ? { id: u.id, email: u.email } : null;
  }
  return { user, token };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Требуется авторизация',
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
