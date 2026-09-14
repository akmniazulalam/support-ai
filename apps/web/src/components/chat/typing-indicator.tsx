import { BotIcon } from './icons';

interface TypingIndicatorProps {
  agentName?: string;
}

export function TypingIndicator({ agentName }: TypingIndicatorProps) {
  return (
    <div
      className="flex items-start gap-3 animate-message-entrance"
      role="status"
      aria-live="polite"
      aria-label={`${agentName || 'Assistant'} is typing`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 border border-white/[0.08] text-zinc-400">
        <BotIcon className="h-4 w-4" />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 h-9 rounded-2xl rounded-tl-sm px-4 bg-[#14151e] border border-white/[0.08] shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-typing-dot-1" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-typing-dot-2" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-typing-dot-3" />
        </div>
      </div>
    </div>
  );
}
