import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId },
      orderBy: { timeOfDay: 'asc' },
    });
  }

  async create(userId: string, dto: CreateReminderDto) {
    // Se routineId foi fornecido, verificar propriedade
    if (dto.routineId) {
      const routine = await this.prisma.prayerRoutine.findFirst({
        where: { id: dto.routineId, userId },
      });
      if (!routine) {
        throw new NotFoundException('Rotina não encontrada');
      }
    }

    return this.prisma.reminder.create({
      data: {
        userId,
        title: dto.title,
        timeOfDay: dto.timeOfDay,
        timezone: dto.timezone || 'UTC',
        daysOfWeek: dto.daysOfWeek || '0,1,2,3,4,5,6', // daily by default
        routineId: dto.routineId || null,
      },
    });
  }

  async getById(userId: string, id: string) {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      throw new NotFoundException('Lembrete não encontrado');
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return reminder;
  }

  async update(userId: string, id: string, dto: UpdateReminderDto) {
    // Verificar propriedade
    const existing = await this.getById(userId, id);

    // Se routineId foi alterado, verificar
    if (dto.routineId !== undefined && dto.routineId !== null) {
      const routine = await this.prisma.prayerRoutine.findFirst({
        where: { id: dto.routineId, userId },
      });
      if (!routine) {
        throw new NotFoundException('Rotina não encontrada');
      }
    }

    return this.prisma.reminder.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        timeOfDay: dto.timeOfDay ?? existing.timeOfDay,
        timezone: dto.timezone ?? existing.timezone,
        daysOfWeek: dto.daysOfWeek ?? existing.daysOfWeek,
        routineId: dto.routineId === null ? null : (dto.routineId ?? existing.routineId),
        isEnabled: dto.isEnabled ?? existing.isEnabled,
      },
    });
  }

  async delete(userId: string, id: string) {
    await this.getById(userId, id); // Verificar propriedade

    return this.prisma.reminder.delete({
      where: { id },
    });
  }

  async toggleEnabled(userId: string, id: string, isEnabled: boolean) {
    await this.getById(userId, id); // Verificar propriedade

    return this.prisma.reminder.update({
      where: { id },
      data: { isEnabled },
    });
  }
}
