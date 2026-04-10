import { useCallback, useEffect, useState } from 'react';
import { UsersAPI } from '../services/api';

export type GamificationStats = {
  xp: number;
  level: number;
  levelName: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number | null;
  xpProgress: number; // 0..1
  totalLiturgyRead: number;
  totalContemplated: number;
  totalBibleChapters: number;
  totalRosaries: number;
};

export type BadgeItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  earnedAt: string | null;
};

type UserStatsState = {
  gamification: GamificationStats | null;
  badges: BadgeItem[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const DEFAULT_GAMIFICATION: GamificationStats = {
  xp: 0,
  level: 1,
  levelName: 'Fiel',
  xpForCurrentLevel: 0,
  xpForNextLevel: 100,
  xpProgress: 0,
  totalLiturgyRead: 0,
  totalContemplated: 0,
  totalBibleChapters: 0,
  totalRosaries: 0,
};

export function useUserStats(): UserStatsState {
  const [gamification, setGamification] = useState<GamificationStats | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, badgesRes] = await Promise.allSettled([
        UsersAPI.getStats(),
        UsersAPI.getBadges(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setGamification(statsRes.value.data?.gamification ?? DEFAULT_GAMIFICATION);
      }
      if (badgesRes.status === 'fulfilled') {
        setBadges(badgesRes.value.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { gamification, badges, loading, refresh };
}
