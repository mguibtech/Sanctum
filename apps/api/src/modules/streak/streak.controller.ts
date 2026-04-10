import { Controller, Post, Get, Query, UseGuards, Request, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StreakService } from './streak.service';

@Controller('streak')
@UseGuards(JwtAuthGuard)
export class StreakController {
  constructor(private streak: StreakService) {}

  @Post('check-in')
  @HttpCode(200)
  checkIn(@Request() req: any) {
    return this.streak.checkIn(req.user.id);
  }

  @Get('me')
  getMyStreak(@Request() req: any) {
    return this.streak.getMyStreak(req.user.id);
  }

  @Post('use-shield')
  @HttpCode(200)
  useShield(@Request() req: any) {
    return this.streak.useShield(req.user.id);
  }

  @Get('ranking')
  getRanking(@Request() req: any, @Query('metric') metric?: string, @Query('period') period?: string) {
    const validMetric =
      (['streak', 'xp', 'bible', 'contemplation'] as const).find((m) => m === metric) ?? 'streak';
    const validPeriod = (['week', 'month', 'allTime'] as const).find((p) => p === period) ?? 'allTime';
    return this.streak.getRanking(req.user.id, validMetric, validPeriod);
  }
}
