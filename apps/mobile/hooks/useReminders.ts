import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export type Reminder = {
  id: string;
  userId: string;
  routineId?: string | null;
  title: string;
  timeOfDay: string; // HH:mm format
  timezone: string;
  daysOfWeek: number[]; // 0=Sunday, 6=Saturday
  isEnabled: boolean;
  lastTriggeredAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const RemindersAPI = {
  list: () => api.get('/reminders'),
  create: (data: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    api.post('/reminders', data),
  update: (id: string, data: Partial<Reminder>) =>
    api.patch(`/reminders/${id}`, data),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RemindersAPI.list();
      setReminders(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      setSubmitting(true);
      try {
        const res = await RemindersAPI.create(data);
        await refresh();
        return res.data;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, data: Partial<Reminder>) => {
      setSubmitting(true);
      try {
        const res = await RemindersAPI.update(id, data);
        await refresh();
        return res.data;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      setSubmitting(true);
      try {
        await RemindersAPI.delete(id);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const toggle = useCallback(
    async (id: string, isEnabled: boolean) => {
      await update(id, { isEnabled: !isEnabled });
    },
    [update],
  );

  return {
    reminders,
    loading,
    submitting,
    refresh,
    create,
    update,
    remove,
    toggle,
  };
}

export function getDayLabel(dayNumber: number): string {
  return DAYS_OF_WEEK[dayNumber] ?? 'Dia';
}

export function formatDaysOfWeek(days: number[]): string {
  if (days.length === 0) return 'Nenhum dia';
  if (days.length === 7) return 'Todos os dias';
  return days.map(getDayLabel).join(', ');
}
