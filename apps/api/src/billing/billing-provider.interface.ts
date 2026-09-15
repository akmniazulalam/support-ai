import {
  SubscriptionPlan,
  SubscriptionStatus,
  type Subscription,
} from '../generated/prisma/client.js';

export const BILLING_PROVIDER = Symbol('BILLING_PROVIDER');

export interface DevelopmentCheckoutSession {
  checkoutId: string;
  plan: SubscriptionPlan;
  status: 'pending';
}

export interface CompletedDevelopmentCheckout {
  checkoutId: string;
  status: 'completed';
  subscription: Subscription;
}

export interface BillingProvider {
  createProCheckout(workspaceId: string): Promise<DevelopmentCheckoutSession>;
  completeCheckout(
    workspaceId: string,
    checkoutId: string,
  ): Promise<CompletedDevelopmentCheckout>;
  cancelProSubscription(workspaceId: string): Promise<Subscription>;
}

export interface PublicSubscriptionState {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriod: {
    start: Date;
    end: Date;
  };
}
