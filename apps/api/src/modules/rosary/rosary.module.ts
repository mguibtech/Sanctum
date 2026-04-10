import { Module } from '@nestjs/common';
import { XpModule } from '../xp/xp.module';
import { StreakModule } from '../streak/streak.module';
import { ChallengeModule } from '../challenges/challenge.module';
import { SessionsModule } from '../sessions/sessions.module';
import { RosaryController } from './rosary.controller';
import { RosaryService } from './rosary.service';

@Module({
  imports: [StreakModule, XpModule, ChallengeModule, SessionsModule],
  controllers: [RosaryController],
  providers: [RosaryService],
})
export class RosaryModule {}
