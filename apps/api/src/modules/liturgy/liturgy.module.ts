import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BibleModule } from '../bible/bible.module';
import { LiturgyController } from './liturgy.controller';
import { LiturgyService } from './liturgy.service';
import { LiturgyCronService } from './liturgy.cron.service';

@Module({
  imports: [HttpModule, BibleModule],
  controllers: [LiturgyController],
  providers: [LiturgyService, LiturgyCronService],
  exports: [LiturgyService],
})
export class LiturgyModule {}
