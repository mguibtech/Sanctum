import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BibleService } from '../bible/bible.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private bible: BibleService,
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
    const [streak, bibleProgress] = await Promise.all([
      this.prisma.streak.findUnique({ where: { userId } }),
      this.bible.getProgress(userId),
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
    };
  }
}
