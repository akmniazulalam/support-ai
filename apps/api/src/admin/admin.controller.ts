import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { AdminService } from './admin.service.js';
import { AdminSearchPaginationQueryDto } from './dto/admin-search-pagination-query.dto.js';
import { AdminSubscriptionsQueryDto } from './dto/admin-subscriptions-query.dto.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('users')
  getUsers(@Query() query: AdminSearchPaginationQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('workspaces')
  getWorkspaces(@Query() query: AdminSearchPaginationQueryDto) {
    return this.adminService.getWorkspaces(query);
  }

  @Get('subscriptions')
  getSubscriptions(@Query() query: AdminSubscriptionsQueryDto) {
    return this.adminService.getSubscriptions(query);
  }
}
