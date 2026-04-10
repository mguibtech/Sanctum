import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StreakService } from '../streak/streak.service';
import { FinishSessionDto } from './dto/finish-session.dto';
import { StartSessionDto } from './dto/start-session.dto';

type SessionSourceType =
  | 'ROUTINE'
  | 'LITURGY'
  | 'BIBLE'
  | 'ROSARY'
  | 'GUIDED_SESSION'
  | 'CAMPAIGN'
  | 'FREE_PRAYER';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private streak: StreakService,
  ) {}

  private get sessionDelegate() {
    return (this.prisma as any).prayerSessionLog;
  }

  private get summaryDelegate() {
    return (this.prisma as any).userDailySummary;
  }

  async start(userId: string, dto: StartSessionDto) {
    return this.sessionDelegate.create({
      data: {
        userId,
        sourceType: dto.sourceType,
        sourceId: dto.sourceId ?? null,
        durationSeconds: dto.durationSeconds ?? 0,
        contemplated: dto.contemplated ?? false,
        notes: dto.notes ?? null,
      },
    });
  }

  async complete(userId: string, sessionId: string, dto: FinishSessionDto) {
    const existing = await this.sessionDelegate.findFirst({
      where: { id: sessionId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Sessao nao encontrada');
    }

    const durationSeconds = dto.durationSeconds ?? existing.durationSeconds ?? 0;
    const contemplated = dto.contemplated ?? existing.contemplated ?? false;
    const completedAt = new Date();
    const updated = await this.sessionDelegate.update({
      where: { id: sessionId },
      data: {
        completedAt,
        durationSeconds,
        contemplated,
        notes: dto.notes ?? existing.notes ?? null,
        completionState: 'COMPLETED',
      },
    });

    let streakCounted = Boolean(existing.streakCounted);
    if (!streakCounted) {
      await this.streak.checkIn(userId).catch(() => {});
      streakCounted = true;
      await this.sessionDelegate.update({
        where: { id: sessionId },
        data: { streakCounted: true },
      });
    }

    await this.upsertDailySummary(userId, updated.sourceType as SessionSourceType, durationSeconds, streakCounted);

    return {
      ...updated,
      streakCounted,
    };
  }

  async abandon(userId: string, sessionId: string, dto: FinishSessionDto) {
    const existing = await this.sessionDelegate.findFirst({
      where: { id: sessionId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Sessao nao encontrada');
    }

    return this.sessionDelegate.update({
      where: { id: sessionId },
      data: {
        durationSeconds: dto.durationSeconds ?? existing.durationSeconds ?? 0,
        contemplated: dto.contemplated ?? existing.contemplated ?? false,
        notes: dto.notes ?? existing.notes ?? null,
        completionState: 'ABANDONED',
      },
    });
  }

  async history(userId: string, limit = 20) {
    return this.sessionDelegate.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: Math.min(limit, 100),
    });
  }

  async summary(userId: string, days = 7) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const since = new Date(today);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const summaries = await this.summaryDelegate.findMany({
      where: {
        userId,
        date: { gte: since },
      },
      orderBy: { date: 'asc' },
    });

    return summaries;
  }

  async completeRoutineSession(userId: string, routineId: string, estimatedMinutes: number) {
    const startedAt = new Date();
    const created = await this.sessionDelegate.create({
      data: {
        userId,
        sourceType: 'ROUTINE',
        sourceId: routineId,
        startedAt,
        completedAt: startedAt,
        durationSeconds: Math.max(estimatedMinutes, 0) * 60,
        completionState: 'COMPLETED',
        streakCounted: true,
      },
    });

    await this.streak.checkIn(userId).catch(() => {});
    await this.upsertDailySummary(userId, 'ROUTINE', created.durationSeconds, true);

    return created;
  }

  async logCompletedSession(
    userId: string,
    sourceType: SessionSourceType,
    sourceId?: string | null,
    options?: {
      durationSeconds?: number;
      contemplated?: boolean;
      notes?: string | null;
      xpGranted?: number;
      streakCounted?: boolean;
    },
  ) {
    const completedAt = new Date();
    const created = await this.sessionDelegate.create({
      data: {
        userId,
        sourceType,
        sourceId: sourceId ?? null,
        startedAt: completedAt,
        completedAt,
        durationSeconds: options?.durationSeconds ?? 0,
        completionState: 'COMPLETED',
        contemplated: options?.contemplated ?? false,
        notes: options?.notes ?? null,
        xpGranted: options?.xpGranted ?? 0,
        streakCounted: options?.streakCounted ?? false,
      },
    });

    await this.upsertDailySummary(
      userId,
      sourceType,
      created.durationSeconds,
      options?.streakCounted ?? false,
      options?.xpGranted ?? 0,
    );

    return created;
  }

  private async upsertDailySummary(
    userId: string,
    sourceType: SessionSourceType,
    durationSeconds: number,
    streakCounted: boolean,
    xpEarned = 0,
  ) {
    const now = new Date();
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const data: Record<string, unknown> = {
      minutesPrayed: { increment: Math.max(Math.round(durationSeconds / 60), 0) },
      sessionsCompleted: { increment: 1 },
      xpEarned: { increment: xpEarned },
    };

    if (sourceType === 'ROUTINE') data.routineCompleted = true;
    if (sourceType === 'LITURGY') data.liturgyCompleted = true;
    if (sourceType === 'ROSARY') data.rosaryCompleted = true;
    if (sourceType === 'BIBLE') data.bibleCompleted = true;
    if (streakCounted) data.streakCounted = true;

    return this.summaryDelegate.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        minutesPrayed: Math.max(Math.round(durationSeconds / 60), 0),
        sessionsCompleted: 1,
        routineCompleted: sourceType === 'ROUTINE',
        liturgyCompleted: sourceType === 'LITURGY',
        rosaryCompleted: sourceType === 'ROSARY',
        bibleCompleted: sourceType === 'BIBLE',
        xpEarned,
        streakCounted,
      },
      update: data,
    });
  }
}
