import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { WorkspacesService } from './workspaces.service.js';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get('me')
  getCurrentWorkspace(@CurrentUser() user: AuthenticatedUser) {
    return this.workspacesService.getOwnedWorkspaceOrThrow(user.userId);
  }

  @Patch('me')
  updateCurrentWorkspace(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.updateOwnedWorkspace(user.userId, dto.name);
  }
}
