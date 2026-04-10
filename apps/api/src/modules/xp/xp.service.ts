import { Injectable, Logger } from '@nestjs/common';
import { XpReason } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BADGE_CATALOG, getBadge } from './badge-catalog';
import { getLevelInfo } from './xp-levels';

@Injectable()
export class XpService {
  private readonly logger = new Logger(XpService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Concede XP e recalcula nível ─────────────
  async awardXp(userId: string, amount: number, reason: XpReason) {
    const [stats] = await Promise.all([
      this.prisma.userStats.upsert({
        where: { userId },
        create: { userId, xp: amount, level: 1 },
        update: { xp: { increment: amount } },
      }),
      this.prisma.xpTransaction.create({
        data: { userId, amount, reason },
      }),
    ]);

    // Recalcula nível com o XP atualizado
    const newXp = stats.xp + amount; // upsert retorna antes do increment ser aplicado no mesmo tick
    // Busca o valor real atualizado
    const updated = await this.prisma.userStats.findUnique({ where: { userId } });
    if (!updated) return null;

    const levelInfo = getLevelInfo(updated.xp);
    const leveledUp = levelInfo.level !== stats.level;

    if (leveledUp) {
      await this.prisma.userStats.update({
        where: { userId },
        data: { level: levelInfo.level },
      });
      this.logger.log(`Usuário ${userId} subiu para o nível ${levelInfo.level} (${levelInfo.name})`);
    }

    return {
      xp: updated.xp,
      xpGained: amount,
      level: leveledUp ? levelInfo.level : stats.level,
      leveledUp,
      newLevelName: leveledUp ? levelInfo.name : null,
    };
  }

  // ─── Incrementa contadores e verifica badges ──
  async recordLiturgyRead(userId: string, contemplated: boolean, passagesMarked: number) {
    await this.prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalLiturgyRead: 1,
        totalContemplated: contemplated ? passagesMarked : 0,
      },
      update: {
        totalLiturgyRead: { increment: 1 },
        totalContemplated: contemplated ? { increment: passagesMarked } : undefined,
      },
    });

    const reason = contemplated ? XpReason.LITURGY_CONTEMPLATED : XpReason.LITURGY_READ;
    const xpAmount = contemplated ? 20 : 10;
    const result = await this.awardXp(userId, xpAmount, reason);
    await this.checkAndAwardBadges(userId);
    return result;
  }

  async recordBibleChapter(userId: string, contemplated: boolean) {
    await this.prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalBibleChapters: 1,
        totalContemplated: contemplated ? 1 : 0,
      },
      update: {
        totalBibleChapters: { increment: 1 },
        totalContemplated: contemplated ? { increment: 1 } : undefined,
      },
    });

    const reason = contemplated ? XpReason.BIBLE_CONTEMPLATED : XpReason.BIBLE_CHAPTER;
    const xpAmount = contemplated ? 10 : 5;
    const result = await this.awardXp(userId, xpAmount, reason);
    await this.checkAndAwardBadges(userId);
    return result;
  }

  async recordBibleContemplationUpgrade(userId: string) {
    await this.prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalContemplated: 1,
      },
      update: {
        totalContemplated: { increment: 1 },
      },
    });

    const result = await this.awardXp(userId, 5, XpReason.BIBLE_CONTEMPLATED);
    await this.checkAndAwardBadges(userId);
    return result;
  }

  async recordStreakCheckIn(userId: string, newStreakDays: number) {
    const result = await this.awardXp(userId, 3, XpReason.STREAK_CHECKIN);

    // Bônus por milestone
    const milestones = [7, 30, 100];
    if (milestones.includes(newStreakDays)) {
      const bonus = newStreakDays === 7 ? 50 : newStreakDays === 30 ? 150 : 500;
      await this.awardXp(userId, bonus, XpReason.STREAK_MILESTONE);
    }

    await this.checkAndAwardBadges(userId);
    return result;
  }

  async recordRosary(userId: string) {
    await this.prisma.userStats.upsert({
      where: { userId },
      create: { userId, totalRosaries: 1 },
      update: { totalRosaries: { increment: 1 } },
    });

    const result = await this.awardXp(userId, 15, XpReason.ROSARY_COMPLETE);
    await this.checkAndAwardBadges(userId);
    return result;
  }

  // ─── Retorna stats completas com nível ────────
  async getFullStats(userId: string) {
    const stats = await this.prisma.userStats.findUnique({ where: { userId } });

    if (!stats) {
      const levelInfo = getLevelInfo(0);
      return {
        xp: 0,
        level: 1,
        levelName: levelInfo.name,
        xpForCurrentLevel: 0,
        xpForNextLevel: levelInfo.xpForNextLevel,
        xpProgress: 0,
        totalLiturgyRead: 0,
        totalContemplated: 0,
        totalBibleChapters: 0,
        totalRosaries: 0,
      };
    }

    const levelInfo = getLevelInfo(stats.xp);

    return {
      xp: stats.xp,
      level: stats.level,
      levelName: levelInfo.name,
      xpForCurrentLevel: levelInfo.xpForCurrentLevel,
      xpForNextLevel: levelInfo.xpForNextLevel,
      xpProgress: levelInfo.xpProgress,
      totalLiturgyRead: stats.totalLiturgyRead,
      totalContemplated: stats.totalContemplated,
      totalBibleChapters: stats.totalBibleChapters,
      totalRosaries: stats.totalRosaries,
    };
  }

  // ─── Retorna badges com status locked/unlocked ─
  async getBadges(userId: string) {
    const earned = await this.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, earnedAt: true },
    });

    const earnedMap = new Map(earned.map((b) => [b.badgeId, b.earnedAt]));

    return BADGE_CATALOG.map((badge) => {
      const earnedAt = earnedMap.get(badge.id);
      return {
        ...badge,
        unlocked: Boolean(earnedAt),
        earnedAt: earnedAt ?? null,
      };
    });
  }

  // ─── Verifica e concede badges automáticas ────
  async checkAndAwardBadges(userId: string) {
    const [stats, streak, earned, bibleProgress] = await Promise.all([
      this.prisma.userStats.findUnique({ where: { userId } }),
      this.prisma.streak.findUnique({ where: { userId } }),
      this.prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
      this.prisma.bibleProgress.count({ where: { userId } }),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    const earnedIds = new Set(earned.map((b) => b.badgeId));
    const toAward: string[] = [];

    const check = (id: string, condition: boolean) => {
      if (condition && !earnedIds.has(id)) toAward.push(id);
    };

    // Liturgia
    check('first_liturgy', (stats?.totalLiturgyRead ?? 0) >= 1);

    // Streak
    const currentStreak = streak?.currentStreak ?? 0;
    check('streak_7', currentStreak >= 7);
    check('streak_30', currentStreak >= 30);
    check('streak_100', currentStreak >= 100);

    // Bíblia (capítulos)
    const TOTAL_CHAPTERS = 1334;
    const pct = (bibleProgress / TOTAL_CHAPTERS) * 100;
    check('bible_10pct', pct >= 10);
    check('bible_50pct', pct >= 50);
    check('bible_100pct', pct >= 100);

    // Contemplação
    check('contemplated_10', (stats?.totalContemplated ?? 0) >= 10);

    // Terços
    check('rosary_10', (stats?.totalRosaries ?? 0) >= 10);

    // Aniversário de 1 ano
    if (user) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      check('anniversary_1y', user.createdAt <= oneYearAgo);
    }

    if (!toAward.length) return [];

    // Insere badges e XP de recompensa
    await Promise.all(
      toAward.map((badgeId) =>
        this.prisma.userBadge.create({ data: { userId, badgeId } }),
      ),
    );

    for (const badgeId of toAward) {
      const badge = getBadge(badgeId);
      if (badge && badge.xpReward > 0) {
        await this.awardXp(userId, badge.xpReward, XpReason.CHALLENGE_COMPLETE);
      }
      this.logger.log(`Badge '${badgeId}' concedida ao usuário ${userId}`);
    }

    return toAward;
  }
}
