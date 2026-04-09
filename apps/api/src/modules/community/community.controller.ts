import { Controller, Get, Post, Param, Body, Query, UseGuards, Request, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityService } from './community.service';
import { CreatePrayerRequestDto } from './dto/create-prayer-request.dto';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private community: CommunityService) {}

  @Get('prayers')
  getPrayerRequests(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.community.getPrayerRequests(Number(page), Number(limit));
  }

  @Post('prayers')
  createPrayerRequest(@Request() req: any, @Body() dto: CreatePrayerRequestDto) {
    return this.community.createPrayerRequest(req.user.id, dto);
  }

  @Post('prayers/:id/pray')
  @HttpCode(200)
  pray(@Request() req: any, @Param('id') id: string) {
    return this.community.pray(req.user.id, id);
  }

  @Post('prayers/:id/report')
  @HttpCode(200)
  report(@Request() req: any, @Param('id') id: string) {
    return this.community.report(req.user.id, id);
  }
}
