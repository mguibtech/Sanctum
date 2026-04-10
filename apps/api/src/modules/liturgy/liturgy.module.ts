import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BibleModule } from '../bible/bible.module';
import { XpModule } from '../xp/xp.module';
import { ChallengeModule } from '../challenges/challenge.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LiturgyController } from './liturgy.controller';
import { LiturgyService } from './liturgy.service';
import { LiturgyCronService } from './liturgy.cron.service';

@Module({
  imports: [HttpModule, BibleModule, XpModule, ChallengeModule, SessionsModule],
  controllers: [LiturgyController],
  providers: [LiturgyService, LiturgyCronService],
  exports: [LiturgyService],
})
export class LiturgyModule {}
