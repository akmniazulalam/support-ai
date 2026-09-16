'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircleIcon,
  BotIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  MessagesSquareIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  XIcon,
} from '@/components/ui/icons';
import type { Agent } from '@/types/agents';
import type { ConversationSummary } from '@/types/conversations';
import { ConversationItem } from './conversation-item';

interface ConversationListProps {
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgentId: (id: string) => void;
  conversations: ConversationSummary[];
  selectedConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onCreateConversation?: () => Promise<void>;
  isCreating?: boolean;
}

export function ConversationList({
  agents,
  selectedAgentId,
  onSelectAgentId,
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  error,
  onRefresh,
  onCreateConversation,
  isCreating = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId),
    [agents, selectedAgentId],
  );

  // Filter conversations by search query (matching short or full ID)
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.trim().toLowerCase();
    return conversations.filter((c) =>
      c.id.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  return (
    <div className="flex h-full flex-col bg-[#0c0d14] overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-white/[0.08] bg-[#111218]/80 shrink-0 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-zinc-100">
              Conversations
            </h1>
            {!isLoading && (
              <span className="text-[11px] font-lexend px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
                {conversations.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh conversation list"
              aria-label="Refresh conversations"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors disabled:opacity-40"
            >
              <RefreshCwIcon className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {onCreateConversation && (
              <button
                type="button"
                onClick={() => void onCreateConversation()}
                disabled={isCreating || !selectedAgentId || isLoading}
                title="Start a new conversation thread"
                className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {isCreating ? (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-900/30 border-t-zinc-900 animate-spin" />
                ) : (
                  <PlusIcon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">New Thread</span>
              </button>
            )}
          </div>
        </div>

        {/* Agent Filter Selector */}
        {agents.length > 0 && (
          <div>
            <label
              htmlFor="agent-filter-select"
              className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1"
            >
              Filter by Agent
            </label>
            <div className="relative">
              <select
                id="agent-filter-select"
                value={selectedAgentId}
                onChange={(e) => onSelectAgentId(e.target.value)}
                aria-label="Select an agent to view conversations"
                className="w-full appearance-none rounded-xl border border-white/[0.1] bg-[#141520] py-2 pl-3 pr-8 text-xs font-medium text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer truncate"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id} className="bg-[#141520] text-zinc-200">
                    {agent.name} {agent.isActive ? '• Active' : '• Inactive'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* Search Input */}
        {conversations.length > 0 && (
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations by ID"
              className="w-full rounded-lg border border-white/[0.08] bg-[#141520] py-1.5 pl-8 pr-7 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded text-zinc-500 hover:text-zinc-300"
              >
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 chat-scrollbar">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-2 p-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.05] bg-[#111218]/50 p-3.5 space-y-2.5 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 rounded bg-white/[0.06]" />
                  <div className="h-3 w-12 rounded bg-white/[0.04]" />
                </div>
                <div className="h-3 w-36 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center space-y-3">
            <AlertCircleIcon className="h-5 w-5 text-red-400 mx-auto" />
            <p className="text-xs text-red-400">{error}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] transition-colors"
            >
              <RefreshCwIcon className="h-3 w-3" />
              Try again
            </button>
          </div>
        )}

        {/* Empty State: No Agents */}
        {!isLoading && !error && agents.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/[0.08]">
              <BotIcon className="h-6 w-6 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-200">No agents yet</p>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Create your first AI support agent to start receiving customer conversations.
            </p>
            <Link
              href="/dashboard/agents/new"
              className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Create an Agent
            </Link>
          </div>
        )}

        {/* Empty State: Agent has no conversations */}
        {!isLoading && !error && agents.length > 0 && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/[0.08]">
              <MessagesSquareIcon className="h-6 w-6 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-200">No conversations yet</p>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Customer conversations will appear here when customers start chatting with{' '}
              <span className="text-zinc-400 font-medium">{selectedAgent?.name || 'this agent'}</span>.
            </p>

            <div className="flex flex-col gap-2 w-full pt-1">
              {onCreateConversation && (
                <button
                  type="button"
                  onClick={() => void onCreateConversation()}
                  disabled={isCreating}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors disabled:opacity-50"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Start a conversation</span>
                </button>
              )}

              {selectedAgent?.publicId && (
                <Link
                  href={`/chat/${selectedAgent.publicId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.04] transition-colors"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  <span>Open Public Chat</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Empty State: Search filter yielded 0 results */}
        {!isLoading &&
          !error &&
          conversations.length > 0 &&
          filteredConversations.length === 0 && (
            <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
              <p>No conversations matching &ldquo;{searchQuery}&rdquo;</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-zinc-400 hover:text-zinc-200 underline text-xs"
              >
                Clear search
              </button>
            </div>
          )}

        {/* Conversation Items */}
        {!isLoading &&
          !error &&
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              agentName={selectedAgent?.name}
              isSelected={conversation.id === selectedConversationId}
              onSelect={() => onSelectConversation(conversation.id)}
            />
          ))}
      </div>
    </div>
  );
}
