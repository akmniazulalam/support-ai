import { SubscriptionPlan } from '../generated/prisma/client.js';

export const AI_MESSAGE_LIMITS: Readonly<Record<SubscriptionPlan, number>> = {
  [SubscriptionPlan.FREE]: 100,
  [SubscriptionPlan.PRO]: 5_000,
};

export function getAiMessageLimit(plan: SubscriptionPlan): number {
  return AI_MESSAGE_LIMITS[plan];
}
