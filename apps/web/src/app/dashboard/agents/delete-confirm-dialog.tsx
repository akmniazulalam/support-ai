'use client';

import { AlertCircleIcon, TrashIcon, XIcon } from '@/components/ui/icons';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error: string | null;
  title: string;
  description: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
  title,
  description,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#14151e] shadow-2xl shadow-black/60 p-6">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
        >
          <XIcon className="h-4 w-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
            <TrashIcon className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h2
              id="dialog-title"
              className="text-base font-semibold text-zinc-100"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5">
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-white/[0.1] px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
