'use client';

import { AlertCircleIcon, RefreshCwIcon, SearchIcon } from '@/components/ui/icons';

interface AdminEmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AdminEmptyState({
  title = 'No records found',
  description = 'Try adjusting your search query or filters to find what you are looking for.',
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111218] px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-zinc-500 mb-4">
        <SearchIcon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-sm">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface AdminErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function AdminErrorState({
  title = 'Unable to load data',
  message,
  onRetry,
  isRetrying = false,
}: AdminErrorStateProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-red-300">{title}</h4>
          <p className="mt-0.5 text-xs text-red-400/80 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition-colors shrink-0"
        >
          <RefreshCwIcon className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
        </button>
      )}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#111218] overflow-hidden">
      <div className="border-b border-white/[0.06] bg-[#0c0d14]/60 px-4 py-3">
        <div className="flex items-center gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3.5 bg-zinc-800 rounded w-24" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3.5 flex items-center gap-4 animate-pulse">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-3 bg-zinc-800/60 rounded"
                style={{ width: `${Math.floor(60 + ((r + c) % 4) * 20)}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
