import { Controller, Get, Post, UseGuards, Request, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RosaryService } from './rosary.service';

@Controller('rosary')
@UseGuards(JwtAuthGuard)
export class RosaryController {
  constructor(private rosary: RosaryService) {}

  @Get('today')
  getToday() {
    return this.rosary.getToday();
  }

  @Post('complete')
  @HttpCode(200)
  complete(@Request() req: any) {
    return this.rosary.complete(req.user.id);
  }
}
