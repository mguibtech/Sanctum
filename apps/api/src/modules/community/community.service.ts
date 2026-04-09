import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrayerRequestDto } from './dto/create-prayer-request.dto';

const REPORT_THRESHOLD = 3; // oculta automaticamente ao atingir este número

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async getPrayerRequests(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.prayerRequest.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async createPrayerRequest(userId: string, dto: CreatePrayerRequestDto) {
    return this.prisma.prayerRequest.create({
      data: {
        userId,
        content: dto.content,
        isAnonymous: dto.isAnonymous ?? false,
      },
    });
  }

  async pray(userId: string, prayerRequestId: string) {
    const request = await this.prisma.prayerRequest.findUnique({
      where: { id: prayerRequestId },
    });
    if (!request) throw new NotFoundException('Pedido não encontrado');

    // Tenta registrar a ação (unique constraint evita duplicata)
    try {
      await this.prisma.prayerAction.create({
        data: { userId, prayerRequestId },
      });
      return this.prisma.prayerRequest.update({
        where: { id: prayerRequestId },
        data: { prayerCount: { increment: 1 } },
      });
    } catch {
      // Usuário já rezou por este pedido — sem alterações
      return request;
    }
  }

  async report(userId: string, prayerRequestId: string) {
    const request = await this.prisma.prayerRequest.findUnique({
      where: { id: prayerRequestId },
    });
    if (!request) throw new NotFoundException('Pedido não encontrado');

    try {
      await this.prisma.report.create({
        data: { userId, prayerRequestId },
      });
    } catch {
      // Usuário já reportou — ignora silenciosamente
      return;
    }

    const newCount = request.reportCount + 1;
    await this.prisma.prayerRequest.update({
      where: { id: prayerRequestId },
      data: {
        reportCount: { increment: 1 },
        isHidden: newCount >= REPORT_THRESHOLD,
      },
    });
  }

  // Para o painel admin
  async getReportedQueue() {
    return this.prisma.prayerRequest.findMany({
      where: { isHidden: true },
      orderBy: { reportCount: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async restore(id: string) {
    return this.prisma.prayerRequest.update({
      where: { id },
      data: { isHidden: false, reportCount: 0 },
    });
  }
}
