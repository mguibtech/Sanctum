import { useCallback, useEffect, useState } from 'react';
import { RoutinesAPI } from '../services/api';

export type RoutineItem = {
  id: string;
  position: number;
  itemType: string;
  title: string;
  estimatedMinutes: number;
};

export type Routine = {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  isDefault: boolean;
  isActive: boolean;
  estimatedMinutes: number;
  items: RoutineItem[];
};

const ROUTINE_TEMPLATES = {
  morning: {
    name: 'Rotina da manha',
    description: 'Comece o dia com foco, Palavra e oracao.',
    type: 'MORNING',
    items: [
      { position: 1, itemType: 'LITURGY', title: 'Liturgia do dia', estimatedMinutes: 8 },
      { position: 2, itemType: 'REFLECTION', title: 'Reflexao breve', estimatedMinutes: 4 },
      { position: 3, itemType: 'FREE_PRAYER', title: 'Oracao espontanea', estimatedMinutes: 3 },
    ],
  },
  night: {
    name: 'Rotina da noite',
    description: 'Encerramento do dia com exame e silencio.',
    type: 'NIGHT',
    items: [
      { position: 1, itemType: 'REFLECTION', title: 'Exame do dia', estimatedMinutes: 5 },
      { position: 2, itemType: 'FREE_PRAYER', title: 'Entrega da noite', estimatedMinutes: 4 },
    ],
  },
  rosary: {
    name: 'Rotina mariana',
    description: 'Terco e intencoes da semana.',
    type: 'ROSARY',
    items: [
      { position: 1, itemType: 'ROSARY', title: 'Terco completo', estimatedMinutes: 20 },
      { position: 2, itemType: 'FREE_PRAYER', title: 'Intencoes pessoais', estimatedMinutes: 3 },
    ],
  },
} as const;

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoutinesAPI.list();
      setRoutines(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createFromTemplate = useCallback(async (templateKey: keyof typeof ROUTINE_TEMPLATES) => {
    const template = ROUTINE_TEMPLATES[templateKey];
    setSubmitting(true);
    try {
      const routineRes = await RoutinesAPI.create({
        name: template.name,
        description: template.description,
        type: template.type,
        isDefault: true,
      });

      const routineId = routineRes.data?.id;
      if (routineId) {
        for (const item of template.items) {
          await RoutinesAPI.addItem(routineId, item);
        }
      }

      await refresh();
      return routineRes.data;
    } finally {
      setSubmitting(false);
    }
  }, [refresh]);

  const completeRoutine = useCallback(async (routineId: string) => {
    setSubmitting(true);
    try {
      const res = await RoutinesAPI.complete(routineId);
      await refresh();
      return res.data;
    } finally {
      setSubmitting(false);
    }
  }, [refresh]);

  return {
    routines,
    loading,
    submitting,
    refresh,
    createFromTemplate,
    completeRoutine,
  };
}
