import { Body, Controller, Get, HttpCode, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompleteLiturgyDto } from './dto/complete-liturgy.dto';
import { LiturgyService } from './liturgy.service';

@Controller('liturgy')
@UseGuards(JwtAuthGuard)
export class LiturgyController {
  constructor(private liturgy: LiturgyService) {}

  @Get('today')
  getToday() {
    return this.liturgy.getToday();
  }

  @Get('today/completion')
  getTodayCompletion(@Request() req: any) {
    return this.liturgy.getTodayCompletion(req.user.id);
  }

  @Post('sync')
  @HttpCode(200)
  sync() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.liturgy.fetchAndSave(today);
  }

  @Post('complete')
  @HttpCode(200)
  complete(@Request() req: any, @Body() dto: CompleteLiturgyDto) {
    return this.liturgy.completeDailyLiturgy(req.user.id, dto);
  }

  @Get('debug')
  async debug() {
    return this.liturgy.debug();
  }

  @Get(':date')
  getByDate(@Param('date') dateStr: string) {
    const date = new Date(`${dateStr}T00:00:00.000Z`);
    return this.liturgy.getByDate(date);
  }
}
