import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Injeta o token JWT em cada requisição automaticamente
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Renovação automática do token quando recebe 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          await SecureStore.setItemAsync('accessToken', data.accessToken);
          await SecureStore.setItemAsync('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          // Se a renovação falhar, força o logout global
          try {
            const { useAuth } = await import('../hooks/useAuth');
            useAuth.getState().logout();
          } catch (e) {
            console.error('Erro ao fazer logout após falha de refresh:', e);
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

// ─── Funções de acesso à API ───────────────────

export const AuthAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
};

export const LiturgyAPI = {
  getToday: () => api.get('/liturgy/today'),
  getByDate: (date: string) => api.get(`/liturgy/${date}`),
  getTodayCompletion: () => api.get('/liturgy/today/completion'),
  complete: (opts?: { contemplated?: boolean; date?: string }) =>
    api.post('/liturgy/complete', opts ?? {}),
};

export const StreakAPI = {
  checkIn: () => api.post('/streak/check-in'),
  getMe: () => api.get('/streak/me'),
  useShield: () => api.post('/streak/use-shield'),
  getRanking: () => api.get('/streak/ranking'),
};

export const BibleAPI = {
  getBooks: () => api.get('/bible/books'),
  getChapters: (bookId: string) => api.get(`/bible/books/${bookId}/chapters`),
  getChapter: (bookId: string, num: number) =>
    api.get(`/bible/books/${bookId}/chapters/${num}`),
  saveProgress: (data: { bookId: string; bookName: string; chapterNum: number; contemplated?: boolean }) =>
    api.post('/bible/progress', data),
  getProgress: () => api.get('/bible/progress'),
};

export const CommunityAPI = {
  getPrayerRequests: (page = 1) => api.get(`/community/prayers?page=${page}`),
  createPrayerRequest: (data: { content: string; isAnonymous?: boolean }) =>
    api.post('/community/prayers', data),
  pray: (id: string) => api.post(`/community/prayers/${id}/pray`),
  report: (id: string) => api.post(`/community/prayers/${id}/report`),
};

export const RosaryAPI = {
  getToday: () => api.get('/rosary/today'),
  complete: () => api.post('/rosary/complete'),
};

export const UsersAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data: { name?: string; avatar?: string; parishId?: string }) =>
    api.patch('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
};
