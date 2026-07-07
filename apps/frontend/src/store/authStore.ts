import { create } from 'zustand';
import type { UserDTO } from '@proctoriq/shared';
import api, { fetchCsrfToken } from '../services/api';

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: UserDTO) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: async () => {
    try {
      await api.post('/auth/logout');
      await fetchCsrfToken();
    } catch (e) {
      console.error(e);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  checkAuth: async () => {
    try {
      const res = await api.get('/auth/profile');
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
