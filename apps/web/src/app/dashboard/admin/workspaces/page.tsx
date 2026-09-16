'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminSearchInput } from '@/components/admin/admin-search-input';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminTableSkeleton,
} from '@/components/admin/admin-states';
import { AdminTablePagination } from '@/components/admin/admin-table-pagination';
import { RefreshCwIcon } from '@/components/ui/icons';
import { getAdminWorkspaces } from '@/lib/api/admin';
import { AuthApiError } from '@/lib/api/auth';
import type { AdminPaginationMeta, AdminWorkspace } from '@/types/admin';

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

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([]);
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setIsLoading(true);
      setActiveSearch(val);
      setPage(1);
    }, 300);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await getAdminWorkspaces({
          page,
          limit: 20,
          search: activeSearch.trim() || undefined,
        });
        if (!ignore) {
          setWorkspaces(response.data);
          setMeta(response.meta);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const message =
            err instanceof AuthApiError
              ? err.message
              : 'Failed to fetch workspaces. Please try again.';
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
  }, [page, activeSearch, refreshTick]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTick((t) => t + 1);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">
            Workspace Directory
          </h2>
          <p className="text-xs text-zinc-500">
            Search by workspace name or owner email. Inspect plan, agents and conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AdminSearchInput
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by name or owner email..."
            disabled={isLoading && !isRefreshing}
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh workspace list"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#141520] text-zinc-300 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <AdminErrorState
          title="Failed to Load Workspaces"
          message={error}
          onRetry={handleRefresh}
          isRetrying={isLoading}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && !isRefreshing && <AdminTableSkeleton rows={5} cols={7} />}

      {/* Empty state */}
      {!isLoading && workspaces.length === 0 && !error && (
        <AdminEmptyState
          title="No workspaces found"
          description={
            activeSearch
              ? `No workspaces match "${activeSearch}". Try a workspace name or owner email.`
              : 'There are no workspaces on the platform yet.'
          }
          action={
            activeSearch
              ? {
                  label: 'Clear Search',
                  onClick: () => {
                    setSearchInput('');
                    setActiveSearch('');
                    setPage(1);
                  },
                }
              : undefined
          }
        />
      )}

      {/* Table */}
      {(!isLoading || isRefreshing) && workspaces.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#111218] overflow-hidden shadow-xs">
          <div className="overflow-x-auto chat-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0c0d14]/60 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th scope="col" className="px-4 py-3">Workspace</th>
                  <th scope="col" className="px-4 py-3">Owner</th>
                  <th scope="col" className="px-4 py-3">Plan</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Agents</th>
                  <th scope="col" className="px-4 py-3">Conversations</th>
                  <th scope="col" className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {workspaces.map((ws) => {
                  const plan = ws.subscription?.plan ?? 'FREE';
                  const status = ws.subscription?.status ?? 'ACTIVE';
                  const isPro = plan === 'PRO';
                  const statusColour =
                    status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : status === 'PAST_DUE'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : status === 'CANCELED'
                          ? 'bg-zinc-800 text-zinc-400 border-white/[0.06]'
                          : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]';

                  return (
                    <tr
                      key={ws.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Workspace Name & Slug */}
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-zinc-100">
                            {ws.name}
                          </span>
                          <div className="font-lexend text-[10px] text-zinc-500 mt-0.5">
                            {ws.slug}
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-zinc-200">
                            {ws.owner.firstName} {ws.owner.lastName}
                          </span>
                          <div className="font-lexend text-[10px] text-zinc-500 mt-0.5 truncate max-w-[180px]">
                            {ws.owner.email}
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
                          {plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${statusColour}`}
                        >
                          {status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Agent Count */}
                      <td className="px-4 py-3 tabular-nums text-zinc-300 font-medium">
                        {ws.agentCount}
                      </td>

                      {/* Conversation Count */}
                      <td className="px-4 py-3 tabular-nums text-zinc-300 font-medium">
                        {ws.conversationCount}
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {formatDate(ws.createdAt)}
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
