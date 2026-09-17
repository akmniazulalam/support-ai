'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircleIcon,
  CheckIcon,
  CreditCardIcon,
  RefreshCwIcon,
  ZapIcon,
} from '@/components/ui/icons';
import {
  cancelSubscription,
  completeCheckout,
  createCheckout,
  getSubscription,
  getUsage,
} from '@/lib/api/billing';
import { AuthApiError } from '@/lib/api/auth';
import { PLANS } from '@/lib/billing-constants';
import type {
  BillingSubscription,
  BillingUsage,
  DevelopmentCheckoutSession,
  SubscriptionPlan,
} from '@/types/billing';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusLabel(status: string): { label: string; colour: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', colour: 'text-emerald-400' };
    case 'TRIALING':
      return { label: 'Trial', colour: 'text-sky-400' };
    case 'PAST_DUE':
      return { label: 'Past Due', colour: 'text-amber-400' };
    case 'CANCELED':
      return { label: 'Canceled', colour: 'text-zinc-400' };
    default:
      return { label: status, colour: 'text-zinc-400' };
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CurrentPlanCard({ sub }: { sub: BillingSubscription }) {
  const plan = PLANS[sub.plan];
  const { label: sLabel, colour } = statusLabel(sub.status);
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">
            Current plan
          </p>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {plan.label}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {plan.monthlyPrice === 0
              ? 'Free forever'
              : `$${plan.monthlyPrice} / month`}
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-xs font-medium ${colour}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full bg-current`} />
          {sLabel}
        </div>
      </div>
      <div className="mt-5 flex gap-8 border-t border-white/[0.06] pt-5 text-xs text-zinc-500">
        <div>
          <p className="mb-0.5 text-zinc-400">Period start</p>
          <p>{formatDate(sub.currentPeriod.start)}</p>
        </div>
        <div>
          <p className="mb-0.5 text-zinc-400">Period end</p>
          <p>{formatDate(sub.currentPeriod.end)}</p>
        </div>
      </div>
    </div>
  );
}

function UsageCard({ usage }: { usage: BillingUsage }) {
  const { aiMessages, limit, periodStart, periodEnd } = usage.usage;
  const pct = limit > 0 ? Math.min((aiMessages / limit) * 100, 100) : 0;
  const isNearLimit = pct >= 80;
  const isAtLimit = pct >= 100;

  const barColour = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
      ? 'bg-amber-400'
      : 'bg-emerald-500';

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-6">
      <div className="flex items-center gap-2 mb-4">
        <ZapIcon className="h-4 w-4 text-zinc-400" />
        <p className="text-sm font-semibold text-zinc-200">AI Message Usage</p>
      </div>

      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-white tabular-nums">
          {aiMessages.toLocaleString()}
        </span>
        <span className="text-sm text-zinc-500">
          of {limit.toLocaleString()}
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColour}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-zinc-500">
        <span>{pct.toFixed(0)}% used</span>
        <span>
          {formatDate(periodStart)} – {formatDate(periodEnd)}
        </span>
      </div>

      {isAtLimit && (
        <p className="mt-3 text-xs text-red-400">
          Monthly limit reached. Upgrade to Pro to send more messages.
        </p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="mt-3 text-xs text-amber-400">
          Approaching your monthly limit. Consider upgrading to Pro.
        </p>
      )}
    </div>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan: SubscriptionPlan;
  onUpgrade: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function PlanCard({
  plan,
  currentPlan,
  onUpgrade,
  onCancel,
  isLoading,
}: PlanCardProps) {
  const meta = PLANS[plan];
  const isCurrent = plan === currentPlan;
  const isUpgrade = plan === 'PRO' && currentPlan === 'FREE';
  const isDowngrade = plan === 'FREE' && currentPlan === 'PRO';

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-[#111218] p-6 transition-colors ${
        isCurrent
          ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
          : 'border-white/[0.08]'
      }`}
    >
      {isCurrent && (
        <span className="absolute right-4 top-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          Current
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">{meta.label}</h3>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white tabular-nums">
            ${meta.monthlyPrice}
          </span>
          <span className="text-sm text-zinc-500">/ month</span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5 mb-6">
        {meta.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
            <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      {isUpgrade && (
        <button
          onClick={onUpgrade}
          disabled={isLoading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing…' : 'Upgrade to Pro'}
        </button>
      )}
      {isDowngrade && (
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-400 hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing…' : 'Cancel subscription'}
        </button>
      )}
      {isCurrent && !isUpgrade && !isDowngrade && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-center text-sm font-medium text-zinc-400">
          <CheckIcon className="h-4 w-4 text-emerald-400" />
          <span>Your current plan</span>
        </div>
      )}
    </div>
  );
}

// ─── Dev Checkout Modal ──────────────────────────────────────────────────────

interface DevCheckoutModalProps {
  session: DevelopmentCheckoutSession;
  onComplete: () => void;
  onCancel: () => void;
  isCompleting: boolean;
  error: string | null;
}

function DevCheckoutModal({
  session,
  onComplete,
  onCancel,
  isCompleting,
  error,
}: DevCheckoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#14151e] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/5">
            <CreditCardIcon className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Development Billing
            </h3>
            <p className="text-xs text-zinc-500">Simulated checkout</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.04] px-4 py-3 mb-5">
          <p className="text-xs text-amber-400/80 leading-relaxed">
            This is a simulated checkout for the project demo.{' '}
            <strong className="text-amber-400">
              No real payment will be processed.
            </strong>
          </p>
        </div>

        <div className="space-y-2 mb-5 text-sm text-zinc-400">
          <div className="flex justify-between">
            <span>Plan</span>
            <span className="text-white font-medium">{session.plan}</span>
          </div>
          <div className="flex justify-between">
            <span>Price</span>
            <span className="text-white font-medium">
              ${PLANS[session.plan].monthlyPrice} / month
            </span>
          </div>
          <div className="flex justify-between">
            <span>Checkout ID</span>
            <span className="font-lexend text-xs text-zinc-500 truncate max-w-[180px]">
              {session.checkoutId}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5">
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isCompleting}
            className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleting ? 'Processing…' : 'Simulate successful payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Confirmation Dialog ───────────────────────────────────────────────

interface CancelDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

function CancelDialog({
  onConfirm,
  onCancel,
  isLoading,
  error,
}: CancelDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#14151e] p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-white mb-2">
          Cancel subscription?
        </h3>
        <p className="text-sm text-zinc-400 mb-5">
          You will be downgraded to the Free plan immediately. Your AI message
          limit will be reduced to 100 per month.
        </p>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5">
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            Keep Pro
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Canceling…' : 'Yes, cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [sub, setSub] = useState<BillingSubscription | null>(null);
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Upgrade flow
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [checkoutSession, setCheckoutSession] =
    useState<DevelopmentCheckoutSession | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Cancel flow
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [subData, usageData] = await Promise.all([
          getSubscription(),
          getUsage(),
        ]);
        setSub(subData);
        setUsage(usageData);
      } catch (err) {
        setLoadError(
          err instanceof AuthApiError
            ? err.message
            : 'Failed to load billing information.',
        );
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [reloadKey]);

  async function handleUpgrade() {
    if (isUpgrading) return;
    setIsUpgrading(true);
    setUpgradeError(null);
    try {
      const session = await createCheckout();
      setCheckoutSession(session);
    } catch (err) {
      setUpgradeError(
        err instanceof AuthApiError
          ? err.message
          : 'Failed to initiate checkout.',
      );
    } finally {
      setIsUpgrading(false);
    }
  }

  async function handleCompleteCheckout() {
    if (!checkoutSession || isCompleting) return;
    setIsCompleting(true);
    setCheckoutError(null);
    try {
      const result = await completeCheckout(checkoutSession.checkoutId);
      setSub(result.subscription);
      setCheckoutSession(null);
      // Refresh usage
      const usageData = await getUsage();
      setUsage(usageData);
    } catch (err) {
      setCheckoutError(
        err instanceof AuthApiError
          ? err.message
          : 'Failed to complete checkout.',
      );
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleCancelSubscription() {
    if (isCanceling) return;
    setIsCanceling(true);
    setCancelError(null);
    try {
      const updatedSub = await cancelSubscription();
      setSub(updatedSub);
      setShowCancelDialog(false);
      // Refresh usage
      const usageData = await getUsage();
      setUsage(usageData);
    } catch (err) {
      setCancelError(
        err instanceof AuthApiError
          ? err.message
          : 'Failed to cancel subscription.',
      );
    } finally {
      setIsCanceling(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="animate-message-entrance pb-10">
        <div className="mb-6">
          <div className="h-7 w-24 rounded-lg bg-zinc-800 animate-pulse mb-2" />
          <div className="h-4 w-56 rounded bg-zinc-800/60 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-zinc-900/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (loadError || !sub || !usage) {
    return (
      <div className="animate-message-entrance pb-10">
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">
                Failed to load billing info
              </p>
              <p className="mt-1 text-sm text-red-400/70">
                {loadError ?? 'Unknown error'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dev checkout modal */}
      {checkoutSession && (
        <DevCheckoutModal
          session={checkoutSession}
          onComplete={() => void handleCompleteCheckout()}
          onCancel={() => {
            setCheckoutSession(null);
            setCheckoutError(null);
          }}
          isCompleting={isCompleting}
          error={checkoutError}
        />
      )}

      {/* Cancel confirmation dialog */}
      {showCancelDialog && (
        <CancelDialog
          onConfirm={() => void handleCancelSubscription()}
          onCancel={() => {
            setShowCancelDialog(false);
            setCancelError(null);
          }}
          isLoading={isCanceling}
          error={cancelError}
        />
      )}

      <div className="animate-message-entrance pb-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Billing
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your subscription and AI usage.
          </p>
        </div>

        {/* Upgrade error banner */}
        {upgradeError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <p className="text-sm text-red-400">{upgradeError}</p>
          </div>
        )}

        {/* Current plan + usage */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <CurrentPlanCard sub={sub} />
          <UsageCard usage={usage} />
        </div>

        {/* Plan comparison */}
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Plans</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <PlanCard
              plan="FREE"
              currentPlan={sub.plan}
              onUpgrade={handleUpgrade}
              onCancel={() => setShowCancelDialog(true)}
              isLoading={isUpgrading || isCanceling}
            />
            <PlanCard
              plan="PRO"
              currentPlan={sub.plan}
              onUpgrade={handleUpgrade}
              onCancel={() => setShowCancelDialog(true)}
              isLoading={isUpgrading || isCanceling}
            />
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-zinc-600 text-center">
          This is a development/demo billing system.{' '}
          <Link
            href="https://github.com"
            className="hover:text-zinc-400 transition-colors underline underline-offset-2"
          >
            View source on GitHub
          </Link>
          . No real charges are made.
        </p>
      </div>
    </>
  );
}
