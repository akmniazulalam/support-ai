'use client';

import { ChevronRightIcon } from '@/components/ui/icons';

interface AdminTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export function AdminTablePagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  isLoading = false,
}: AdminTablePaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const start = Math.min((page - 1) * limit + 1, totalItems);
  const end = Math.min(page * limit, totalItems);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.08] bg-[#0c0d14]/40 text-xs text-zinc-400">
      <div className="tabular-nums">
        Showing <span className="font-medium text-zinc-200">{start}</span> to{' '}
        <span className="font-medium text-zinc-200">{end}</span> of{' '}
        <span className="font-medium text-zinc-200">{totalItems.toLocaleString()}</span> entries
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevious || isLoading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-[#141520] hover:bg-white/[0.06] text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="rotate-180 inline-block">
            <ChevronRightIcon className="h-3 w-3" />
          </span>
          <span>Previous</span>
        </button>

        <span className="px-2 py-1 font-lexend text-zinc-500 tabular-nums">
          Page {page} of {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext || isLoading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-[#141520] hover:bg-white/[0.06] text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <ChevronRightIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
