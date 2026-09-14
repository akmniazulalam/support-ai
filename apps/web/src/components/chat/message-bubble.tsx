import { BotIcon, UserIcon } from './icons';
import type { PublicMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: PublicMessage;
  agentName?: string;
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}

export function MessageBubble({ message, agentName }: MessageBubbleProps) {
  const isUser = message.role === 'USER';
  const formattedTime = formatTime(message.createdAt);

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 animate-message-entrance group">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[78%]">
          <div className="rounded-2xl rounded-tr-xs px-4 py-2.5 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 text-zinc-100 shadow-md text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
          {formattedTime && (
            <span className="text-[10px] text-zinc-500 font-mono mt-1 select-none pr-1">
              {formattedTime}
            </span>
          )}
        </div>
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800/90 border border-white/[0.1] text-zinc-300 shadow-xs"
          aria-hidden="true"
        >
          <UserIcon className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 animate-message-entrance group">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#14151e] border border-white/[0.08] text-zinc-300 shadow-xs mt-0.5"
        aria-hidden="true"
      >
        <BotIcon className="h-3.5 w-3.5" />
      </div>

      <div className="flex flex-col items-start max-w-[88%] sm:max-w-[80%]">
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <span className="text-xs font-medium text-zinc-300">
            {agentName || 'Support Assistant'}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-white/[0.05] border border-white/[0.06] text-zinc-400 font-mono">
            AI
          </span>
        </div>

        <div className="rounded-2xl rounded-tl-xs px-4 py-2.5 bg-[#14151f] border border-white/[0.08] text-zinc-200 shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {formattedTime && (
          <span className="text-[10px] text-zinc-500 font-mono mt-1 select-none pl-1">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}
