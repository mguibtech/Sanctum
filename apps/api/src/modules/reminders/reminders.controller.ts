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
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersService } from './reminders.service';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Get()
  list(@Request() req: any) {
    return this.reminders.list(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateReminderDto) {
    return this.reminders.create(req.user.id, dto);
  }

  @Get(':id')
  getById(@Request() req: any, @Param('id') id: string) {
    return this.reminders.getById(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateReminderDto) {
    return this.reminders.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Request() req: any, @Param('id') id: string) {
    return this.reminders.delete(req.user.id, id);
  }

  @Patch(':id/toggle')
  @HttpCode(200)
  toggle(@Request() req: any, @Param('id') id: string, @Body() body: { isEnabled: boolean }) {
    return this.reminders.toggleEnabled(req.user.id, id, body.isEnabled);
  }
}
