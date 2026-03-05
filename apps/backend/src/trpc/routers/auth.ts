import { supabase } from '@/lib/supabase';
import { publicProcedure, router } from '@/trpc/trpc';
import { registerSchema } from '@film-flow/shared/auth';

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
      if (error) throw new Error(error.message);
      return { user: { id: data.user.id, email: data.user.email } };
    }),
});
