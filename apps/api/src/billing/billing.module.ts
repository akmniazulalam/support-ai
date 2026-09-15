import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { BILLING_PROVIDER } from './billing-provider.interface.js';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';
import { DevelopmentBillingProvider } from './development-billing.provider.js';
import { SubscriptionModule } from './subscription.module.js';
import { UsageModule } from './usage.module.js';

@Module({
  imports: [
    WorkspacesModule,
    PrismaModule,
    SubscriptionModule,
    UsageModule,
    PassportModule.register({ session: false }),
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    DevelopmentBillingProvider,
    {
      provide: BILLING_PROVIDER,
      useExisting: DevelopmentBillingProvider,
    },
  ],
})
export class BillingModule {}
