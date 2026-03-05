import { TRPCError } from '@trpc/server';
import { supabase } from '@/lib/supabase';
import {
  protectedProcedure,
  publicProcedure,
  router,
} from '@/trpc/trpc';
import { loginSchema, registerSchema } from '@film-flow/shared/auth';
import type { User } from '@film-flow/shared/types';

function toUser(u: { id: string; email?: string }): NonNullable<User> {
  return { id: u.id, email: u.email ?? undefined };
}

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { full_name: input.fullName },
      });
      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }
      return { user: toUser(data.user) };
    }),

  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: error.message,
      });
    }
    const session = data.session;
    if (!session) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Сессия не создана',
      });
    }
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: toUser(data.user),
    };
  }),

  refresh: publicProcedure
    .input((v: unknown) => {
      if (typeof v === 'object' && v !== null && 'refresh_token' in v) {
        const r = (v as { refresh_token: unknown }).refresh_token;
        if (typeof r === 'string' && r.length > 0) return { refresh_token: r };
      }
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'refresh_token обязателен',
      });
    })
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: input.refresh_token,
      });
      if (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message,
        });
      }
      const session = data.session;
      if (!session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Не удалось обновить сессию',
        });
      }
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: toUser(data.user),
      };
    }),

  me: protectedProcedure.query(({ ctx }) => ctx.user),

  logout: publicProcedure.mutation(() => ({ ok: true })),
});
