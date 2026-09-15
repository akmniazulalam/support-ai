import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SubscriptionPlan,
  SubscriptionStatus,
  type Subscription,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  getUtcCalendarMonthPeriod,
  type BillingPeriod,
} from './billing-period.js';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentSubscription(workspaceId: string): Promise<Subscription> {
    return this.prisma.$transaction((tx) =>
      this.getCurrentSubscriptionInTransaction(tx, workspaceId),
    );
  }

  async getCurrentSubscriptionInTransaction(
    prisma: Prisma.TransactionClient,
    workspaceId: string,
  ): Promise<Subscription> {
    const subscription = await this.ensureDefaultSubscriptionInTransaction(
      prisma,
      workspaceId,
    );

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return subscription;
    }

    const currentPeriod = getUtcCalendarMonthPeriod();
    if (
      subscription.currentPeriodStart.getTime() ===
        currentPeriod.start.getTime() &&
      subscription.currentPeriodEnd.getTime() === currentPeriod.end.getTime()
    ) {
      return subscription;
    }

    return prisma.subscription.update({
      where: { workspaceId },
      data: {
        currentPeriodStart: currentPeriod.start,
        currentPeriodEnd: currentPeriod.end,
      },
    });
  }

  async ensureDefaultSubscription(workspaceId: string): Promise<Subscription> {
    return this.prisma.$transaction((tx) =>
      this.ensureDefaultSubscriptionInTransaction(tx, workspaceId),
    );
  }

  ensureDefaultSubscriptionInTransaction(
    prisma: Prisma.TransactionClient,
    workspaceId: string,
    period: BillingPeriod = getUtcCalendarMonthPeriod(),
  ): Promise<Subscription> {
    return prisma.subscription.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
      },
      update: {},
    });
  }
}
