export type SubscriptionPlan = 'FREE' | 'PRO';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'INCOMPLETE'
  | 'INCOMPLETE_EXPIRED'
  | 'UNPAID';

export interface BillingSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriod: {
    start: string;
    end: string;
  };
}

export interface BillingUsage {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  usage: {
    aiMessages: number;
    limit: number;
    periodStart: string;
    periodEnd: string;
  };
}

export interface DevelopmentCheckoutSession {
  checkoutId: string;
  plan: 'PRO';
  status: 'pending';
}

export interface CheckoutCompletionResult {
  checkoutId: string;
  status: 'completed';
  subscription: BillingSubscription;
}
