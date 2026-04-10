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
  getRanking: (
    metric: 'streak' | 'xp' | 'bible' | 'contemplation' = 'streak',
    period: 'week' | 'month' | 'allTime' = 'allTime',
  ) => api.get(`/streak/ranking?metric=${metric}&period=${period}`),
};

export const BibleAPI = {
  getHealth: () => api.get('/bible/health'),
  getBooks: () => api.get('/bible/books'),
  getChapters: (bookId: string) => api.get(`/bible/books/${bookId}/chapters`),
  getBookProgress: (bookId: string) => api.get(`/bible/books/${bookId}/progress`),
  getChapter: (bookId: string, num: number) =>
    api.get(`/bible/books/${bookId}/chapters/${num}`),
  saveProgress: (data: { bookId: string; bookName: string; chapterNum: number; contemplated?: boolean }) =>
    api.post('/bible/progress', data),
  getProgress: () => api.get('/bible/progress'),
  getSavedPassages: (params?: { bookId?: string; chapterNum?: number }) =>
    api.get('/bible/saved-passages', { params }),
  getChapterSavedPassages: (bookId: string, num: number) =>
    api.get(`/bible/books/${bookId}/chapters/${num}/saved-passages`),
  savePassage: (data: {
    bookId: string;
    bookName: string;
    chapterNum: number;
    verseStart: number;
    verseEnd: number;
    note?: string;
  }) => api.post('/bible/saved-passages', data),
  removeSavedPassage: (id: string) => api.delete(`/bible/saved-passages/${id}`),
};

export const CommunityAPI = {
  getPrayerRequests: (page = 1) => api.get(`/community/prayers?page=${page}`),
  createPrayerRequest: (data: { content: string; isAnonymous?: boolean }) =>
    api.post('/community/prayers', data),
  pray: (id: string) => api.post(`/community/prayers/${id}/pray`),
  report: (id: string) => api.post(`/community/prayers/${id}/report`),
};

export const ChallengeAPI = {
  getWeekly: () => api.get('/challenges/weekly'),
};

export const RosaryAPI = {
  getToday: () => api.get('/rosary/today'),
  complete: () => api.post('/rosary/complete'),
};

export const RoutinesAPI = {
  list: () => api.get('/routines'),
  getById: (id: string) => api.get(`/routines/${id}`),
  create: (data: Record<string, unknown>) => api.post('/routines', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/routines/${id}`, data),
  remove: (id: string) => api.delete(`/routines/${id}`),
  addItem: (id: string, data: Record<string, unknown>) => api.post(`/routines/${id}/items`, data),
  updateItem: (id: string, itemId: string, data: Record<string, unknown>) =>
    api.patch(`/routines/${id}/items/${itemId}`, data),
  removeItem: (id: string, itemId: string) => api.delete(`/routines/${id}/items/${itemId}`),
  complete: (id: string) => api.post(`/routines/${id}/complete`),
};

export const SessionsAPI = {
  start: (data: Record<string, unknown>) => api.post('/sessions/start', data),
  complete: (id: string, data?: Record<string, unknown>) => api.post(`/sessions/${id}/complete`, data ?? {}),
  abandon: (id: string, data?: Record<string, unknown>) => api.post(`/sessions/${id}/abandon`, data ?? {}),
  history: (limit = 20) => api.get(`/sessions/history?limit=${limit}`),
  summary: (days = 7) => api.get(`/sessions/summary?days=${days}`),
};

export const UsersAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data: { name?: string; avatar?: string; parishId?: string }) =>
    api.patch('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
  getBadges: () => api.get('/users/me/badges'),
  getActivity: (days = 7) => api.get(`/users/me/activity?days=${days}`),
};
