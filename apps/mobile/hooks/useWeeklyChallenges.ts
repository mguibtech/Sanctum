import { useCallback, useEffect, useState } from 'react';
import { ChallengeAPI } from '../services/api';

export type WeeklyChallenge = {
  id: string;
  type: string;
  title: string;
  description: string;
  goal: number;
  xpReward: number;
  shieldReward: boolean;
  icon: string;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  expiresAt: string;
};

export function useWeeklyChallenges() {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ChallengeAPI.getWeekly();
      setChallenges(res.data ?? []);
    } catch {
      // falha silenciosa
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { challenges, loading, refresh };
}
