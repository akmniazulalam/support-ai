import { AlertCircleIcon, ClockIcon, RotateCcwIcon } from './icons';

interface ChatNotFoundStateProps {
  message?: string;
}

export function ChatNotFoundState({
  message = 'This support agent could not be found or is currently inactive.',
}: ChatNotFoundStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center animate-message-entrance">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-850/80 border border-white/[0.08] text-zinc-400 mb-4 shadow-md">
        <AlertCircleIcon className="h-6 w-6 text-zinc-400" />
      </div>

      <h2 className="text-base font-semibold text-zinc-100 mb-1.5">
        Agent Unavailable
      </h2>

      <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      <div className="text-[11px] text-zinc-400 font-lexend">
        Please verify the URL or contact the workspace administrator.
      </div>
    </div>
  );
}

interface ChatRateLimitBannerProps {
  secondsRemaining: number;
}

export function ChatRateLimitBanner({ secondsRemaining }: ChatRateLimitBannerProps) {
  return (
    <div
      role="alert"
      className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 text-xs text-amber-200 animate-message-entrance"
    >
      <div className="flex items-center gap-2">
        <ClockIcon className="h-4 w-4 shrink-0 text-amber-400" />
        <span>Rate limit reached. Please wait before sending another message.</span>
      </div>

      <span className="shrink-0 font-lexend text-[11px] font-semibold text-amber-400 px-2 py-0.5 rounded bg-amber-500/15">
        {secondsRemaining}s
      </span>
    </div>
  );
}

interface ChatInlineErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ChatInlineErrorBanner({
  message,
  onRetry,
}: ChatInlineErrorBannerProps) {
  return (
    <div
      role="alert"
      className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-200 animate-message-entrance"
    >
      <div className="flex items-center gap-2 truncate">
        <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400" />
        <span className="truncate">{message}</span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 px-2.5 py-1 text-[11px] font-medium text-red-200 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
        >
          <RotateCcwIcon className="h-3 w-3" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

export function ChatLoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-400 mb-3 shadow-sm">
        <span className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs text-zinc-400 font-lexend">
        Connecting to support agent...
      </p>
    </div>
  );
}
