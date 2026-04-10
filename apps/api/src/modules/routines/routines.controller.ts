import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoutineItemDto } from './dto/create-routine-item.dto';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineItemDto } from './dto/update-routine-item.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutinesService } from './routines.service';

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutinesController {
  constructor(private readonly routines: RoutinesService) {}

  @Get()
  list(@Request() req: any) {
    return this.routines.list(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateRoutineDto) {
    return this.routines.create(req.user.id, dto);
  }

  @Get(':id')
  getById(@Request() req: any, @Param('id') id: string) {
    return this.routines.getById(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateRoutineDto) {
    return this.routines.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.routines.remove(req.user.id, id);
  }

  @Post(':id/items')
  addItem(@Request() req: any, @Param('id') id: string, @Body() dto: CreateRoutineItemDto) {
    return this.routines.addItem(req.user.id, id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Request() req: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateRoutineItemDto,
  ) {
    return this.routines.updateItem(req.user.id, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(200)
  removeItem(@Request() req: any, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.routines.removeItem(req.user.id, id, itemId);
  }

  @Post(':id/complete')
  @HttpCode(200)
  complete(@Request() req: any, @Param('id') id: string) {
    return this.routines.complete(req.user.id, id);
  }
}
