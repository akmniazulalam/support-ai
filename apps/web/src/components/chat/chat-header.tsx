import { BotIcon, RotateCcwIcon, ShieldCheckIcon } from './icons';
import type { AgentPublicInfo } from '@/types/chat';

interface ChatHeaderProps {
  agent: AgentPublicInfo | null;
  onReset: () => void;
  disabled?: boolean;
}

export function ChatHeader({ agent, onReset, disabled = false }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3.5 sm:px-6 border-b border-white/[0.08] bg-[#0c0d14]/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800/90 border border-white/[0.1] text-zinc-200 shadow-xs">
            <BotIcon className="h-5 w-5 text-zinc-300" />
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#0c0d14]"
            title="Agent is online"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-zinc-100 truncate tracking-tight">
              {agent?.name || 'Support Assistant'}
            </h1>
            <span
              className="flex items-center text-zinc-400"
              title="Verified SupportAI Agent"
            >
              <ShieldCheckIcon className="h-3.5 w-3.5 text-zinc-400" />
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>SupportAI Agent</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          aria-label="Start new conversation"
          title="Start new conversation"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] border border-white/[0.07] px-2.5 py-1.5 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          <RotateCcwIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
}
