import { BadRequestException, Injectable } from '@nestjs/common';
import { XpReason } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { getLevelInfo } from '../xp/xp-levels';

type RankingMetric = 'streak' | 'xp' | 'bible' | 'contemplation';
type RankingPeriod = 'week' | 'month' | 'allTime';

type RankedScore = {
  userId: string;
  score: number;
};

@Injectable()
export class StreakService {
  constructor(
    private prisma: PrismaService,
    private xp: XpService,
  ) {}

  async checkIn(userId: string) {
    const streak = await this.prisma.streak.findUnique({ where: { userId } });
    if (!streak) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActivity = streak.lastActivityAt
      ? new Date(
          streak.lastActivityAt.getFullYear(),
          streak.lastActivityAt.getMonth(),
          streak.lastActivityAt.getDate(),
        )
      : null;

    if (lastActivity && lastActivity.getTime() === today.getTime()) {
      return streak;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = streak.currentStreak;
    let newShields = streak.shields;

    if (!lastActivity || lastActivity < yesterday) {
      if (newShields > 0 && lastActivity) {
        newShields -= 1;
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak += 1;
    }

    if (newStreak % 7 === 0 && newShields < 2) {
      newShields += 1;
    }

    const longestStreak = Math.max(streak.longestStreak, newStreak);

    const updated = await this.prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        shields: newShields,
        lastActivityAt: now,
      },
    });

    this.xp.recordStreakCheckIn(userId, newStreak).catch(() => {});

