import { authenticatedRequest } from '@/lib/api/auth';
import type {
  BillingSubscription,
  BillingUsage,
  CheckoutCompletionResult,
  DevelopmentCheckoutSession,
} from '@/types/billing';

export async function getSubscription(): Promise<BillingSubscription> {
  return authenticatedRequest<BillingSubscription>('/billing/subscription', {
    method: 'GET',
  });
}

export async function getUsage(): Promise<BillingUsage> {
  return authenticatedRequest<BillingUsage>('/billing/usage', {
    method: 'GET',
  });
}

export async function createCheckout(): Promise<DevelopmentCheckoutSession> {
  return authenticatedRequest<DevelopmentCheckoutSession>('/billing/checkout', {
    method: 'POST',
  });
}

export async function completeCheckout(
  checkoutId: string,
): Promise<CheckoutCompletionResult> {
  return authenticatedRequest<CheckoutCompletionResult>(
    `/billing/checkout/${checkoutId}/complete`,
    { method: 'POST' },
  );
}

export async function cancelSubscription(): Promise<BillingSubscription> {
  return authenticatedRequest<BillingSubscription>(
    '/billing/subscription/cancel',
    { method: 'POST' },
  );
}
