'use client';

import { BotIcon, MessageSquareIcon } from '@/components/ui/icons';
import { formatRelativeTime, getShortConversationId } from '@/lib/utils/date';
import type { ConversationSummary } from '@/types/conversations';

interface ConversationItemProps {
  conversation: ConversationSummary;
  agentName?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function ConversationItem({
  conversation,
  agentName,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  const shortId = getShortConversationId(conversation.id);
  const relativeTime = formatRelativeTime(conversation.updatedAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? 'true' : undefined}
      className={`group relative flex w-full flex-col gap-2 rounded-xl p-3.5 text-left transition-all duration-150 border focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
        isSelected
          ? 'bg-white/[0.08] border-white/[0.14] text-zinc-100 shadow-xs'
          : 'bg-[#111218]/60 hover:bg-[#141520] border-white/[0.05] hover:border-white/[0.1] text-zinc-400'
      }`}
    >
      {/* Top row: ID + Relative time */}
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              isSelected
                ? 'bg-zinc-800 border-white/[0.2] text-zinc-200'
                : 'bg-zinc-900 border-white/[0.06] text-zinc-500 group-hover:text-zinc-300'
            }`}
          >
            <MessageSquareIcon className="h-3.5 w-3.5" />
          </div>
          <span
            className={`font-lexend text-xs font-semibold truncate ${
              isSelected ? 'text-zinc-100' : 'text-zinc-300 group-hover:text-zinc-100'
            }`}
          >
            Conversation {shortId}
          </span>
        </div>

        <span className="text-[10px] font-lexend text-zinc-500 shrink-0 select-none">
          {relativeTime}
        </span>
      </div>

      {/* Bottom row: Agent tag */}
      <div className="flex items-center justify-between gap-2 pl-9 text-[11px]">
        {agentName && (
          <div className="flex items-center gap-1.5 text-zinc-400 truncate">
            <BotIcon className="h-3 w-3 shrink-0 text-zinc-500" />
            <span className="truncate">{agentName}</span>
          </div>
        )}

        <span className="text-[10px] text-zinc-600 font-lexend shrink-0">
          ID: {conversation.id.slice(0, 8)}…
        </span>
      </div>

      {/* Selected indicator bar */}
      {isSelected && (
        <span
          className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-emerald-500"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
