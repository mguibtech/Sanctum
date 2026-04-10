import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { OnboardingDto } from './dto/onboarding.dto';

@Injectable()
export class PreferenceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create default preference profile
   */
  async getOrCreateProfile(userId: string) {
    let profile = await this.prisma.userPreferenceProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.userPreferenceProfile.create({
        data: { userId },
      });
    }

    return profile;
  }

  /**
   * Get profile with interests
   */
  async getProfile(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    const interests = await this.prisma.userInterest.findMany({
      where: { userId },
      select: { interestKey: true },
    });

    return {
      ...profile,
      interests: interests.map((i) => i.interestKey),
    };
  }

  /**
   * Update preference profile
   */
  async updateProfile(userId: string, dto: UpdatePreferenceDto) {
    await this.getOrCreateProfile(userId);

    return this.prisma.userPreferenceProfile.update({
      where: { userId },
      data: {
        preferredFormat: dto.preferredFormat,
        sessionLength: dto.sessionLength,
        focusArea: dto.focusArea,
        experienceLevel: dto.experienceLevel,
        notifyMorning: dto.notifyMorning,
        notifyNight: dto.notifyNight,
        timezone: dto.timezone,
      },
    });
  }

  /**
   * Set user interests
   */
  async setInterests(userId: string, interests: string[]) {
    // Delete existing
    await this.prisma.userInterest.deleteMany({ where: { userId } });

    // Create new
    if (interests.length > 0) {
      await this.prisma.userInterest.createMany({
        data: interests.map((key) => ({ userId, interestKey: key })),
      });
    }

    return this.getProfile(userId);
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(userId: string, dto: OnboardingDto) {
    // Create/update profile
    const profile = await this.updateProfile(userId, {
      preferredFormat: dto.preferredFormat,
      sessionLength: dto.sessionLength,
      focusArea: dto.focusArea,
      timezone: dto.timezone,
      notifyMorning: dto.notifyMorning,
      notifyNight: dto.notifyNight,
    });

    // Set interests
    await this.setInterests(userId, dto.interests);

    // Mark as completed
    await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    return this.getProfile(userId);
  }

  /**
   * Get user interests as array
   */
  async getInterests(userId: string) {
    const interests = await this.prisma.userInterest.findMany({
      where: { userId },
      select: { interestKey: true },
    });

    return interests.map((i) => i.interestKey);
  }
}
