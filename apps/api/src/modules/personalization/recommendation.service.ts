import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PreferenceService } from './preference.service';

@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaService,
    private preference: PreferenceService,
  ) {}

  /**
   * Get user's current recommendations
   */
  async getRecommendations(userId: string, limit = 10) {
    const unconsumed = await this.prisma.recommendationQueue.findMany({
      where: {
        userId,
        consumedAt: null,
      },
      orderBy: { score: 'desc' },
      take: limit,
    });

    return unconsumed;
  }

  /**
   * Mark recommendation as consumed
   */
  async markAsConsumed(recommendationId: string) {
    return this.prisma.recommendationQueue.update({
      where: { id: recommendationId },
      data: { consumedAt: new Date() },
    });
  }

  /**
   * Get next best action (single highest-scored recommendation)
   */
  async getNextBestAction(userId: string) {
    const recs = await this.getRecommendations(userId, 1);
    return recs[0] || null;
  }

  /**
   * Generate recommendations (basic rule-based engine)
   */
  async generateRecommendations(userId: string) {
    // Get user profile
    const profile = await this.preference.getProfile(userId);
    const interests = profile.interests;

    // Collect all candidates
    const candidates: any[] = [];

    // 1. Featured guided sessions matching preferences
    const guidedSessions = await this.prisma.contentSession.findMany({
      where: { isPublished: true },
      include: { series: true },
      take: 5,
    });

    candidates.push(
      ...guidedSessions.map((s) => ({
        type: 'SESSION',
        id: s.id,
        name: s.title,
        seriesName: s.series.title,
        score: this.scoreGuidedSession(s, profile),
        reason: 'GUIDED_SESSION_MATCH',
      })),
    );

    // 2. Content series matching focus area
    const series = await this.prisma.contentSeries.findMany({
      where: { isPublished: true },
      take: 5,
    });

    candidates.push(
      ...series.map((s) => ({
        type: 'SERIES',
        id: s.id,
        name: s.title,
        score: this.scoreContentSeries(s, profile),
        reason: 'SERIES_MATCH',
      })),
    );

    // 3. Active campaigns
    const now = new Date();
    const campaigns = await this.prisma.prayerCampaign.findMany({
      where: {
        isPublished: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      take: 3,
    });

    candidates.push(
      ...campaigns.map((c) => ({
        type: 'CAMPAIGN',
        id: c.id,
        name: c.title,
        score: this.scoreCampaign(c, interests),
        reason: 'CAMPAIGN_ACTIVE',
      })),
    );

    // Sort by score and take top N
    const topN = 10;
    const recommended = candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    // Clear old recommendations and create new ones
    await this.prisma.recommendationQueue.deleteMany({
      where: { userId, consumedAt: null },
    });

    const created = await Promise.all(
      recommended.map((rec) =>
        this.prisma.recommendationQueue.create({
          data: {
            userId,
            recommendationType: rec.type,
            targetId: rec.id,
            reasonKey: rec.reason,
            score: rec.score,
          },
        }),
      ),
    );

    return created;
  }

  /**
   * Score a guided session
   */
  private scoreGuidedSession(session: any, profile: any): number {
    let score = 0;

    // Match on session type / focus area
    if (
      session.sessionType.toUpperCase().includes(profile.focusArea) ||
      profile.focusArea.includes(session.sessionType)
    ) {
      score += 30;
    }

    // Match on duration and sessionLength preference
    const durationMinutes = Math.floor(session.durationSeconds / 60);
    if (profile.sessionLength === 'SHORT' && durationMinutes < 15) score += 20;
    if (profile.sessionLength === 'MEDIUM' && durationMinutes >= 15 && durationMinutes <= 30) score += 20;
    if (profile.sessionLength === 'LONG' && durationMinutes > 30) score += 20;

    // Has audio (matches audio preference)
    if (session.audioAsset && profile.preferredFormat !== 'TEXT') score += 15;

    // For night sessions if user prefers night
    if (session.sessionType === 'SLEEP' && profile.notifyNight) score += 10;

    return score;
  }

  /**
   * Score a content series
   */
  private scoreContentSeries(series: any, profile: any): number {
    let score = 0;

    // Match on category and focus area
    if (series.category === profile.focusArea) score += 25;

    // Match on difficulty level
    if (series.level === profile.experienceLevel) score += 20;

    // Beginner-friendly gets boost for new users
    if (series.level === 'BEGINNER' && profile.experienceLevel === 'BEGINNER') score += 10;

    return score;
  }

  /**
   * Score a campaign
   */
  private scoreCampaign(campaign: any, interests: string[]): number {
    let score = 10; // Base score for being active

    // Match on category/interests
    if (interests.includes(campaign.category)) score += 30;

    // Recent campaigns get boost
    const daysOld = (Date.now() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 7) score += 15;

    return score;
  }
}
