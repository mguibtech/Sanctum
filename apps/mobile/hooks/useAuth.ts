import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthAPI, UsersAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hydrateSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  hydrateSession: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      await get().loadUser();
    } catch {
      await get().logout();
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await AuthAPI.login({ email, password });
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      await get().loadUser();
      set({ isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await AuthAPI.register({ name, email, password });
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      await get().loadUser();
      set({ isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    try {
      if (refreshToken) await AuthAPI.logout(refreshToken);
    } catch {
      // Ignore remote logout failures and clear the local session anyway.
    }
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const { data } = await UsersAPI.getMe();
    set({ user: data, isAuthenticated: true });
  },
}));
