import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BibleService } from '../bible/bible.service';
import { XpService } from '../xp/xp.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private bible: BibleService,
    private xp: XpService,
  ) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        parish: { select: { id: true, name: true, city: true, state: true } },
        streak: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, name: true, email: true, avatar: true },
    });
  }

  async getStats(userId: string) {
    const [streak, bibleProgress, gamification] = await Promise.all([
      this.prisma.streak.findUnique({ where: { userId } }),
      this.bible.getProgress(userId),
      this.xp.getFullStats(userId),
    ]);

    return {
      streak,
      bible: {
        chaptersRead: bibleProgress.chaptersRead,
        chaptersContemplated: bibleProgress.chaptersContemplated,
        chaptersStarted: bibleProgress.chaptersStarted,
        partialChapters: bibleProgress.partialChapters,
        versesRead: bibleProgress.versesRead,
        versesContemplated: bibleProgress.versesContemplated,
        percentage: bibleProgress.percentage,
        contemplatedPercentage: bibleProgress.contemplatedPercentage,
        totalChapters: bibleProgress.totalChapters,
      },
      gamification,
    };
  }

  async getBadges(userId: string) {
    return this.xp.getBadges(userId);
  }

  async getActivityHistory(userId: string, days = 7) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dates: Date[] = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - (days - 1 - i));
      return d;
    });

    const since = dates[0];
    const [completions, xpTx] = await Promise.all([
      this.prisma.liturgyCompletion.findMany({
        where: { userId, date: { gte: since } },
        select: { date: true, contemplated: true },
      }),
      this.prisma.xpTransaction.findMany({
        where: { userId, createdAt: { gte: since } },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const completionMap = new Map(
      completions.map((c) => [c.date.toISOString().slice(0, 10), c]),
    );

    const xpByDay = new Map<string, number>();
    for (const tx of xpTx) {
      const key = tx.createdAt.toISOString().slice(0, 10);
      xpByDay.set(key, (xpByDay.get(key) ?? 0) + tx.amount);
    }

    return dates.map((d) => {
      const key = d.toISOString().slice(0, 10);
      const completion = completionMap.get(key);
      return {
        date: key,
        completed: Boolean(completion),
        contemplated: completion?.contemplated ?? false,
        xpEarned: xpByDay.get(key) ?? 0,
      };
    });
  }

  private getDayOfWeekString(): string {
    // Retorna o dia da semana (0-6) como string para comparação com daysOfWeek
    return String(new Date().getUTCDay());
  }

  async getTodayPlan(userId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dayOfWeekStr = this.getDayOfWeekString();

    const [dailySummary, todayReminders, activeRoutines, activeGoals, stats] = await Promise.all([
      // Resumo do dia
      this.prisma.userDailySummary.findUnique({
        where: { userId_date: { userId, date: today } },
      }),
      // Lembretes para hoje (ativados e que correspondem ao dia da semana)
      this.prisma.reminder.findMany({
        where: {
          userId,
          isEnabled: true,
          daysOfWeek: {
            contains: dayOfWeekStr,
          },
        },
        include: {
          routine: {
            select: { id: true, name: true, estimatedMinutes: true },
          },
        },
        orderBy: { timeOfDay: 'asc' },
      }),
      // Próximas rotinas (ativas)
      this.prisma.prayerRoutine.findMany({
        where: { userId, isActive: true },
        select: { id: true, name: true, estimatedMinutes: true, type: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Metas ativas
      this.prisma.userGoal.findMany({
        where: { userId, isActive: true },
        select: { id: true, goalType: true, targetValue: true },
      }),
      // Estatísticas de gamificação
      this.xp.getFullStats(userId),
    ]);

    return {
      today: today.toISOString().slice(0, 10),
      summary: dailySummary || {
        minutesPrayed: 0,
        sessionsCompleted: 0,
        xpEarned: 0,
        liturgyCompleted: false,
        rosaryCompleted: false,
        bibleCompleted: false,
        routineCompleted: false,
      },
      reminders: todayReminders.map((r) => ({
        id: r.id,
        title: r.title,
        timeOfDay: r.timeOfDay,
        routine: r.routine ? { id: r.routine.id, name: r.routine.name } : null,
      })),
      suggestedRoutines: activeRoutines,
      goals: activeGoals,
      gamification: stats,
    };
  }
}
