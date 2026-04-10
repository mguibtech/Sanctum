import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCampaignUpdateDto } from './dto/create-campaign-update.dto';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private campaigns: CampaignsService) {}

  @Get()
  list(@Request() req: any) {
    return this.campaigns.listCampaigns(req.user.id);
  }

  @Get(':slug')
  getCampaign(@Request() req: any, @Param('slug') slug: string) {
    return this.campaigns.getCampaignBySlug(slug, req.user.id);
  }

  @Post(':id/join')
  @HttpCode(200)
  join(@Request() req: any, @Param('id') id: string) {
    return this.campaigns.joinCampaign(req.user.id, id);
  }

  @Post(':id/leave')
  @HttpCode(200)
  leave(@Request() req: any, @Param('id') id: string) {
    return this.campaigns.leaveCampaign(req.user.id, id);
  }

  @Post(':id/check-in')
  @HttpCode(200)
  checkIn(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { durationSeconds: number },
  ) {
    return this.campaigns.recordCampaignActivity(req.user.id, id, body.durationSeconds);
  }

  @Get(':id/updates')
  getUpdates(@Param('id') id: string) {
    return this.campaigns.getCampaignUpdates(id);
  }

  @Post(':id/updates')
  postUpdate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateCampaignUpdateDto,
  ) {
    return this.campaigns.postCampaignUpdate(req.user.id, id, dto);
  }

  @Get(':id/leaderboard')
  leaderboard(@Param('id') id: string) {
    return this.campaigns.getCampaignLeaderboard(id);
  }
}
