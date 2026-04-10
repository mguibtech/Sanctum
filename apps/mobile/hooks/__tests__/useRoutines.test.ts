import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRoutines, Routine, RoutineItem } from '../useRoutines';

jest.mock('../../services/api', () => ({
  RoutinesAPI: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    complete: jest.fn(),
  },
}));

import { RoutinesAPI } from '../../services/api';

describe('useRoutines Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for refresh() calls
    (RoutinesAPI.list as jest.Mock).mockResolvedValue({ data: [] });
  });

  describe('Initialization', () => {
    it('should initialize with empty routines', () => {
      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useRoutines());

      expect(result.current.routines).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.submitting).toBe(false);
    });

    it('should load routines on mount', async () => {
      const mockRoutines: Routine[] = [
        {
          id: '1',
          name: 'Morning Routine',
          description: 'Start the day with prayer',
          type: 'MORNING',
          isDefault: true,
          isActive: true,
          estimatedMinutes: 15,
          items: [
            {
              id: 'item1',
              position: 1,
              itemType: 'LITURGY',
              title: 'Daily Liturgy',
              estimatedMinutes: 8,
            },
          ],
        },
      ];

      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({
        data: mockRoutines,
      });

      const { result } = renderHook(() => useRoutines());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.routines).toEqual(mockRoutines);
    });
  });

  describe('Create From Template', () => {
    it('should create morning routine from template', async () => {
      const mockRoutine = {
        id: '1',
        name: 'Rotina da manha',
        type: 'MORNING',
        isDefault: true,
        isActive: true,
        estimatedMinutes: 15,
        items: [],
      };

      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });
      (RoutinesAPI.create as jest.Mock).mockResolvedValueOnce({
        data: { id: '1', ...mockRoutine },
      });
      (RoutinesAPI.addItem as jest.Mock).mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useRoutines());

      let createdRoutine;
      await act(async () => {
        createdRoutine = await result.current.createFromTemplate('morning');
      });

      expect(RoutinesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Rotina da manha',
          type: 'MORNING',
        }),
      );
      expect(createdRoutine).toHaveProperty('id');
    });

    it('should create night routine from template', async () => {
      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });
      (RoutinesAPI.create as jest.Mock).mockResolvedValueOnce({
        data: { id: '2', name: 'Rotina da noite' },
      });
      (RoutinesAPI.addItem as jest.Mock).mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        await result.current.createFromTemplate('night');
      });

      expect(RoutinesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Rotina da noite',
          type: 'NIGHT',
        }),
      );
    });

    it('should create rosary routine from template', async () => {
      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });
      (RoutinesAPI.create as jest.Mock).mockResolvedValueOnce({
        data: { id: '3', name: 'Rotina mariana' },
      });
      (RoutinesAPI.addItem as jest.Mock).mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        await result.current.createFromTemplate('rosary');
      });

      expect(RoutinesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Rotina mariana',
          type: 'ROSARY',
        }),
      );
    });

    it('should add items to routine after creation', async () => {
      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });
      (RoutinesAPI.create as jest.Mock).mockResolvedValueOnce({
        data: { id: '1' },
      });
      (RoutinesAPI.addItem as jest.Mock).mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        await result.current.createFromTemplate('morning');
      });

      expect(RoutinesAPI.addItem).toHaveBeenCalled();
      // Should be called once per item in template
      expect(RoutinesAPI.addItem).toHaveBeenCalledTimes(3); // morning has 3 items
    });
  });

  describe('Complete Routine', () => {
    it('should complete routine successfully', async () => {
      const mockRoutines: Routine[] = [
        {
          id: '1',
          name: 'Morning Routine',
          type: 'MORNING',
          isDefault: true,
          isActive: true,
          estimatedMinutes: 15,
          items: [],
        },
      ];

      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({
        data: mockRoutines,
      });
      (RoutinesAPI.complete as jest.Mock).mockResolvedValueOnce({
        data: { session: { xpGranted: 50 } },
      });

      const { result } = renderHook(() => useRoutines());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let completionResult;
      await act(async () => {
        completionResult = await result.current.completeRoutine('1');
      });

      expect(RoutinesAPI.complete).toHaveBeenCalledWith('1');
      expect(completionResult).toHaveProperty('session');
    });

    it('should return session data with XP on completion', async () => {
      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });
      (RoutinesAPI.complete as jest.Mock).mockResolvedValueOnce({
        data: {
          session: {
            id: 'session1',
            xpGranted: 75,
            durationSeconds: 900,
            completionState: 'COMPLETED',
          },
        },
      });

      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        const res = await result.current.completeRoutine('1');
        expect(res.session.xpGranted).toBe(75);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle creation error', async () => {
      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });
      (RoutinesAPI.create as jest.Mock).mockRejectedValueOnce(
        new Error('API error'),
      );

      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        try {
          await result.current.createFromTemplate('morning');
        } catch (error) {
          expect((error as Error).message).toBe('API error');
        }
      });
    });

    it('should handle completion error', async () => {
      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });
      (RoutinesAPI.complete as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const { result } = renderHook(() => useRoutines());

      await act(async () => {
        try {
          await result.current.completeRoutine('1');
        } catch (error) {
          expect((error as Error).message).toBe('Network error');
        }
      });
    });
  });

  describe('Refresh', () => {
    it('should refresh routine list', async () => {
      (RoutinesAPI.list as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useRoutines());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(RoutinesAPI.list).toHaveBeenCalledTimes(2);
    });
  });
});
