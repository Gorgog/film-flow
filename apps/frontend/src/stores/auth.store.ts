import type { User } from '@film-flow/shared/types';
import { create } from 'zustand';

const TOKEN_KEY = 'filmflow_access_token';

interface AuthStore {
  user: User;
  loading: boolean;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  getToken: () => string | null;
  clearTokens: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem('filmflow_refresh_token', refreshToken);
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('filmflow_refresh_token');
    set({ user: null });
  },

  signOut: () => get().clearTokens(),
}));
