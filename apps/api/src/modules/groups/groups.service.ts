import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all visible groups (or user's own groups)
   */
  async listGroups(userId?: string, visibility = 'PUBLIC') {
    return this.prisma.communityGroup.findMany({
      where: {
        visibility: visibility as any,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Get user's groups (groups they're a member of)
   */
  async getUserGroups(userId: string) {
    const memberships = await this.prisma.communityGroupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            createdBy: { select: { id: true, name: true, avatar: true } },
            _count: { select: { members: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.group,
      userRole: m.role,
      userMemberId: m.id,
    }));
  }

  /**
   * Get group by ID with members
   */
  async getGroupById(id: string, userId?: string) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        members: userId
          ? {
              where: { userId },
            }
          : false,
        _count: { select: { members: true } },
      },
    });

    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    return {
      ...group,
      userIsMember: userId && group.members.length > 0,
      userMembership: userId ? group.members[0] : null,
    };
  }

  /**
   * Create a new group
   */
  async createGroup(userId: string, dto: CreateGroupDto) {
    const group = await this.prisma.communityGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        visibility: dto.visibility || 'PUBLIC',
        parishId: dto.parishId,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Creator is automatically added as LEADER
    await this.prisma.communityGroupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'LEADER',
      },
    });

    return group;
  }

  /**
   * Update group (creator/leader only)
   */
  async updateGroup(userId: string, groupId: string, dto: UpdateGroupDto) {
    const group = await this.getGroupById(groupId, userId);

    // Check if user is leader
    if (
      group.createdById !== userId &&
      group.userMembership?.role !== 'LEADER'
    ) {
      throw new ForbiddenException('Apenas o criador ou líder pode atualizar o grupo');
    }

    return this.prisma.communityGroup.update({
      where: { id: groupId },
      data: dto,
    });
  }

  /**
   * Delete group (creator only)
   */
  async deleteGroup(userId: string, groupId: string) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { id: groupId },
    });

    if (!group || group.createdById !== userId) {
      throw new ForbiddenException('Apenas o criador pode deletar o grupo');
    }

    return this.prisma.communityGroup.delete({
      where: { id: groupId },
    });
  }

  /**
   * Join a group
   */
  async joinGroup(userId: string, groupId: string) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    // Check if already a member
    const existing = await this.prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.communityGroupMember.create({
      data: { groupId, userId, role: 'MEMBER' },
    });
  }

  /**
   * Leave a group
   */
  async leaveGroup(userId: string, groupId: string) {
    const membership = await this.prisma.communityGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership) {
      throw new NotFoundException('Você não é membro deste grupo');
    }

    // Don't allow leader to leave without reassigning
    if (membership.role === 'LEADER') {
      throw new ForbiddenException('O líder não pode sair do grupo');
    }

    return this.prisma.communityGroupMember.delete({
      where: { id: membership.id },
    });
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string) {
    return this.prisma.communityGroupMember.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  /**
   * Change member role (leader only)
   */
  async changeMemberRole(userId: string, groupId: string, memberId: string, newRole: string) {
    const group = await this.prisma.communityGroup.findUnique({
      where: { id: groupId },
    });

    if (group?.createdById !== userId) {
      throw new ForbiddenException('Apenas o criador pode mudar roles');
    }

    return this.prisma.communityGroupMember.update({
      where: { id: memberId },
      data: { role: newRole as any },
    });
  }
}
