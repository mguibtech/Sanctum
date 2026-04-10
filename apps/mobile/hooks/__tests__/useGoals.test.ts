import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGoals, getGoalLabel, getGoalUnit, GoalType } from '../useGoals';

jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { api } from '../../services/api';

describe('useGoals Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for refresh() calls
    (api.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  describe('Initialization', () => {
    it('should initialize with empty goals', () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useGoals());

      expect(result.current.goals).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.submitting).toBe(false);
    });

    it('should load goals on mount', async () => {
      const mockGoals = [
        {
          id: '1',
          userId: 'user1',
          goalType: 'DAILY_MINUTES' as GoalType,
          targetValue: 15,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          userId: 'user1',
          goalType: 'WEEKLY_SESSIONS' as GoalType,
          targetValue: 7,
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockGoals });

      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.goals).toEqual(mockGoals);
    });
  });

  describe('Create Goal', () => {
    it('should create a goal successfully', async () => {
      const goalData = {
        goalType: 'DAILY_MINUTES' as GoalType,
        targetValue: 20,
      };

      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });
      (api.post as jest.Mock).mockResolvedValueOnce({
        data: { id: '1', userId: 'user1', isActive: true, ...goalData },
      });

      const { result } = renderHook(() => useGoals());

      let createdGoal;
      await act(async () => {
        createdGoal = await result.current.create(goalData);
      });

      expect(api.post).toHaveBeenCalledWith('/goals', goalData);
      expect(createdGoal).toHaveProperty('id');
      expect(createdGoal.targetValue).toBe(20);
    });

    it('should handle goal creation with different types', async () => {
      const goalTypes: GoalType[] = [
        'DAILY_MINUTES',
        'WEEKLY_SESSIONS',
        'WEEKLY_ROUTINE_DAYS',
        'BIBLE_DAYS',
        'ROSARY_PER_WEEK',
      ];

      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useGoals());

      for (const goalType of goalTypes) {
        (api.post as jest.Mock).mockResolvedValueOnce({
          data: { id: '1', goalType, targetValue: 10, isActive: true },
        });

        await act(async () => {
          await result.current.create({ goalType, targetValue: 10 });
        });

        expect(api.post).toHaveBeenCalledWith('/goals', { goalType, targetValue: 10 });
      }
    });
  });

  describe('Update Goal', () => {
    it('should update a goal successfully', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: [
          {
            id: '1',
            userId: 'user1',
            goalType: 'DAILY_MINUTES' as GoalType,
            targetValue: 15,
            isActive: true,
          },
        ],
      });
      (api.patch as jest.Mock).mockResolvedValueOnce({
        data: { id: '1', targetValue: 25, isActive: true },
      });

      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.update('1', { targetValue: 25 });
      });

      expect(api.patch).toHaveBeenCalledWith('/goals/1', { targetValue: 25 });
    });
  });

  describe('Delete Goal', () => {
    it('should delete a goal successfully', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: [
          {
            id: '1',
            goalType: 'DAILY_MINUTES' as GoalType,
            targetValue: 15,
            isActive: true,
          },
        ],
      });
      (api.delete as jest.Mock).mockResolvedValueOnce({ data: {} });

      const { result } = renderHook(() => useGoals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.remove('1');
      });

      expect(api.delete).toHaveBeenCalledWith('/goals/1');
    });
  });

  describe('Toggle Goal', () => {
    it('should toggle goal active state', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });
      (api.patch as jest.Mock).mockResolvedValueOnce({ data: {} });

      const { result } = renderHook(() => useGoals());

      await act(async () => {
        await result.current.toggle('1', true);
      });

      expect(api.patch).toHaveBeenCalledWith('/goals/1', { isActive: false });
    });
  });

  describe('Utility Functions', () => {
    it('should get correct goal labels', () => {
      expect(getGoalLabel('DAILY_MINUTES')).toBe('Minutos diarios');
      expect(getGoalLabel('WEEKLY_SESSIONS')).toBe('Sessoes semanais');
      expect(getGoalLabel('WEEKLY_ROUTINE_DAYS')).toBe('Dias com rotina semanal');
      expect(getGoalLabel('BIBLE_DAYS')).toBe('Dias com Biblia');
      expect(getGoalLabel('ROSARY_PER_WEEK')).toBe('Tercos por semana');
    });

    it('should get correct goal units', () => {
      expect(getGoalUnit('DAILY_MINUTES')).toBe('min');
      expect(getGoalUnit('WEEKLY_SESSIONS')).toBe('sessoes');
      expect(getGoalUnit('WEEKLY_ROUTINE_DAYS')).toBe('dias');
      expect(getGoalUnit('BIBLE_DAYS')).toBe('dias');
      expect(getGoalUnit('ROSARY_PER_WEEK')).toBe('tercos');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });
      (api.post as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useGoals());

      await act(async () => {
        try {
          await result.current.create({
            goalType: 'DAILY_MINUTES',
            targetValue: 15,
          });
        } catch (error) {
          expect((error as Error).message).toBe('API Error');
        }
      });
    });
  });
});
