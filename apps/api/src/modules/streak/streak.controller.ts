import { Controller, Post, Get, UseGuards, Request, HttpCode } from '@nestjs/common';
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
  getRanking() {
    return this.streak.getRanking();
  }
}
