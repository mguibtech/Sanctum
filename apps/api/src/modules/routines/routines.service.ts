import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import { CreateRoutineItemDto } from './dto/create-routine-item.dto';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineItemDto } from './dto/update-routine-item.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(
    private prisma: PrismaService,
    private sessions: SessionsService,
  ) {}

  private get routineDelegate() {
    return (this.prisma as any).prayerRoutine;
  }

  private get itemDelegate() {
    return (this.prisma as any).routineItem;
  }

  async list(userId: string) {
    return this.routineDelegate.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getById(userId: string, id: string) {
    const routine = await this.routineDelegate.findFirst({
      where: { id, userId },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!routine) {
      throw new NotFoundException('Rotina nao encontrada');
    }

    return routine;
  }

  async create(userId: string, dto: CreateRoutineDto) {
    return this.routineDelegate.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description ?? null,
        type: dto.type ?? 'CUSTOM',
        isDefault: dto.isDefault ?? false,
        isActive: dto.isActive ?? true,
        estimatedMinutes: dto.estimatedMinutes ?? 0,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateRoutineDto) {
    await this.ensureRoutine(userId, id);

    return this.routineDelegate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description ?? null } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.estimatedMinutes !== undefined ? { estimatedMinutes: dto.estimatedMinutes } : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.ensureRoutine(userId, id);
    await this.routineDelegate.delete({ where: { id } });
    return { deleted: true };
  }

  async addItem(userId: string, routineId: string, dto: CreateRoutineItemDto) {
    await this.ensureRoutine(userId, routineId);

    const metadataJson =
      dto.metadataJson === undefined ? null : JSON.stringify(dto.metadataJson);

    const item = await this.itemDelegate.create({
      data: {
        routineId,
        position: dto.position,
        itemType: dto.itemType,
        targetId: dto.targetId ?? null,
        title: dto.title,
        estimatedMinutes: dto.estimatedMinutes ?? 0,
        metadataJson,
      },
    });

    await this.recalculateEstimatedMinutes(routineId);
    return item;
  }

  async updateItem(userId: string, routineId: string, itemId: string, dto: UpdateRoutineItemDto) {
    await this.ensureRoutine(userId, routineId);
    const existing = await this.itemDelegate.findFirst({
      where: { id: itemId, routineId },
    });
    if (!existing) {
      throw new NotFoundException('Item da rotina nao encontrado');
    }

    const updated = await this.itemDelegate.update({
      where: { id: itemId },
      data: {
        ...(dto.position !== undefined ? { position: dto.position } : {}),
        ...(dto.itemType !== undefined ? { itemType: dto.itemType } : {}),
        ...(dto.targetId !== undefined ? { targetId: dto.targetId ?? null } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.estimatedMinutes !== undefined ? { estimatedMinutes: dto.estimatedMinutes } : {}),
        ...(dto.metadataJson !== undefined
          ? { metadataJson: dto.metadataJson === null ? null : JSON.stringify(dto.metadataJson) }
          : {}),
      },
    });

    await this.recalculateEstimatedMinutes(routineId);
    return updated;
  }

  async removeItem(userId: string, routineId: string, itemId: string) {
    await this.ensureRoutine(userId, routineId);
    const existing = await this.itemDelegate.findFirst({
      where: { id: itemId, routineId },
    });
    if (!existing) {
      throw new NotFoundException('Item da rotina nao encontrado');
    }

    await this.itemDelegate.delete({ where: { id: itemId } });
    await this.recalculateEstimatedMinutes(routineId);
    return { deleted: true };
  }

  async complete(userId: string, routineId: string) {
    const routine = await this.getById(userId, routineId);
    const estimatedMinutes =
      routine.estimatedMinutes ||
      routine.items.reduce((sum: number, item: any) => sum + (item.estimatedMinutes ?? 0), 0);

    const session = await this.sessions.completeRoutineSession(userId, routineId, estimatedMinutes);

    return {
      routineId,
      session,
      estimatedMinutes,
      itemsCompleted: routine.items.length,
    };
  }

  private async ensureRoutine(userId: string, routineId: string) {
    const routine = await this.routineDelegate.findFirst({
      where: { id: routineId, userId },
      select: { id: true },
    });
    if (!routine) {
      throw new NotFoundException('Rotina nao encontrada');
    }
  }

  private async recalculateEstimatedMinutes(routineId: string) {
    const items = await this.itemDelegate.findMany({
      where: { routineId },
      select: { estimatedMinutes: true },
    });

    const estimatedMinutes = items.reduce(
      (sum: number, item: { estimatedMinutes?: number }) => sum + (item.estimatedMinutes ?? 0),
      0,
    );

    await this.routineDelegate.update({
      where: { id: routineId },
      data: { estimatedMinutes },
    });
  }
}
