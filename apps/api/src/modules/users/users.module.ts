import { Module } from '@nestjs/common';
import { BibleModule } from '../bible/bible.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [BibleModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