    return updated;
  }

  async getMyStreak(userId: string) {
    return this.prisma.streak.findUnique({ where: { userId } });
  }

  async useShield(userId: string) {
    const streak = await this.prisma.streak.findUnique({ where: { userId } });
    if (!streak || streak.shields <= 0) {
      throw new BadRequestException('Nenhum escudo disponivel');
    }

    return this.prisma.streak.update({
      where: { userId },
      data: { shields: { decrement: 1 } },
    });
  }

  async getRanking(
    userId: string,
    metric: RankingMetric = 'streak',
    period: RankingPeriod = 'allTime',
  ) {
    const currentScores = await this.computeScores(metric, period);
    const previousScores = period === 'allTime' ? [] : await this.computeScores(metric, period, true);
    const streakMap = period === 'allTime' && metric === 'streak' ? await this.getAllTimeStreakMap() : new Map<string, number>();

    const currentRanks = this.buildRankedList(currentScores);
    const previousRankMap = new Map(
      this.buildRankedList(previousScores).map((entry) => [entry.userId, entry.rank]),
    );

    const topEntries = currentRanks.slice(0, 20);
    const currentUserEntry = currentRanks.find((entry) => entry.userId === userId) ?? null;
    const responseEntries =
      currentUserEntry && !topEntries.some((entry) => entry.userId === userId)
        ? [...topEntries, currentUserEntry]
        : topEntries;

    const users = await this.prisma.user.findMany({
      where: { id: { in: responseEntries.map((entry) => entry.userId) } },
      select: {
        id: true,
        name: true,
        avatar: true,
        stats: { select: { xp: true, level: true } },
      },
    });
    const userMap = new Map(users.map((user) => [user.id, user]));

    return responseEntries
      .map((entry) => {
        const user = userMap.get(entry.userId);
        if (!user) return null;

        const xp = user.stats?.xp ?? 0;
        const levelInfo = getLevelInfo(xp);
        const base = {
          rank: entry.rank,
          metric,
          period,
          value: entry.score,
          trendingDelta:
            period === 'allTime'
              ? null
              : this.computeTrendingDelta(entry.rank, previousRankMap.get(entry.userId)),
          isCurrentUser: entry.userId === userId,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            xp,
            level: user.stats?.level ?? levelInfo.level,
            levelName: levelInfo.name,
          },
        };

        if (metric === 'xp') {
          return {
            ...base,
            xp: entry.score,
          };
        }

        if (metric === 'bible') {
          return {
            ...base,
            chaptersRead: entry.score,
          };
        }

        if (metric === 'contemplation') {
          return {
            ...base,
            contemplations: entry.score,
          };
        }

        return {
          ...base,
          currentStreak: entry.score,
          longestStreak: streakMap.get(entry.userId) ?? entry.score,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }

  private buildRankedList(scores: RankedScore[]) {
    return [...scores]
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.userId.localeCompare(right.userId);
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }

  private computeTrendingDelta(currentRank: number, previousRank?: number) {
    if (!previousRank) return null;
    return currentRank - previousRank;
  }

  private async computeScores(metric: RankingMetric, period: RankingPeriod, usePreviousWindow = false) {
    if (metric === 'xp') {
      return this.computeXpScores(period, usePreviousWindow);
    }

    if (metric === 'bible') {
      return this.computeBibleScores(period, usePreviousWindow);
    }

    if (metric === 'contemplation') {
      return this.computeContemplationScores(period, usePreviousWindow);
    }

    return this.computeStreakScores(period, usePreviousWindow);
  }

  private async computeXpScores(period: RankingPeriod, usePreviousWindow: boolean) {
    if (period === 'allTime') {
      const stats = await this.prisma.userStats.findMany({
        where: { xp: { gt: 0 } },
        select: { userId: true, xp: true },
      });

      return stats.map((stat) => ({ userId: stat.userId, score: stat.xp }));
    }

    const range = this.getPeriodRange(period, usePreviousWindow);
    const totals = await this.prisma.xpTransaction.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      _sum: { amount: true },
    });

    return totals
      .map((row) => ({ userId: row.userId, score: row._sum.amount ?? 0 }))
      .filter((row) => row.score > 0);
  }

  private async computeBibleScores(period: RankingPeriod, usePreviousWindow: boolean) {
    const range = period === 'allTime' ? null : this.getPeriodRange(period, usePreviousWindow);

    const progress = await this.prisma.bibleProgress.groupBy({
      by: ['userId'],
      where: range
        ? {
            lastReadAt: {
              gte: range.start,
              lt: range.end,
            },
          }
        : undefined,
      _count: { chapterNum: true },
    });

    return progress
      .map((row) => ({ userId: row.userId, score: row._count.chapterNum }))
      .filter((row) => row.score > 0);
  }

  private async computeContemplationScores(period: RankingPeriod, usePreviousWindow: boolean) {
    if (period === 'allTime') {
      const stats = await this.prisma.userStats.findMany({
        where: { totalContemplated: { gt: 0 } },
        select: { userId: true, totalContemplated: true },
      });

      return stats.map((stat) => ({ userId: stat.userId, score: stat.totalContemplated }));
    }

    const range = this.getPeriodRange(period, usePreviousWindow);
    const [liturgy, bible] = await Promise.all([
      this.prisma.liturgyCompletion.groupBy({
        by: ['userId'],
        where: {
          contemplated: true,
          completedAt: {
            gte: range.start,
            lt: range.end,
          },
        },
        _count: { _all: true },
      }),
      this.prisma.bibleProgress.groupBy({
        by: ['userId'],
        where: {
          contemplated: true,
          lastReadAt: {
            gte: range.start,
            lt: range.end,
          },
        },
        _count: { _all: true },
      }),
    ]);

    const totals = new Map<string, number>();
    for (const row of liturgy) {
      totals.set(row.userId, (totals.get(row.userId) ?? 0) + row._count._all);
    }
    for (const row of bible) {
      totals.set(row.userId, (totals.get(row.userId) ?? 0) + row._count._all);
    }

    return Array.from(totals.entries()).map(([userId, score]) => ({ userId, score }));
  }

  private async computeStreakScores(period: RankingPeriod, usePreviousWindow: boolean) {
    if (period === 'allTime') {
      const streaks = await this.prisma.streak.findMany({
        where: { currentStreak: { gt: 0 } },
        select: { userId: true, currentStreak: true },
      });

      return streaks.map((streak) => ({
        userId: streak.userId,
        score: streak.currentStreak,
      }));
    }

    const range = this.getPeriodRange(period, usePreviousWindow);
    const checkIns = await this.prisma.xpTransaction.groupBy({
      by: ['userId'],
      where: {
        reason: XpReason.STREAK_CHECKIN,
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      _count: { _all: true },
    });

    return checkIns
      .map((row) => ({ userId: row.userId, score: row._count._all }))
      .filter((row) => row.score > 0);
  }

  private async getAllTimeStreakMap() {
    const streaks = await this.prisma.streak.findMany({
      select: {
        userId: true,
        longestStreak: true,
      },
    });

    return new Map(streaks.map((streak) => [streak.userId, streak.longestStreak]));
  }

  private getPeriodRange(period: Exclude<RankingPeriod, 'allTime'>, usePreviousWindow: boolean) {
    const now = new Date();
    const windowDays = period === 'week' ? 7 : 30;
    const currentStart = new Date(now);
    currentStart.setUTCDate(currentStart.getUTCDate() - windowDays);

    if (!usePreviousWindow) {
      return {
        start: currentStart,
        end: now,
      };
    }

    const previousEnd = currentStart;
    const previousStart = new Date(previousEnd);
    previousStart.setUTCDate(previousStart.getUTCDate() - windowDays);

    return {
      start: previousStart,
      end: previousEnd,
    };
  }
}
