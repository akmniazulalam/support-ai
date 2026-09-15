import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  DevelopmentCheckoutStatus,
  Prisma,
  SubscriptionPlan,
  SubscriptionStatus,
  type DevelopmentCheckout,
  type Subscription,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { getUtcCalendarMonthPeriod } from './billing-period.js';
import type {
  BillingProvider,
  CompletedDevelopmentCheckout,
  DevelopmentCheckoutSession,
} from './billing-provider.interface.js';
import { SubscriptionService } from './subscription.service.js';

/**
 * Development-only billing provider for the portfolio demo. It never contacts
 * a payment processor and its checkout IDs are not Stripe identifiers.
 */
@Injectable()
export class DevelopmentBillingProvider implements BillingProvider {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createProCheckout(
    workspaceId: string,
  ): Promise<DevelopmentCheckoutSession> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const subscription =
          await this.subscriptionService.getCurrentSubscriptionInTransaction(
            tx,
            workspaceId,
          );
        this.assertCanStartProCheckout(subscription);

        const existingCheckout = await tx.developmentCheckout.findUnique({
          where: { activeWorkspaceId: workspaceId },
        });

        if (existingCheckout !== null) {
          return this.toPendingCheckoutSession(existingCheckout);
        }

        const checkout = await tx.developmentCheckout.create({
          data: {
            checkoutId: this.createCheckoutId(),
            workspaceId,
            targetPlan: SubscriptionPlan.PRO,
            status: DevelopmentCheckoutStatus.PENDING,
            activeWorkspaceId: workspaceId,
          },
        });

        return this.toPendingCheckoutSession(checkout);
      });
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        throw error;
      }

      const checkout = await this.prisma.developmentCheckout.findUnique({
        where: { activeWorkspaceId: workspaceId },
      });

      if (checkout === null) {
        throw error;
      }

      return this.toPendingCheckoutSession(checkout);
    }
  }

  async completeCheckout(
    workspaceId: string,
    checkoutId: string,
  ): Promise<CompletedDevelopmentCheckout> {
    return this.prisma.$transaction(async (tx) => {
      const checkout = await tx.developmentCheckout.findFirst({
        where: { checkoutId, workspaceId },
      });

      if (checkout === null) {
        throw new NotFoundException('Checkout not found');
      }

      let subscription =
        await this.subscriptionService.getCurrentSubscriptionInTransaction(
          tx,
          workspaceId,
        );

      if (checkout.status === DevelopmentCheckoutStatus.COMPLETED) {
        return this.toCompletedCheckout(checkout, subscription);
      }

      if (
        checkout.status !== DevelopmentCheckoutStatus.PENDING ||
        checkout.activeWorkspaceId !== workspaceId ||
        checkout.targetPlan !== SubscriptionPlan.PRO
      ) {
        throw new ConflictException('Checkout cannot be completed');
      }

      const currentPeriod = getUtcCalendarMonthPeriod();
      const subscriptionUpdate = await tx.subscription.updateMany({
        where: {
          id: subscription.id,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
        data: {
          plan: SubscriptionPlan.PRO,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: currentPeriod.start,
          currentPeriodEnd: currentPeriod.end,
        },
      });

      if (subscriptionUpdate.count === 0) {
        const completedCheckout = await tx.developmentCheckout.findUnique({
          where: { checkoutId },
        });

        if (completedCheckout?.status === DevelopmentCheckoutStatus.COMPLETED) {
          const currentSubscription = await tx.subscription.findUniqueOrThrow({
            where: { workspaceId },
          });

          return this.toCompletedCheckout(
            completedCheckout,
            currentSubscription,
          );
        }

        throw new ConflictException('Subscription cannot be upgraded');
      }

      const checkoutUpdate = await tx.developmentCheckout.updateMany({
        where: {
          id: checkout.id,
          workspaceId,
          status: DevelopmentCheckoutStatus.PENDING,
          activeWorkspaceId: workspaceId,
        },
        data: {
          status: DevelopmentCheckoutStatus.COMPLETED,
          activeWorkspaceId: null,
          completedAt: new Date(),
        },
      });

      if (checkoutUpdate.count === 0) {
        throw new ConflictException('Checkout cannot be completed');
      }

      subscription = await tx.subscription.findUniqueOrThrow({
        where: { workspaceId },
      });
      const completedCheckout = await tx.developmentCheckout.findUniqueOrThrow({
        where: { checkoutId },
      });

      return this.toCompletedCheckout(completedCheckout, subscription);
    });
  }

  async cancelProSubscription(workspaceId: string): Promise<Subscription> {
    return this.prisma.$transaction(async (tx) => {
      const subscription =
        await this.subscriptionService.getCurrentSubscriptionInTransaction(
          tx,
          workspaceId,
        );

      if (
        subscription.plan === SubscriptionPlan.FREE &&
        subscription.status === SubscriptionStatus.ACTIVE
      ) {
        await this.cancelPendingCheckouts(tx, workspaceId);
        return subscription;
      }

      if (
        subscription.plan !== SubscriptionPlan.PRO ||
        subscription.status !== SubscriptionStatus.ACTIVE
      ) {
        throw new ConflictException('Subscription cannot be cancelled');
      }

      const currentPeriod = getUtcCalendarMonthPeriod();
      const updatedSubscription = await tx.subscription.update({
        where: { workspaceId },
        data: {
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: currentPeriod.start,
          currentPeriodEnd: currentPeriod.end,
        },
      });

      await this.cancelPendingCheckouts(tx, workspaceId);

      return updatedSubscription;
    });
  }

  private assertCanStartProCheckout(subscription: Subscription): void {
    if (
      subscription.plan === SubscriptionPlan.PRO &&
      subscription.status === SubscriptionStatus.ACTIVE
    ) {
      throw new ConflictException('A Pro subscription is already active');
    }

    if (
      subscription.plan !== SubscriptionPlan.FREE ||
      subscription.status !== SubscriptionStatus.ACTIVE
    ) {
      throw new ConflictException('Subscription is not eligible for checkout');
    }
  }

  private async cancelPendingCheckouts(
    prisma: Prisma.TransactionClient,
    workspaceId: string,
  ): Promise<void> {
    await prisma.developmentCheckout.updateMany({
      where: {
        workspaceId,
        status: DevelopmentCheckoutStatus.PENDING,
      },
      data: {
        status: DevelopmentCheckoutStatus.CANCELED,
        activeWorkspaceId: null,
      },
    });
  }

  private createCheckoutId(): string {
    return `dev_checkout_${randomUUID().replace(/-/g, '')}`;
  }

  private toPendingCheckoutSession(
    checkout: DevelopmentCheckout,
  ): DevelopmentCheckoutSession {
    return {
      checkoutId: checkout.checkoutId,
      plan: checkout.targetPlan,
      status: 'pending',
    };
  }

  private toCompletedCheckout(
    checkout: DevelopmentCheckout,
    subscription: Subscription,
  ): CompletedDevelopmentCheckout {
    return {
      checkoutId: checkout.checkoutId,
      status: 'completed',
      subscription,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
