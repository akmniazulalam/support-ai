'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BotIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
} from '@/components/ui/icons';
import { getConversation, sendMessage } from '@/lib/api/conversations';
import { AuthApiError } from '@/lib/api/auth';
import { formatRelativeTime, getShortConversationId } from '@/lib/utils/date';
import type { Agent } from '@/types/agents';
import type { ConversationDetail as IConversationDetail, ConversationMessage } from '@/types/conversations';
import { ConversationBubble } from './conversation-bubble';
import { ConversationComposer } from './conversation-composer';

interface ConversationDetailProps {
  conversationId: string;
  agent?: Agent | null;
  onBack?: () => void;
  onConversationUpdated?: () => void;
}

export function ConversationDetail({
  conversationId,
  agent,
  onBack,
  onConversationUpdated,
}: ConversationDetailProps) {
  const [conversation, setConversation] = useState<IConversationDetail | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages or sending state change
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch conversation details
  useEffect(() => {
    let isMounted = true;

    async function loadConversation() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getConversation(conversationId);
        if (isMounted) {
          setConversation(data);
          setOptimisticMessages([]);
        }
      } catch (err) {
        if (isMounted) {
          const msg =
            err instanceof AuthApiError
              ? err.message
              : 'Failed to load conversation history.';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadConversation();

    return () => {
      isMounted = false;
    };
  }, [conversationId, reloadKey]);

  // Scroll to bottom on initial load or message change
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom('auto');
    }
  }, [isLoading, conversation?.messages.length, optimisticMessages.length]);

  const handleSendMessage = async (content: string) => {
    setIsSending(true);
    setSendError(null);

    // Add optimistic user message
    const tempUserMsg: ConversationMessage = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    };
    setOptimisticMessages([tempUserMsg]);

    try {
      await sendMessage(conversationId, content);

      // Re-fetch conversation to sync server-assigned IDs and timestamps
      const refreshed = await getConversation(conversationId);
      setConversation(refreshed);
      setOptimisticMessages([]);
      onConversationUpdated?.();
      scrollToBottom();
    } catch (err) {
      setOptimisticMessages([]);
      const msg =
        err instanceof AuthApiError
          ? err.message
          : 'Failed to send message. Please try again.';
      setSendError(msg);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  const shortId = getShortConversationId(conversationId);
  const allMessages = [
    ...(conversation?.messages || []),
    ...optimisticMessages,
  ];

  return (
    <div className="flex h-full flex-col bg-[#0c0d14] overflow-hidden">
      {/* Detail Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 bg-[#111218]/90 backdrop-blur-xs shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Back button (mobile) */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations list"
              className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100 font-lexend truncate">
                Conversation {shortId}
              </h2>
              {conversation?.updatedAt && (
                <span className="text-[10px] text-zinc-500 font-lexend hidden sm:inline">
                  Active {formatRelativeTime(conversation.updatedAt)}
                </span>
              )}
            </div>

            {/* Agent info */}
            {agent && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 truncate">
                <BotIcon className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="truncate">{agent.name}</span>
                <span className="text-zinc-600 font-lexend text-[10px]">/{agent.slug}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {agent?.publicId && (
            <Link
              href={`/chat/${agent.publicId}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open public customer chat in new tab"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              <span>Public Chat</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={isLoading}
            title="Refresh messages"
            aria-label="Refresh messages"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors disabled:opacity-40"
          >
            <RefreshCwIcon className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Message History Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 chat-scrollbar">
        {/* Loading State */}
        {isLoading && (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-zinc-500">
            <div className="h-6 w-6 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
            <span className="text-xs font-lexend">Loading messages...</span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircleIcon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.05] transition-colors"
            >
              <RefreshCwIcon className="h-3 w-3" />
              Try again
            </button>
          </div>
        )}

        {/* Empty Messages State */}
        {!isLoading && !error && allMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center text-zinc-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/[0.08] mb-3">
              <BotIcon className="h-6 w-6 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">No messages yet</p>
            <p className="mt-1 text-xs text-zinc-500 max-w-xs">
              Send a customer message using the composer below to begin the conversation with the AI agent.
            </p>
          </div>
        )}

        {/* Messages List */}
        {!isLoading && !error && allMessages.length > 0 && (
          <>
            <div className="flex items-center justify-center my-2">
              <span className="text-[10px] font-lexend text-zinc-600 uppercase tracking-wider bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/[0.04]">
                Conversation started {conversation?.createdAt ? formatRelativeTime(conversation.createdAt) : ''}
              </span>
            </div>

            {allMessages.map((message) => (
              <ConversationBubble
                key={message.id}
                message={message}
                agentName={agent?.name}
              />
            ))}

            {/* AI Formulating Reply Indicator */}
            {isSending && (
              <div className="flex items-start gap-2.5 animate-message-entrance">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#141520] border border-white/[0.1] text-emerald-400 mt-0.5">
                  <BotIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-xs font-semibold text-zinc-200">
                      {agent?.name || 'AI Agent'}
                    </span>
                    <span className="text-[9px] font-lexend uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Thinking
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs px-4 py-3 bg-[#141520] border border-white/[0.08]">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-typing-dot-1" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-typing-dot-2" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-typing-dot-3" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <ConversationComposer
        onSendMessage={handleSendMessage}
        disabled={isLoading || !!error}
        isSending={isSending}
        errorMessage={sendError}
        onClearError={() => setSendError(null)}
        placeholder={
          agent
            ? `Type a message to ${agent.name}...`
            : 'Type a message...'
        }
      />
    </div>
  );
}
