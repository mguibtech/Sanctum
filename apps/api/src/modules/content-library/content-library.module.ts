import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { XpModule } from '../xp/xp.module';
import { SessionsModule } from '../sessions/sessions.module';
import { ContentLibraryService } from './content-library.service';
import { ContentLibraryController } from './content-library.controller';

@Module({
  imports: [PrismaModule, XpModule, SessionsModule],
  providers: [ContentLibraryService],
  controllers: [ContentLibraryController],
  exports: [ContentLibraryService],
})
export class ContentLibraryModule {}
