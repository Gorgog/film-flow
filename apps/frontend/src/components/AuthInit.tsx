import { trpc } from '@/trpc/client';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export function AuthInit() {
  const hasToken = useAuthStore((s) => !!s.getToken());
  const { data, isSuccess, isFetched } = trpc.auth.me.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (!hasToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    if (!isFetched) return;
    setUser(isSuccess && data ? data : null);
    setLoading(false);
  }, [hasToken, isFetched, isSuccess, data, setUser, setLoading]);

  return null;
}
