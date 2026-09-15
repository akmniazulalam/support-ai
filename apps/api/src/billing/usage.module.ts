import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SubscriptionModule } from './subscription.module.js';
import { UsageService } from './usage.service.js';

@Module({
  imports: [PrismaModule, SubscriptionModule],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
