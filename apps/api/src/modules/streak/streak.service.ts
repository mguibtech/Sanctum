import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StreakService {
  constructor(private prisma: PrismaService) {}

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

    // Já fez check-in hoje — sem alterações
    if (lastActivity && lastActivity.getTime() === today.getTime()) {
      return streak;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = streak.currentStreak;
    let newShields = streak.shields;

    if (!lastActivity || lastActivity < yesterday) {
      // Perdeu um dia — verifica se tem escudo
      if (newShields > 0 && lastActivity) {
        newShields -= 1; // usa escudo
        newStreak += 1;
      } else {
        newStreak = 1; // reinicia streak
      }
    } else {
      // Fez check-in no dia seguinte — incrementa
      newStreak += 1;
    }

    // Ganha escudo a cada 7 dias (máx 2 escudos)
    if (newStreak % 7 === 0 && newShields < 2) {
      newShields += 1;
    }

    const longestStreak = Math.max(streak.longestStreak, newStreak);

    return this.prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        shields: newShields,
        lastActivityAt: now,
      },
    });
  }

  async getMyStreak(userId: string) {
    return this.prisma.streak.findUnique({ where: { userId } });
  }

  async useShield(userId: string) {
    const streak = await this.prisma.streak.findUnique({ where: { userId } });
    if (!streak || streak.shields <= 0) {
      throw new BadRequestException('Nenhum escudo disponível');
    }
    return this.prisma.streak.update({
      where: { userId },
      data: { shields: { decrement: 1 } },
    });
  }

  async getRanking() {
    // Top 20 usuários por streak atual (simplificado — Redis para escala)
    return this.prisma.streak.findMany({
      take: 20,
      orderBy: { currentStreak: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  }
}
