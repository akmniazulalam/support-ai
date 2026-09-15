import type { SubscriptionPlan } from '@/types/billing';

export interface PlanMeta {
  label: string;
  monthlyPrice: number;
  aiMessageLimit: number;
  features: string[];
}

export const PLANS: Record<SubscriptionPlan, PlanMeta> = {
  FREE: {
    label: 'Free',
    monthlyPrice: 0,
    aiMessageLimit: 100,
    features: [
      '100 AI messages / month',
      '1 AI agent',
      'Public chat widget',
      'Basic conversation inbox',
    ],
  },
  PRO: {
    label: 'Pro',
    monthlyPrice: 19,
    aiMessageLimit: 5000,
    features: [
      '5,000 AI messages / month',
      'Unlimited AI agents',
      'Public chat widget',
      'Full conversation inbox',
      'Knowledge base (documents & URLs)',
      'Priority support',
    ],
  },
} as const;
