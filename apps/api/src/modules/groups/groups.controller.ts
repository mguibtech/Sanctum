import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Get('browse')
  browse(@Query('visibility') visibility?: string) {
    return this.groups.listGroups(undefined, visibility || 'PUBLIC');
  }

  @Get('my')
  myGroups(@Request() req: any) {
    return this.groups.getUserGroups(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateGroupDto) {
    return this.groups.createGroup(req.user.id, dto);
  }

  @Get(':id')
  getById(@Request() req: any, @Param('id') id: string) {
    return this.groups.getGroupById(id, req.user.id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groups.updateGroup(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Request() req: any, @Param('id') id: string) {
    return this.groups.deleteGroup(req.user.id, id);
  }

  @Post(':id/join')
  @HttpCode(200)
  join(@Request() req: any, @Param('id') id: string) {
    return this.groups.joinGroup(req.user.id, id);
  }

  @Post(':id/leave')
  @HttpCode(200)
  leave(@Request() req: any, @Param('id') id: string) {
    return this.groups.leaveGroup(req.user.id, id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.groups.getGroupMembers(id);
  }

  @Patch(':id/members/:memberId/role')
  changeMemberRole(
    @Request() req: any,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() body: { role: string },
  ) {
    return this.groups.changeMemberRole(req.user.id, id, memberId, body.role);
  }
}
