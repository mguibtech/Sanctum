import { Injectable } from '@nestjs/common';
import { ChallengeType, XpReason } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import {
  getActiveChallengesForWeek,
  getWeekEnd,
  getWeekKey,
} from './challenge-catalog';

@Injectable()
export class ChallengeService {
  constructor(
    private prisma: PrismaService,
    private xp: XpService,
  ) {}

  // ─── Lista desafios da semana com progresso do usuário ────────────────────
  async getWeeklyChallenges(userId: string) {
    const weekKey = getWeekKey();
    const challenges = getActiveChallengesForWeek(weekKey);
    const expiresAt = getWeekEnd(weekKey).toISOString();

    const progressRecords = await this.prisma.userChallengeProgress.findMany({
      where: {
        userId,
        weekKey,
        challengeId: { in: challenges.map((c) => c.id) },
      },
    });

    const progressMap = new Map(progressRecords.map((r) => [r.challengeId, r]));

    return challenges.map((challenge) => {
      const record = progressMap.get(challenge.id);
      return {
        id: challenge.id,
        type: challenge.type,
        title: challenge.title,
        description: challenge.description,
        goal: challenge.goal,
        xpReward: challenge.xpReward,
        shieldReward: challenge.shieldReward,
        icon: challenge.icon,
        progress: record?.progress ?? 0,
        completed: record?.completed ?? false,
        completedAt: record?.completedAt ?? null,
        expiresAt,
      };
    });
  }

  // ─── Incrementa progresso por tipo de ação ────────────────────────────────
  async incrementProgress(userId: string, type: ChallengeType, amount = 1) {
    const weekKey = getWeekKey();
    const challenges = getActiveChallengesForWeek(weekKey);
    const matching = challenges.filter((c) => c.type === type);

    for (const challenge of matching) {
      const existing = await this.prisma.userChallengeProgress.findUnique({
        where: { userId_challengeId_weekKey: { userId, challengeId: challenge.id, weekKey } },
      });

      // Se já completou, não incrementa
      if (existing?.completed) continue;

      const currentProgress = existing?.progress ?? 0;
      const newProgress = Math.min(currentProgress + amount, challenge.goal);
      const nowCompleted = newProgress >= challenge.goal;

      await this.prisma.userChallengeProgress.upsert({
        where: { userId_challengeId_weekKey: { userId, challengeId: challenge.id, weekKey } },
        create: {
          userId,
          challengeId: challenge.id,
          weekKey,
          type: challenge.type,
          progress: newProgress,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date() : null,
        },
        update: {
          progress: newProgress,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date() : undefined,
        },
      });

      // Recompensas ao completar
      if (nowCompleted && !existing?.completed) {
        await this.xp.awardXp(userId, challenge.xpReward, XpReason.CHALLENGE_COMPLETE);

        if (challenge.shieldReward) {
          await this.prisma.streak.updateMany({
            where: { userId, shields: { lt: 2 } },
            data: { shields: { increment: 1 } },
          });
        }

        // Badge de primeiro desafio completo
        await this.xp.checkAndAwardBadges(userId);
      }
    }
  }
}
