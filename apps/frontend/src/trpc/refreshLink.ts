import { useAuthStore } from '@/stores/auth.store';
import {
  createTRPCClient,
  httpBatchLink,
  TRPCClientError,
  type TRPCLink,
} from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from 'backend/trpc';

const refreshClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // Без Authorization — refresh не требует access_token
    }),
  ],
});

async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('filmflow_refresh_token');
  if (!refreshToken) return false;
  try {
    const result = await refreshClient.auth.refresh.mutate({
      refresh_token: refreshToken,
    });
    useAuthStore
      .getState()
      .setTokens(result.access_token, result.refresh_token);
    useAuthStore.getState().setUser(result.user);
    return true;
  } catch {
    useAuthStore.getState().clearTokens();
    return false;
  }
}

/**
 * Link: перехватывает UNAUTHORIZED, пробует refresh и повторяет запрос.
 */
export const refreshLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer: { next: (v: unknown) => void; complete: () => void; error: (e: unknown) => void }) => {
      let currentUnsub: (() => void) | undefined;

      const run = () => {
        const sub = next(op).subscribe({
          next: (value) => observer.next(value),
          complete: () => observer.complete(),
          error: async (err: unknown) => {
            const isUnauth =
              err instanceof TRPCClientError &&
              err.data?.code === 'UNAUTHORIZED';

            if (isUnauth) {
              const ok = await tryRefresh();
              if (ok) {
                run();
                return;
              }
            }
            observer.error(err);
          },
        });
        currentUnsub = sub.unsubscribe?.bind(sub) ?? (() => {});
      };

      run();
      return () => currentUnsub?.();
    });
  };
};
