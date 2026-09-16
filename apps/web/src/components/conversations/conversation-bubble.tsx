'use client';

import { BotIcon, UserIcon } from '@/components/ui/icons';
import { formatFullDateTime, formatMessageTime } from '@/lib/utils/date';
import type { ConversationMessage } from '@/types/conversations';

interface ConversationBubbleProps {
  message: ConversationMessage;
  agentName?: string;
}

export function ConversationBubble({
  message,
  agentName,
}: ConversationBubbleProps) {
  const isCustomer = message.role === 'USER';
  const timeStr = formatMessageTime(message.createdAt);
  const fullDateTime = formatFullDateTime(message.createdAt);

  if (isCustomer) {
    return (
      <div className="flex justify-end gap-2.5 animate-message-entrance group">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-[11px] font-medium text-zinc-400">Customer</span>
          </div>

          {/* Bubble */}
          <div className="rounded-2xl rounded-tr-xs px-4 py-2.5 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 text-zinc-100 shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Timestamp */}
          {timeStr && (
            <span
              title={fullDateTime}
              className="text-[10px] text-zinc-500 font-lexend mt-1 select-none pr-1"
            >
              {timeStr}
            </span>
          )}
        </div>

        {/* Customer Avatar */}
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-white/[0.1] text-zinc-300 shadow-xs mt-0.5"
          aria-label="Customer message"
        >
          <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 animate-message-entrance group">
      {/* Agent Avatar */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#141520] border border-white/[0.1] text-zinc-300 shadow-xs mt-0.5"
        aria-label="Agent AI message"
      >
        <BotIcon className="h-3.5 w-3.5 text-emerald-400" />
      </div>

      <div className="flex flex-col items-start max-w-[88%] sm:max-w-[78%]">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <span className="text-xs font-semibold text-zinc-200">
            {agentName || 'AI Agent'}
          </span>
          <span className="text-[9px] font-lexend uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            AI
          </span>
        </div>

        {/* Bubble */}
        <div className="rounded-2xl rounded-tl-xs px-4 py-2.5 bg-[#141520] border border-white/[0.08] text-zinc-200 shadow-xs text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Timestamp */}
        {timeStr && (
          <span
            title={fullDateTime}
            className="text-[10px] text-zinc-500 font-lexend mt-1 select-none pl-1"
          >
            {timeStr}
          </span>
        )}
      </div>
    </div>
  );
}
