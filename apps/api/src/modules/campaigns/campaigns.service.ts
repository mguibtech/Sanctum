import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateCampaignUpdateDto } from './dto/create-campaign-update.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all published campaigns or campaigns hosted by user
   */
  async listCampaigns(userId?: string, published = true) {
    return this.prisma.prayerCampaign.findMany({
      where: {
        isPublished: published ? true : undefined,
      },
      include: {
        _count: { select: { participants: true, updates: true } },
      },
      orderBy: { startDate: 'desc' },
      take: 50,
    });
  }

  /**
   * Get campaign by slug with participant count and user status
   */
  async getCampaignBySlug(slug: string, userId?: string) {
    const campaign = await this.prisma.prayerCampaign.findUnique({
      where: { slug },
      include: {
        participants: userId ? { where: { userId } } : false,
        _count: { select: { participants: true } },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    return {
      ...campaign,
      userIsParticipant: userId && campaign.participants.length > 0,
      userParticipation: userId ? campaign.participants[0] : null,
    };
  }

  /**
   * Join a campaign
   */
  async joinCampaign(userId: string, campaignId: string) {
    const campaign = await this.prisma.prayerCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    // Check if already joined
    const existing = await this.prisma.prayerCampaignParticipant.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.prayerCampaignParticipant.create({
      data: { campaignId, userId },
    });
  }

  /**
   * Leave a campaign
   */
  async leaveCampaign(userId: string, campaignId: string) {
    const participant = await this.prisma.prayerCampaignParticipant.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
    });

    if (!participant) {
      throw new NotFoundException('Você não participa desta campanha');
    }

    return this.prisma.prayerCampaignParticipant.delete({
      where: { id: participant.id },
    });
  }

  /**
   * Record a prayer/session in the campaign
   */
  async recordCampaignActivity(
    userId: string,
    campaignId: string,
    sessionDurationSeconds: number,
  ) {
    const participant = await this.prisma.prayerCampaignParticipant.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
    });

    if (!participant) {
      throw new ForbiddenException('Você não participa desta campanha');
    }

    // Check if new day completed (simple: compare dates)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const lastActivityDate = participant.lastActivityAt
      ? new Date(participant.lastActivityAt)
      : null;
    lastActivityDate?.setUTCHours(0, 0, 0, 0);

    const isNewDay =
      !lastActivityDate || lastActivityDate.getTime() < today.getTime();

    return this.prisma.prayerCampaignParticipant.update({
      where: { id: participant.id },
      data: {
        totalSessions: { increment: 1 },
        daysCompleted: isNewDay ? { increment: 1 } : undefined,
        lastActivityAt: new Date(),
      },
    });
  }

  /**
   * Get campaign updates
   */
  async getCampaignUpdates(campaignId: string, limit = 20) {
    return this.prisma.prayerCampaignUpdate.findMany({
      where: { campaignId },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Post an update (campaign creator/admin only)
   */
  async postCampaignUpdate(
    userId: string,
    campaignId: string,
    dto: CreateCampaignUpdateDto,
  ) {
    const campaign = await this.prisma.prayerCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    // For now, allow any participant to post
    // TODO: restrict to campaign creator/moderators
    const isParticipant = await this.prisma.prayerCampaignParticipant.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
    });

    if (!isParticipant) {
      throw new ForbiddenException('Apenas participantes podem postar atualizações');
    }

    return this.prisma.prayerCampaignUpdate.create({
      data: {
        campaignId,
        authorId: userId,
        body: dto.body,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  /**
   * Get campaign leaderboard
   */
  async getCampaignLeaderboard(campaignId: string, limit = 20) {
    return this.prisma.prayerCampaignParticipant.findMany({
      where: { campaignId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: [
        { daysCompleted: 'desc' },
        { totalSessions: 'desc' },
        { joinedAt: 'asc' },
      ],
      take: limit,
    });
  }
}
