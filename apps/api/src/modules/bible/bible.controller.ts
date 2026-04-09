import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BibleService } from './bible.service';
import { SaveProgressDto } from './dto/save-progress.dto';

@Controller('bible')
@UseGuards(JwtAuthGuard)
export class BibleController {
  constructor(private bible: BibleService) {}

  @Get('books')
  getBooks() {
    return this.bible.getBooks();
  }

  @Get('books/:bookId/chapters')
  getChapters(@Param('bookId') bookId: string) {
    return this.bible.getChapters(bookId);
  }

  @Get('books/:bookId/chapters/:num')
  getChapter(@Param('bookId') bookId: string, @Param('num') num: string) {
    return this.bible.getChapter(bookId, Number(num));
  }

  @Post('progress')
  saveProgress(@Request() req: any, @Body() dto: SaveProgressDto) {
    return this.bible.saveProgress(
      req.user.id,
      dto.bookId,
      dto.bookName,
      dto.chapterNum,
      dto.contemplated ?? false,
      dto.verseStart,
      dto.verseEnd,
    );
  }

  @Get('progress')
  getProgress(@Request() req: any) {
    return this.bible.getProgress(req.user.id);
  }
}
