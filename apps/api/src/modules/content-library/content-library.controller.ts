import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompleteSessionDto } from './dto/complete-session.dto';
import { StartSeriesDto } from './dto/start-series.dto';
import { ContentLibraryService } from './content-library.service';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentLibraryController {
  constructor(private library: ContentLibraryService) {}

  @Get('featured')
  featured(@Query('limit') limit?: string) {
    return this.library.getFeatured(limit ? Number(limit) : 5);
  }

  @Get('series')
  browseSeries(
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('limit') limit?: string,
  ) {
    return this.library.browseSeries(
      { category, level },
      limit ? Number(limit) : 50,
    );
  }

  @Get('series/:slug')
  getSeries(@Request() req: any, @Param('slug') slug: string) {
    // Find by slug
    return this.library.getSeriesWithProgress(req.user.id, slug);
  }

  @Post('series/:id/start')
  @HttpCode(200)
  startSeries(@Request() req: any, @Param('id') id: string, @Body() dto: StartSeriesDto) {
    return this.library.startSeries(req.user.id, dto.seriesId ?? id);
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.library.getSession(id);
  }

  @Post('sessions/:id/complete')
  @HttpCode(200)
  completeSession(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CompleteSessionDto,
  ) {
    return this.library.completeSession(req.user.id, id, dto);
  }

  @Get('search')
  search(
    @Request() req: any,
    @Query('q') q?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit?: string,
  ) {
    const tagList = tags ? tags.split(',') : undefined;
    return this.library.searchSessions(q, tagList, limit ? Number(limit) : 20);
  }

  @Get('tags')
  getTags() {
    return this.library.getTags();
  }

  @Get('progress')
  getProgress(@Request() req: any) {
    return this.library.getUserProgress(req.user.id);
  }

  @Get('progress/active')
  getActiveProgress(@Request() req: any) {
    return this.library.getActiveSeriesProgress(req.user.id);
  }
}
