import { Body, Controller, Get, HttpCode, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinishSessionDto } from './dto/finish-session.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post('start')
  start(@Request() req: any, @Body() dto: StartSessionDto) {
    return this.sessions.start(req.user.id, dto);
  }

  @Post(':id/complete')
  @HttpCode(200)
  complete(@Request() req: any, @Param('id') id: string, @Body() dto: FinishSessionDto) {
    return this.sessions.complete(req.user.id, id, dto);
  }

  @Post(':id/abandon')
  @HttpCode(200)
  abandon(@Request() req: any, @Param('id') id: string, @Body() dto: FinishSessionDto) {
    return this.sessions.abandon(req.user.id, id, dto);
  }

  @Get('history')
  history(@Request() req: any, @Query('limit') limit?: string) {
    return this.sessions.history(req.user.id, limit ? Number(limit) : 20);
  }

  @Get('summary')
  summary(@Request() req: any, @Query('days') days?: string) {
    return this.sessions.summary(req.user.id, days ? Math.min(Number(days), 31) : 7);
  }
}
