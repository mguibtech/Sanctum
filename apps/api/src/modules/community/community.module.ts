import { Module } from '@nestjs/common';
import { ChallengeModule } from '../challenges/challenge.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [ChallengeModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
