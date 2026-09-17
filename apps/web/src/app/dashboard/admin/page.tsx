'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AdminErrorState,
} from '@/components/admin/admin-states';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import {
  BookOpenIcon,
  BotIcon,
  BuildingIcon,
  ChevronRightIcon,
  CreditCardIcon,
  MessagesSquareIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserIcon,
  ZapIcon,
} from '@/components/ui/icons';
import { getAdminOverview } from '@/lib/api/admin';
import { AuthApiError } from '@/lib/api/auth';
import type { AdminOverview } from '@/types/admin';

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOverview(showRefreshSpinner = false) {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getAdminOverview();
      setOverview(data);
    } catch (err) {
      const message =
        err instanceof AuthApiError
          ? err.message
          : 'Failed to load admin overview metrics. Please verify your administrator privileges.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await getAdminOverview();
        if (!ignore) {
          setOverview(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const message =
            err instanceof AuthApiError
              ? err.message
              : 'Failed to load admin overview metrics. Please verify your administrator privileges.';
          setError(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
          <div className="h-8 w-24 bg-zinc-800 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-white/[0.06] bg-[#111218] p-5 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-zinc-800 rounded" />
                  <div className="h-7 w-16 bg-zinc-700/80 rounded" />
                </div>
                <div className="h-10 w-10 bg-zinc-800/80 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <AdminErrorState
        title="Admin Overview Unavailable"
        message={error || 'An unexpected error occurred while loading platform metrics.'}
        onRetry={() => void loadOverview(true)}
        isRetrying={isRefreshing}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">
            Platform Metrics
          </h2>
          <p className="text-xs text-zinc-500">
            Real-time aggregate data queried from the database
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOverview(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#141520] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
        >
          <RefreshCwIcon className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Section 1: Tenant & Core Scale */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Core Scale & Tenancy
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminStatCard
            title="Total Users"
            value={overview.totalUsers}
            description="Registered accounts"
            icon={UserIcon}
            accent="zinc"
          />
          <AdminStatCard
            title="Total Workspaces"
            value={overview.totalWorkspaces}
            description="Tenants created"
            icon={BuildingIcon}
            accent="zinc"
          />
          <AdminStatCard
            title="Total AI Agents"
            value={overview.totalAgents}
            description="Active support bots"
            icon={BotIcon}
            accent="zinc"
          />
        </div>
      </div>

      {/* Section 2: Conversations & Messaging */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Customer Engagement & AI Traffic
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminStatCard
            title="Total Conversations"
            value={overview.totalConversations}
            description="Customer threads initiated"
            icon={MessagesSquareIcon}
            accent="zinc"
          />
          <AdminStatCard
            title="Total Messages"
            value={overview.totalMessages}
            description="Combined user & assistant messages"
            icon={BookOpenIcon}
            accent="zinc"
          />
          <AdminStatCard
            title="Total AI Messages"
            value={overview.totalAiMessages}
            description="Billable assistant inferences"
            icon={ZapIcon}
            accent="emerald"
            badge="Usage"
          />
        </div>
      </div>

      {/* Section 3: Subscriptions Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Subscriptions & Tier Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminStatCard
            title="Active Subscriptions"
            value={overview.activeSubscriptions}
            description="Workspaces in good standing"
            icon={CreditCardIcon}
            accent="emerald"
            badge="Active"
          />
          <AdminStatCard
            title="Free Workspaces"
            value={overview.freeWorkspaces}
            description="On the Free tier (100 msgs/mo)"
            icon={ShieldCheckIcon}
            accent="zinc"
          />
          <AdminStatCard
            title="Pro Workspaces"
            value={overview.proWorkspaces}
            description="On the Pro tier (5,000 msgs/mo)"
            icon={SparklesIcon}
            accent="sky"
          />
        </div>
      </div>

      {/* Section 4: Quick Navigation Cards */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Management Sections
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/admin/users"
            className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#111218] p-5 hover:border-white/[0.16] hover:bg-[#141520] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-white/[0.08] text-zinc-300">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  Users
                </p>
                <p className="text-xs text-zinc-500">
                  Search & inspect all user accounts
                </p>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/dashboard/admin/workspaces"
            className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#111218] p-5 hover:border-white/[0.16] hover:bg-[#141520] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-white/[0.08] text-zinc-300">
                <BuildingIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  Workspaces
                </p>
                <p className="text-xs text-zinc-500">
                  Review tenant organizations & owners
                </p>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/dashboard/admin/subscriptions"
            className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#111218] p-5 hover:border-white/[0.16] hover:bg-[#141520] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-white/[0.08] text-zinc-300">
                <CreditCardIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  Subscriptions
                </p>
                <p className="text-xs text-zinc-500">
                  Inspect tiers, periods & AI usage
                </p>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
