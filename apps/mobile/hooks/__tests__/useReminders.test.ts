import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReminders, formatDaysOfWeek, getDayLabel } from '../useReminders';

// Mock axios
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { api } from '../../services/api';

describe('useReminders Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for refresh() calls
    (api.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useReminders());

      expect(result.current.reminders).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.submitting).toBe(false);
    });

    it('should load reminders on mount', async () => {
      const mockReminders = [
        {
          id: '1',
          userId: 'user1',
          title: 'Morning Liturgy',
          timeOfDay: '08:00',
          timezone: 'America/Sao_Paulo',
          daysOfWeek: [1, 2, 3, 4, 5],
          isEnabled: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockReminders });

      const { result } = renderHook(() => useReminders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.reminders).toEqual(mockReminders);
    });
  });

  describe('Create Reminder', () => {
    it('should create a reminder successfully', async () => {
      const newReminder = {
        title: 'New Reminder',
        timeOfDay: '09:00',
        timezone: 'America/Sao_Paulo',
        daysOfWeek: [1, 2, 3],
        isEnabled: true,
      };

      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });
      (api.post as jest.Mock).mockResolvedValueOnce({ data: { id: '1', ...newReminder } });

      const { result } = renderHook(() => useReminders());

      let createdReminder;
      await act(async () => {
        createdReminder = await result.current.create(newReminder);
      });

      expect(api.post).toHaveBeenCalledWith('/reminders', newReminder);
      expect(createdReminder).toEqual({ id: '1', ...newReminder });
    });

    it('should handle create error', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });
      (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useReminders());

      await act(async () => {
        try {
          await result.current.create({
            title: 'Test',
            timeOfDay: '08:00',
            timezone: 'America/Sao_Paulo',
            daysOfWeek: [1],
            isEnabled: true,
          });
        } catch (error) {
          expect((error as Error).message).toBe('Network error');
        }
      });
    });
  });

  describe('Update Reminder', () => {
    it('should update a reminder successfully', async () => {
      const mockReminders = [
        {
          id: '1',
          userId: 'user1',
          title: 'Old Title',
          timeOfDay: '08:00',
          timezone: 'America/Sao_Paulo',
          daysOfWeek: [1, 2, 3],
          isEnabled: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockReminders });
      (api.patch as jest.Mock).mockResolvedValueOnce({
        data: { ...mockReminders[0], title: 'New Title' },
      });

      const { result } = renderHook(() => useReminders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.update('1', { title: 'New Title' });
      });

      expect(api.patch).toHaveBeenCalledWith('/reminders/1', { title: 'New Title' });
    });
  });

  describe('Delete Reminder', () => {
    it('should delete a reminder successfully', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: [
          {
            id: '1',
            title: 'To Delete',
            timeOfDay: '08:00',
            timezone: 'America/Sao_Paulo',
            daysOfWeek: [1],
            isEnabled: true,
          },
        ],
      });
      (api.delete as jest.Mock).mockResolvedValueOnce({ data: {} });

      const { result } = renderHook(() => useReminders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.remove('1');
      });

      expect(api.delete).toHaveBeenCalledWith('/reminders/1');
    });
  });

  describe('Toggle Reminder', () => {
    it('should toggle reminder enabled state', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({ data: [] });
      (api.patch as jest.Mock).mockResolvedValueOnce({ data: {} });

      const { result } = renderHook(() => useReminders());

      await act(async () => {
        await result.current.toggle('1', true);
      });

      expect(api.patch).toHaveBeenCalledWith('/reminders/1', { isEnabled: false });
    });
  });

  describe('Utility Functions', () => {
    it('should format days of week correctly', () => {
      expect(formatDaysOfWeek([1, 2, 3, 4, 5])).toBe('Seg, Ter, Qua, Qui, Sex');
      expect(formatDaysOfWeek([])).toBe('Nenhum dia');
      expect(formatDaysOfWeek([0, 1, 2, 3, 4, 5, 6])).toBe('Todos os dias');
    });

    it('should get day label correctly', () => {
      expect(getDayLabel(0)).toBe('Dom');
      expect(getDayLabel(3)).toBe('Qua');
      expect(getDayLabel(6)).toBe('Sab');
    });
  });
});
