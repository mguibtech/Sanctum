import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { SessionsService } from '../sessions/sessions.service';
import { CompleteSessionDto } from './dto/complete-session.dto';

@Injectable()
export class ContentLibraryService {
  constructor(
    private prisma: PrismaService,
    private xp: XpService,
    private sessions: SessionsService,
  ) {}

  /**
   * Get featured/curated series sorted by priority
   */
  async getFeatured(limit = 5) {
    return this.prisma.contentSeries.findMany({
      where: { isPublished: true },
      orderBy: { priority: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        level: true,
        estimatedDays: true,
        imageUrl: true,
        _count: { select: { sessions: true } },
      },
    });
  }

  /**
   * Browse all published series with optional filtering
   */
  async browseSeries(filters?: { category?: string; level?: string }, limit = 50) {
    return this.prisma.contentSeries.findMany({
      where: {
        isPublished: true,
        category: filters?.category,
        level: filters?.level,
      },
      orderBy: { priority: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        level: true,
        estimatedDays: true,
        imageUrl: true,
        _count: { select: { sessions: true } },
      },
    });
  }

  /**
   * Get series with user progress enrichment (by slug or ID)
   */
  async getSeriesWithProgress(userId: string, identifier: string) {
    const series = await this.prisma.contentSeries.findFirst({
      where: {
        OR: [{ slug: identifier }, { id: identifier }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        level: true,
        estimatedDays: true,
        imageUrl: true,
        sessions: {
          where: { isPublished: true },
          orderBy: { dayNumber: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            dayNumber: true,
            durationSeconds: true,
            sessionType: true,
            audioAsset: {
              select: { id: true, url: true, durationSeconds: true },
            },
          },
        },
      },
    });

    if (!series) {
      throw new NotFoundException('Série não encontrada');
    }

    const progress = await this.prisma.userSeriesProgress.findUnique({
      where: { userId_seriesId: { userId, seriesId: series.id } },
    });

    return {
      ...series,
      userProgress: progress || null,
    };
  }

  /**
   * Start a series for a user
   */
  async startSeries(userId: string, seriesId: string) {
    const series = await this.prisma.contentSeries.findUnique({
      where: { id: seriesId },
    });

    if (!series) {
      throw new NotFoundException('Série não encontrada');
    }

    const existing = await this.prisma.userSeriesProgress.findUnique({
      where: { userId_seriesId: { userId, seriesId } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.userSeriesProgress.create({
      data: {
        userId,
        seriesId,
        currentDay: 1,
      },
    });
  }

  /**
   * Get a specific session
   */
  async getSession(sessionId: string) {
    const session = await this.prisma.contentSession.findUnique({
      where: { id: sessionId },
      include: {
        audioAsset: true,
        series: {
          select: { id: true, title: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return session;
  }

  /**
   * Complete a session and award XP
   */
  async completeSession(userId: string, sessionId: string, dto: CompleteSessionDto) {
    const session = await this.getSession(sessionId);

    // Log as GUIDED_SESSION in PrayerSessionLog
    const durationSeconds = dto.durationSeconds ?? session.durationSeconds;
    const contemplated = dto.contemplated ?? false;

    const sessionLog = await this.sessions.logCompletedSession(
      userId,
      'GUIDED_SESSION',
      sessionId,
      {
        durationSeconds,
        contemplated,
        notes: dto.notes,
        streakCounted: false, // Don't count toward streak
      },
    );

    // Award XP: 1 XP per 10 seconds + 50 bonus if contemplated
    let xpAmount = Math.floor(durationSeconds / 10);
    if (contemplated) xpAmount += 50;

    await this.xp.awardXp(userId, xpAmount, 'BIBLE_CHAPTER'); // Placeholder XP reason

    // Update user series progress
    const progress = await this.prisma.userSeriesProgress.findUnique({
      where: { userId_seriesId: { userId, seriesId: session.seriesId } },
    });

    if (progress) {
      const completedSessions = progress.completedSessions + 1;
      const nextDay = progress.currentDay + 1;

      // Check if series is complete
      const totalSessions = await this.prisma.contentSession.count({
        where: { seriesId: session.seriesId, isPublished: true },
      });

      const isSeriesComplete = completedSessions >= totalSessions;

      await this.prisma.userSeriesProgress.update({
        where: { id: progress.id },
        data: {
          currentDay: isSeriesComplete ? totalSessions : nextDay,
          completedSessions,
          completed: isSeriesComplete,
          completedAt: isSeriesComplete ? new Date() : null,
          lastSessionAt: new Date(),
        },
      });
    }

    return sessionLog;
  }

  /**
   * Search sessions by query and tags
   */
  async searchSessions(query?: string, tags?: string[], limit = 20) {
    return this.prisma.contentSession.findMany({
      where: {
        isPublished: true,
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {},
          tags && tags.length > 0
            ? {
                tags: {
                  some: {
                    tag: { slug: { in: tags } },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        series: { select: { id: true, title: true } },
        audioAsset: { select: { id: true, durationSeconds: true } },
        tags: { include: { tag: true } },
      },
      take: limit,
    });
  }

  /**
   * Get all available tags
   */
  async getTags() {
    return this.prisma.contentTag.findMany({
      select: { id: true, slug: true, label: true },
      orderBy: { label: 'asc' },
    });
  }

  /**
   * Get user's series progress list
   */
  async getUserProgress(userId: string) {
    return this.prisma.userSeriesProgress.findMany({
      where: { userId },
      include: {
        series: {
          select: { id: true, slug: true, title: true, estimatedDays: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Get user's in-progress series
   */
  async getActiveSeriesProgress(userId: string) {
    return this.prisma.userSeriesProgress.findMany({
      where: { userId, completed: false },
      include: {
        series: {
          select: { id: true, slug: true, title: true, estimatedDays: true },
        },
      },
      orderBy: { lastSessionAt: 'desc' },
      take: 5,
    });
  }
}
