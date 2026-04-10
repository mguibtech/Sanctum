import { Module } from '@nestjs/common';
import { BibleModule } from '../bible/bible.module';
import { XpModule } from '../xp/xp.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [BibleModule, XpModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
