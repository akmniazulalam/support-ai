import { Injectable } from '@nestjs/common';
import {
  Prisma,
  type Subscription,
  type UsageRecord,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { getAiMessageLimit } from './plan-limits.js';
import { AiUsageLimitReachedException } from './ai-usage-limit-reached.exception.js';
import { SubscriptionService } from './subscription.service.js';

export interface CurrentUsage {
  subscription: Subscription;
  usage: UsageRecord;
  aiMessageLimit: number;
}

export interface AiMessageUsageReservation {
  usageRecordId: string;
  plan: Subscription['plan'];
  limit: number;
}

@Injectable()
export class UsageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async getCurrentUsage(workspaceId: string): Promise<CurrentUsage> {
    const subscription =
      await this.subscriptionService.getCurrentSubscription(workspaceId);
    const usage = await this.getOrCreateUsageRecord(
      workspaceId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
    );

    return {
      subscription,
      usage,
      aiMessageLimit: getAiMessageLimit(subscription.plan),
    };
  }

  async hasAvailableAiMessage(workspaceId: string): Promise<boolean> {
    const { usage, aiMessageLimit } = await this.getCurrentUsage(workspaceId);

    return usage.aiMessageCount < aiMessageLimit;
  }

  async incrementAiMessageUsage(workspaceId: string): Promise<UsageRecord> {
    const reservation = await this.reserveAiMessage(workspaceId);
    const usage = await this.prisma.usageRecord.findUnique({
      where: { id: reservation.usageRecordId },
    });

    if (usage === null) {
      throw new Error('Usage record was not found after reservation');
    }

    return usage;
  }

  async reserveAiMessage(
    workspaceId: string,
  ): Promise<AiMessageUsageReservation> {
    const { subscription, usage, aiMessageLimit } =
      await this.getCurrentUsage(workspaceId);
    const reservation = await this.prisma.usageRecord.updateMany({
      where: {
        id: usage.id,
        aiMessageCount: { lt: aiMessageLimit },
      },
      data: { aiMessageCount: { increment: 1 } },
    });

    if (reservation.count === 0) {
      const currentUsage = await this.prisma.usageRecord.findUnique({
        where: { id: usage.id },
        select: { aiMessageCount: true },
      });

      throw new AiUsageLimitReachedException(
        subscription.plan,
        aiMessageLimit,
        currentUsage?.aiMessageCount ?? aiMessageLimit,
      );
    }

    return {
      usageRecordId: usage.id,
      plan: subscription.plan,
      limit: aiMessageLimit,
    };
  }

  async releaseAiMessageReservation(
    reservation: AiMessageUsageReservation,
  ): Promise<void> {
    await this.prisma.usageRecord.updateMany({
      where: {
        id: reservation.usageRecordId,
        aiMessageCount: { gt: 0 },
      },
      data: { aiMessageCount: { decrement: 1 } },
    });
  }

  private async getOrCreateUsageRecord(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<UsageRecord> {
    try {
      return await this.prisma.usageRecord.upsert({
        where: {
          workspaceId_periodStart: {
            workspaceId,
            periodStart,
          },
        },
        create: {
          workspaceId,
          periodStart,
          periodEnd,
        },
        update: { periodEnd },
      });
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        throw error;
      }

      const usage = await this.prisma.usageRecord.findUnique({
        where: {
          workspaceId_periodStart: {
            workspaceId,
            periodStart,
          },
        },
      });

      if (usage === null) {
        throw error;
      }

      return usage;
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
