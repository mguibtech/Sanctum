import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ChallengeModule } from '../challenges/challenge.module';
import { SessionsModule } from '../sessions/sessions.module';
import { XpModule } from '../xp/xp.module';
import { BibleController } from './bible.controller';
import { BibleService } from './bible.service';

@Module({
  imports: [HttpModule, XpModule, ChallengeModule, SessionsModule],
  controllers: [BibleController],
  providers: [BibleService],
  exports: [BibleService],
})
export class BibleModule {}
