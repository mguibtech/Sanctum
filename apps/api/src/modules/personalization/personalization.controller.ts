import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { OnboardingDto } from './dto/onboarding.dto';
import { PreferenceService } from './preference.service';
import { RecommendationService } from './recommendation.service';

@Controller('personalization')
@UseGuards(JwtAuthGuard)
export class PersonalizationController {
  constructor(
    private preference: PreferenceService,
    private recommendation: RecommendationService,
  ) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.preference.getProfile(req.user.id);
  }

  @Post('profile')
  createProfile(@Request() req: any, @Body() dto: UpdatePreferenceDto) {
    return this.preference.updateProfile(req.user.id, dto);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdatePreferenceDto) {
    return this.preference.updateProfile(req.user.id, dto);
  }

  @Get('interests')
  getInterests(@Request() req: any) {
    return this.preference.getInterests(req.user.id);
  }

  @Patch('interests')
  setInterests(@Request() req: any, @Body() body: { interests: string[] }) {
    return this.preference.setInterests(req.user.id, body.interests);
  }

  @Get('recommendations')
  getRecommendations(@Request() req: any) {
    return this.recommendation.getRecommendations(req.user.id);
  }

  @Post('recommendations/refresh')
  @HttpCode(200)
  refreshRecommendations(@Request() req: any) {
    return this.recommendation.generateRecommendations(req.user.id);
  }

  @Get('recommendations/next-action')
  getNextAction(@Request() req: any) {
    return this.recommendation.getNextBestAction(req.user.id);
  }

  @Post('recommendations/:id/consume')
  @HttpCode(200)
  consumeRecommendation(@Request() req: any, @Request('id') id: string) {
    return this.recommendation.markAsConsumed(id);
  }
}
