import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserStats } from '../useUserStats';

jest.mock('../../services/api', () => ({
  UsersAPI: {
    getStats: jest.fn(),
    getBadges: jest.fn(),
  },
}));

import { UsersAPI } from '../../services/api';

describe('useUserStats Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default stats when API returns null', async () => {
      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({ data: { gamification: null } });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // When gamification is null, hook uses DEFAULT_GAMIFICATION
      expect(result.current.gamification?.level).toBe(1);
      expect(result.current.gamification?.xp).toBe(0);
      expect(result.current.badges).toEqual([]);
    });

    it('should load stats on mount', async () => {
      const mockStats = {
        xp: 350,
        level: 2,
        levelName: 'Discípulo',
        totalLiturgyRead: 10,
        totalBibleChapters: 25,
        totalContemplated: 5,
        totalRosaries: 8,
        xpProgress: 0.75,
        xpForCurrentLevel: 100,
        xpForNextLevel: 150,
      };

      const mockBadges = [
        {
          id: 'first_liturgy',
          name: 'Primeira Missa',
          icon: 'medal-outline',
          unlocked: true,
        },
      ];

      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({
        data: { gamification: mockStats },
      });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({
        data: mockBadges,
      });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.gamification).toEqual(mockStats);
      expect(result.current.badges).toEqual(mockBadges);
    });
  });

  describe('Gamification Stats', () => {
    it('should return XP information', async () => {
      const mockStats = {
        xp: 500,
        level: 3,
        levelName: 'Servo',
        xpProgress: 0.5,
        xpForCurrentLevel: 250,
        xpForNextLevel: 250,
      };

      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({
        data: { gamification: mockStats },
      });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({
        data: [],
      });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.gamification?.xp).toBe(500);
      expect(result.current.gamification?.level).toBe(3);
      expect(result.current.gamification?.levelName).toBe('Servo');
    });

    it('should calculate correct XP progress', async () => {
      const mockStats = {
        xp: 325,
        level: 2,
        xpProgress: 0.25,
        xpForCurrentLevel: 100,
        xpForNextLevel: 150,
      };

      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({
        data: { gamification: mockStats },
      });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({
        data: [],
      });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.gamification?.xpProgress).toBe(0.25);
      });
    });

    it('should return activity totals', async () => {
      const mockStats = {
        totalLiturgyRead: 15,
        totalBibleChapters: 42,
        totalContemplated: 8,
        totalRosaries: 12,
      };

      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({
        data: { gamification: mockStats },
      });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({
        data: [],
      });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.gamification?.totalLiturgyRead).toBe(15);
        expect(result.current.gamification?.totalBibleChapters).toBe(42);
        expect(result.current.gamification?.totalContemplated).toBe(8);
        expect(result.current.gamification?.totalRosaries).toBe(12);
      });
    });
  });

  describe('Badges', () => {
    it('should return unlocked badges', async () => {
      const mockBadges = [
        {
          id: 'first_liturgy',
          name: 'Primeira Missa',
          icon: 'medal-outline',
          unlocked: true,
        },
        {
          id: 'streak_7',
          name: '7 Dias Seguidos',
          icon: 'fire',
          unlocked: true,
        },
      ];

      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({ data: { gamification: null } });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({
        data: mockBadges,
      });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.badges).toEqual(mockBadges);
      });

      const unlockedBadges = result.current.badges.filter((b) => b.unlocked);
      expect(unlockedBadges.length).toBe(2);
    });

    it('should return locked badges', async () => {
      const mockBadges = [
        {
          id: 'first_liturgy',
          name: 'Primeira Missa',
          icon: 'medal-outline',
          unlocked: true,
        },
        {
          id: 'streak_30',
          name: 'Mês Fiel',
          icon: 'fire',
          unlocked: false,
        },
      ];

      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({ data: { gamification: null } });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({
        data: mockBadges,
      });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.badges).toEqual(mockBadges);
      });

      const lockedBadges = result.current.badges.filter((b) => !b.unlocked);
      expect(lockedBadges.length).toBe(1);
      expect(lockedBadges[0].id).toBe('streak_30');
    });

    it('should handle empty badge list', async () => {
      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({ data: { gamification: null } });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.badges).toEqual([]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle stats API error', async () => {
      (UsersAPI.getStats as jest.Mock).mockRejectedValueOnce(
        new Error('API error'),
      );
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.gamification).toBeNull();
    });

    it('should handle badges API error', async () => {
      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({ data: { gamification: null } });
      (UsersAPI.getBadges as jest.Mock).mockRejectedValueOnce(
        new Error('API error'),
      );

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.badges).toEqual([]);
    });

    it('should handle both APIs failing', async () => {
      (UsersAPI.getStats as jest.Mock).mockRejectedValueOnce(
        new Error('Stats error'),
      );
      (UsersAPI.getBadges as jest.Mock).mockRejectedValueOnce(
        new Error('Badges error'),
      );

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.gamification).toBeNull();
      expect(result.current.badges).toEqual([]);
    });
  });

  describe('Refresh', () => {
    it('should refresh stats and badges', async () => {
      // Mock for initial useEffect call
      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({
        data: { gamification: { xp: 100, level: 2, levelName: 'Discípulo' } },
      });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({ data: [] });

      // Mock for manual refresh call
      (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({
        data: { gamification: { xp: 150, level: 2, levelName: 'Discípulo' } },
      });
      (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useUserStats());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(UsersAPI.getStats).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refresh();
      });

      expect(UsersAPI.getStats).toHaveBeenCalledTimes(2);
      expect(UsersAPI.getBadges).toHaveBeenCalledTimes(2);
    });
  });

  describe('Level Progression', () => {
    it('should track progression through levels', async () => {
      const levels = [
        { level: 1, xp: 0, name: 'Fiel' },
        { level: 2, xp: 100, name: 'Discípulo' },
        { level: 3, xp: 250, name: 'Servo' },
        { level: 4, xp: 500, name: 'Zelador' },
        { level: 5, xp: 1000, name: 'Guardião' },
      ];

      for (const levelData of levels) {
        (UsersAPI.getStats as jest.Mock).mockResolvedValueOnce({
          data: {
            gamification: {
              xp: levelData.xp,
              level: levelData.level,
              levelName: levelData.name,
              totalBibleChapters: 0,
              totalContemplated: 0,
              totalLiturgyRead: 0,
              totalRosaries: 0,
              xpProgress: 0,
              xpForCurrentLevel: 0,
              xpForNextLevel: 100,
            }
          },
        });
        (UsersAPI.getBadges as jest.Mock).mockResolvedValueOnce({ data: [] });

        const { result } = renderHook(() => useUserStats());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.gamification?.level).toBe(levelData.level);
        expect(result.current.gamification?.levelName).toBe(levelData.name);
      }
    });
  });
});
