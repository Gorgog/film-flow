import '@/index.css';
import { AuthInit } from '@/components/AuthInit';
import { router } from '@/routes/config';
import { useAuthStore } from '@/stores/auth.store';
import { trpc } from '@/trpc/client';
import { refreshLink } from '@/trpc/refreshLink';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    refreshLink,
    httpBatchLink({
      url: '/api/trpc',
      headers: () => {
        const token = useAuthStore.getState().getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthInit />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </trpc.Provider>
    </Theme>
  </StrictMode>
);
