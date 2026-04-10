export type LevelInfo = {
  level: number;
  name: string;
  minXp: number;
  maxXp: number | null; // null = sem limite (nível máximo)
};

export const XP_LEVELS: LevelInfo[] = [
  { level: 1,  name: 'Fiel',       minXp: 0,     maxXp: 99    },
  { level: 2,  name: 'Discípulo',  minXp: 100,   maxXp: 249   },
  { level: 3,  name: 'Servo',      minXp: 250,   maxXp: 499   },
  { level: 4,  name: 'Zelador',    minXp: 500,   maxXp: 999   },
  { level: 5,  name: 'Guardião',   minXp: 1000,  maxXp: 1999  },
  { level: 6,  name: 'Apóstolo',   minXp: 2000,  maxXp: 3999  },
  { level: 7,  name: 'Profeta',    minXp: 4000,  maxXp: 6999  },
  { level: 8,  name: 'Patriarca',  minXp: 7000,  maxXp: 10999 },
  { level: 9,  name: 'Santo',      minXp: 11000, maxXp: 17999 },
  { level: 10, name: 'Mártir',     minXp: 18000, maxXp: null  },
];

export function getLevelInfo(xp: number): LevelInfo & {
  xpForCurrentLevel: number;
  xpForNextLevel: number | null;
  xpProgress: number;
} {
  const current =
    [...XP_LEVELS].reverse().find((l) => xp >= l.minXp) ?? XP_LEVELS[0];

  const next = current.maxXp !== null
    ? XP_LEVELS.find((l) => l.level === current.level + 1) ?? null
    : null;

  const xpInLevel = xp - current.minXp;
  const xpNeeded = current.maxXp !== null ? current.maxXp - current.minXp + 1 : 1;
  const xpProgress = current.maxXp !== null ? Math.min(xpInLevel / xpNeeded, 1) : 1;

  return {
    ...current,
    xpForCurrentLevel: current.minXp,
    xpForNextLevel: next?.minXp ?? null,
    xpProgress: Math.round(xpProgress * 100) / 100,
  };
}
