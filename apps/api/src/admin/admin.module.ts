import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

@Module({
  imports: [PrismaModule, PassportModule.register({ session: false })],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
