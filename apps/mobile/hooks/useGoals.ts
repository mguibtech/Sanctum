import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export type GoalType = 'DAILY_MINUTES' | 'WEEKLY_SESSIONS' | 'WEEKLY_ROUTINE_DAYS' | 'BIBLE_DAYS' | 'ROSARY_PER_WEEK';

export type Goal = {
  id: string;
  userId: string;
  goalType: GoalType;
  targetValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GoalProgress = Goal & {
  currentValue: number;
  percentComplete: number;
};

const GoalsAPI = {
  list: () => api.get('/goals'),
  create: (data: { goalType: GoalType; targetValue: number }) =>
    api.post('/goals', data),
  update: (id: string, data: Partial<Goal>) =>
    api.patch(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

const GOAL_LABELS: Record<GoalType, { label: string; unit: string }> = {
  DAILY_MINUTES: { label: 'Minutos diarios', unit: 'min' },
  WEEKLY_SESSIONS: { label: 'Sessoes semanais', unit: 'sessoes' },
  WEEKLY_ROUTINE_DAYS: { label: 'Dias com rotina semanal', unit: 'dias' },
  BIBLE_DAYS: { label: 'Dias com Biblia', unit: 'dias' },
  ROSARY_PER_WEEK: { label: 'Tercos por semana', unit: 'tercos' },
};

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GoalsAPI.list();
      setGoals(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: { goalType: GoalType; targetValue: number }) => {
      setSubmitting(true);
      try {
        const res = await GoalsAPI.create(data);
        await refresh();
        return res.data;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, data: Partial<Goal>) => {
      setSubmitting(true);
      try {
        const res = await GoalsAPI.update(id, data);
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
        await GoalsAPI.delete(id);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  const toggle = useCallback(
    async (id: string, isActive: boolean) => {
      await update(id, { isActive: !isActive });
    },
    [update],
  );

  return {
    goals,
    loading,
    submitting,
    refresh,
    create,
    update,
    remove,
    toggle,
  };
}

export function getGoalLabel(goalType: GoalType): string {
  return GOAL_LABELS[goalType]?.label ?? goalType;
}

export function getGoalUnit(goalType: GoalType): string {
  return GOAL_LABELS[goalType]?.unit ?? '';
}

export const GOAL_SUGGESTIONS: Array<{ type: GoalType; defaultValue: number; icon: string }> = [
  { type: 'DAILY_MINUTES', defaultValue: 15, icon: 'clock-outline' },
  { type: 'WEEKLY_SESSIONS', defaultValue: 7, icon: 'list-box-outline' },
  { type: 'WEEKLY_ROUTINE_DAYS', defaultValue: 5, icon: 'calendar-check-outline' },
  { type: 'BIBLE_DAYS', defaultValue: 5, icon: 'book-open-variant' },
  { type: 'ROSARY_PER_WEEK', defaultValue: 3, icon: 'hands-pray' },
];
