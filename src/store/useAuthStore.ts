import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (accessToken: string, refreshToken: string, user?: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (accessToken, refreshToken, user) => {
        if (typeof document !== 'undefined') {
          document.cookie = `token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({ accessToken, refreshToken, user: user || null });
      },
      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          document.cookie = `refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
