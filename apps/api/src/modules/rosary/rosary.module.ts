import { Module } from '@nestjs/common';
import { RosaryController } from './rosary.controller';
import { RosaryService } from './rosary.service';
import { StreakModule } from '../streak/streak.module';

@Module({
  imports: [StreakModule],
  controllers: [RosaryController],
  providers: [RosaryService],
})
export class RosaryModule {}
