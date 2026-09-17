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
import { getAdminUsers } from '@/lib/api/admin';
import { AuthApiError } from '@/lib/api/auth';
import type { AdminPaginationMeta, AdminUser } from '@/types/admin';

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    page: 1,
    limit: 10,
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
        const response = await getAdminUsers({
          page,
          limit: 10,
          search: activeSearch.trim() || undefined,
        });
        if (!ignore) {
          setUsers(response.data);
          setMeta(response.meta);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const message =
            err instanceof AuthApiError
              ? err.message
              : 'Failed to fetch user accounts. Please try again.';
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
            User Directory
          </h2>
          <p className="text-xs text-zinc-500">
            Search by name or email. Inspect roles, workspaces and plan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AdminSearchInput
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh user list"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#141520] text-zinc-300 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <AdminErrorState
          title="Failed to Load Users"
          message={error}
          onRetry={handleRefresh}
          isRetrying={isLoading || isRefreshing}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && !isRefreshing && <AdminTableSkeleton rows={5} cols={6} />}

      {/* Empty state */}
      {!isLoading && users.length === 0 && !error && (
        <AdminEmptyState
          title="No users found"
          description={
            activeSearch
              ? `No users match "${activeSearch}". Try a different name or email.`
              : 'There are no registered users on the platform yet.'
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
      {(!isLoading || isRefreshing) && users.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#111218] overflow-hidden shadow-xs">
          <div className="overflow-x-auto chat-scrollbar">
            <table className="w-full text-left border-collapse text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0c0d14]/60 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th scope="col" className="px-4 py-3">User</th>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Workspaces</th>
                  <th scope="col" className="px-4 py-3">Plan</th>
                  <th scope="col" className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {users.map((user) => {
                  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
                  const isAdmin = user.role === 'ADMIN';
                  const plan = user.workspaces[0]?.subscription?.plan ?? 'FREE';
                  const isPro = plan === 'PRO';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User name + initials */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-[10px] font-bold text-zinc-200">
                            {initials}
                          </div>
                          <span className="font-medium text-zinc-100">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 font-lexend text-[11px] text-zinc-400 max-w-[200px] truncate">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                            isAdmin
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06]'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Workspaces count */}
                      <td className="px-4 py-3 tabular-nums text-zinc-300">
                        {user.workspaces.length}
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

                      {/* Joined */}
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {formatDate(user.createdAt)}
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
