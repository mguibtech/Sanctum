import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChallengeService } from './challenge.service';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengeController {
  constructor(private challenges: ChallengeService) {}

  @Get('weekly')
  getWeekly(@Request() req: any) {
    return this.challenges.getWeeklyChallenges(req.user.id);
  }
}
