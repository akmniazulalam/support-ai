'use client';

import { useEffect, useState } from 'react';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminTableSkeleton,
} from '@/components/admin/admin-states';
import { AdminTablePagination } from '@/components/admin/admin-table-pagination';
import { RefreshCwIcon } from '@/components/ui/icons';
import { getAdminSubscriptions } from '@/lib/api/admin';
import { AuthApiError } from '@/lib/api/auth';
import type {
  AdminPaginationMeta,
  AdminSubscription,
} from '@/types/admin';
import type { SubscriptionPlan, SubscriptionStatus } from '@/types/billing';

const PLAN_OPTIONS: { label: string; value: SubscriptionPlan | '' }[] = [
  { label: 'All Plans', value: '' },
  { label: 'Free', value: 'FREE' },
  { label: 'Pro', value: 'PRO' },
];

const STATUS_OPTIONS: { label: string; value: SubscriptionStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Trialing', value: 'TRIALING' },
  { label: 'Past Due', value: 'PAST_DUE' },
  { label: 'Canceled', value: 'CANCELED' },
  { label: 'Incomplete', value: 'INCOMPLETE' },
  { label: 'Expired', value: 'INCOMPLETE_EXPIRED' },
  { label: 'Unpaid', value: 'UNPAID' },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState<SubscriptionPlan | ''>('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await getAdminSubscriptions({
          page,
          limit: 20,
          plan: planFilter || undefined,
          status: statusFilter || undefined,
        });
        if (!ignore) {
          setSubscriptions(response.data);
          setMeta(response.meta);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const message =
            err instanceof AuthApiError
              ? err.message
              : 'Failed to fetch subscriptions. Please try again.';
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
  }, [page, planFilter, statusFilter, refreshTick]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTick((t) => t + 1);
  };

  const handlePlanChange = (value: SubscriptionPlan | '') => {
    setIsLoading(true);
    setPlanFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: SubscriptionStatus | '') => {
    setIsLoading(true);
    setStatusFilter(value);
    setPage(1);
  };

  const selectClass =
    'rounded-xl border border-white/[0.1] bg-[#111218] py-2 px-3 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors cursor-pointer';

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">
            Subscription Registry
          </h2>
          <p className="text-xs text-zinc-500">
            Filter by plan and status. Inspect billing periods and AI message usage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={planFilter}
            onChange={(e) => handlePlanChange(e.target.value as SubscriptionPlan | '')}
            disabled={isLoading && !isRefreshing}
            className={selectClass}
            aria-label="Filter by plan"
          >
            {PLAN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as SubscriptionStatus | '')}
            disabled={isLoading && !isRefreshing}
            className={selectClass}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh subscriptions list"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#141520] text-zinc-300 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <AdminErrorState
          title="Failed to Load Subscriptions"
          message={error}
          onRetry={handleRefresh}
          isRetrying={isLoading || isRefreshing}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && !isRefreshing && <AdminTableSkeleton rows={5} cols={7} />}

      {/* Empty state */}
      {!isLoading && subscriptions.length === 0 && !error && (
        <AdminEmptyState
          title="No subscriptions found"
          description={
            planFilter || statusFilter
              ? 'No subscriptions match the selected filters. Try adjusting plan or status.'
              : 'There are no subscriptions on the platform yet.'
          }
          action={
            planFilter || statusFilter
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setPlanFilter('');
                    setStatusFilter('');
                    setPage(1);
                  },
                }
              : undefined
          }
        />
      )}

      {/* Table */}
      {(!isLoading || isRefreshing) && subscriptions.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#111218] overflow-hidden shadow-xs">
          <div className="overflow-x-auto chat-scrollbar">
            <table className="w-full text-left border-collapse text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0c0d14]/60 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th scope="col" className="px-4 py-3">Workspace</th>
                  <th scope="col" className="px-4 py-3">Owner</th>
                  <th scope="col" className="px-4 py-3">Plan</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Billing Period</th>
                  <th scope="col" className="px-4 py-3">AI Usage</th>
                  <th scope="col" className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {subscriptions.map((sub, idx) => {
                  const isPro = sub.plan === 'PRO';
                  const usagePct =
                    sub.usage.limit > 0
                      ? Math.min(
                          (sub.usage.aiMessages / sub.usage.limit) * 100,
                          100,
                        )
                      : 0;
                  const barColour =
                    usagePct >= 100
                      ? 'bg-red-500'
                      : usagePct >= 80
                        ? 'bg-amber-400'
                        : 'bg-emerald-500';

                  const statusColour =
                    sub.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : sub.status === 'PAST_DUE'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : sub.status === 'CANCELED'
                          ? 'bg-zinc-800 text-zinc-400 border-white/[0.06]'
                          : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]';

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Workspace */}
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-zinc-100">
                            {sub.workspace.name}
                          </span>
                          <div className="font-lexend text-[10px] text-zinc-500 mt-0.5">
                            {sub.workspace.slug}
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-zinc-200">
                            {sub.workspace.owner.firstName}{' '}
                            {sub.workspace.owner.lastName}
                          </span>
                          <div className="font-lexend text-[10px] text-zinc-500 mt-0.5 truncate max-w-[160px]">
                            {sub.workspace.owner.email}
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                            isPro
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06]'
                          }`}
                        >
                          {sub.plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${statusColour}`}
                        >
                          {sub.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Billing Period */}
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-400">
                        <div>{formatDate(sub.currentPeriod.start)}</div>
                        <div className="text-[10px] text-zinc-600">
                          to {formatDate(sub.currentPeriod.end)}
                        </div>
                      </td>

                      {/* AI Usage */}
                      <td className="px-4 py-3">
                        <div className="min-w-[100px]">
                          <div className="flex items-center justify-between mb-1 tabular-nums">
                            <span className="text-zinc-200 font-medium">
                              {sub.usage.aiMessages.toLocaleString()}
                            </span>
                            <span className="text-zinc-500 text-[10px]">
                              / {sub.usage.limit.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColour}`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {formatDate(sub.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <AdminTablePagination
            page={meta.page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            limit={meta.limit}
            onPageChange={(newPage) => {
              setIsLoading(true);
              setPage(newPage);
            }}
            isLoading={isLoading || isRefreshing}
          />
        </div>
      )}
    </div>
  );
}
