import { Inject, Injectable } from '@nestjs/common';
import { WorkspacesService } from '../workspaces/workspaces.service.js';
import {
  BILLING_PROVIDER,
  type BillingProvider,
  type PublicSubscriptionState,
} from './billing-provider.interface.js';
import { SubscriptionService } from './subscription.service.js';
import { UsageService } from './usage.service.js';

@Injectable()
export class BillingService {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly subscriptionService: SubscriptionService,
    private readonly usageService: UsageService,
    @Inject(BILLING_PROVIDER)
    private readonly billingProvider: BillingProvider,
  ) {}

  async getSubscription(ownerId: string) {
    const workspace =
      await this.workspacesService.getOwnedWorkspaceOrThrow(ownerId);
    const subscription = await this.subscriptionService.getCurrentSubscription(
      workspace.id,
    );

    return this.toPublicSubscriptionState(subscription);
  }

  async getUsage(ownerId: string) {
    const workspace =
      await this.workspacesService.getOwnedWorkspaceOrThrow(ownerId);
    const { subscription, usage, aiMessageLimit } =
      await this.usageService.getCurrentUsage(workspace.id);

    return {
      plan: subscription.plan,
      status: subscription.status,
      usage: {
        aiMessages: usage.aiMessageCount,
        limit: aiMessageLimit,
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
      },
    };
  }

  async createProCheckout(ownerId: string) {
    const workspace =
      await this.workspacesService.getOwnedWorkspaceOrThrow(ownerId);

    return this.billingProvider.createProCheckout(workspace.id);
  }

  async completeCheckout(ownerId: string, checkoutId: string) {
    const workspace =
      await this.workspacesService.getOwnedWorkspaceOrThrow(ownerId);
    const completion = await this.billingProvider.completeCheckout(
      workspace.id,
      checkoutId,
    );

    return {
      checkoutId: completion.checkoutId,
      status: completion.status,
      subscription: this.toPublicSubscriptionState(completion.subscription),
    };
  }

  async cancelSubscription(ownerId: string): Promise<PublicSubscriptionState> {
    const workspace =
      await this.workspacesService.getOwnedWorkspaceOrThrow(ownerId);
    const subscription = await this.billingProvider.cancelProSubscription(
      workspace.id,
    );

    return this.toPublicSubscriptionState(subscription);
  }

  private toPublicSubscriptionState(
    subscription: Awaited<
      ReturnType<SubscriptionService['getCurrentSubscription']>
    >,
  ): PublicSubscriptionState {
    return {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriod: {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
      },
    };
  }
}
