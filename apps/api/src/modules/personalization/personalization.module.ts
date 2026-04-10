import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PreferenceService } from './preference.service';
import { RecommendationService } from './recommendation.service';
import { PersonalizationController } from './personalization.controller';

@Module({
  imports: [PrismaModule],
  providers: [PreferenceService, RecommendationService],
  controllers: [PersonalizationController],
  exports: [PreferenceService, RecommendationService],
})
export class PersonalizationModule {}
