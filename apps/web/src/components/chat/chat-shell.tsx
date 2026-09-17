'use client';

import {
  ChatHeader,
} from './chat-header';
import {
  ChatInlineErrorBanner,
  ChatLoadingState,
  ChatNotFoundState,
  ChatRateLimitBanner,
} from './chat-error-state';
import { MessageComposer } from './message-composer';
import { MessageList } from './message-list';
import { usePublicChat } from '@/hooks/use-public-chat';

interface ChatShellProps {
  publicId: string;
}

export function ChatShell({ publicId }: ChatShellProps) {
  const {
    agent,
    messages,
    status,
    errorMessage,
    rateLimitSecondsRemaining,
    lastFailedMessage,
    sendMessage,
    retryLastMessage,
    resetConversation,
    reloadAgent,
  } = usePublicChat(publicId);

  // Initial loading state while connecting to agent
  if (status === 'initializing') {
    return (
      <div className="flex h-dvh w-full items-center justify-center p-0 sm:p-6 bg-[#09090b]">
        <div className="relative flex h-full w-full sm:h-[85vh] sm:max-h-[820px] sm:max-w-2xl flex-col sm:rounded-2xl sm:border sm:border-white/[0.08] sm:bg-[#0f1017] sm:shadow-2xl sm:shadow-black/70 overflow-hidden">
          <ChatLoadingState />
        </div>
      </div>
    );
  }

  // Not found or inactive agent state (404)
  if (status === 'not_found') {
    return (
      <div className="flex h-dvh w-full items-center justify-center p-0 sm:p-6 bg-[#09090b]">
        <div className="relative flex h-full w-full sm:h-[85vh] sm:max-h-[820px] sm:max-w-2xl flex-col sm:rounded-2xl sm:border sm:border-white/[0.08] sm:bg-[#0f1017] sm:shadow-2xl sm:shadow-black/70 overflow-hidden">
          <ChatNotFoundState message={errorMessage || undefined} />
        </div>
      </div>
    );
  }

  const isRateLimited = status === 'rate_limited' || rateLimitSecondsRemaining > 0;
  const isSending = status === 'sending';

  return (
    <div className="flex h-dvh w-full items-center justify-center p-0 sm:p-4 md:p-6 bg-[#09090b]">
      {/* Background subtle radial spotlight for desktop */}
      <div
        className="pointer-events-none fixed inset-0 hidden sm:block overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-zinc-800/10 blur-[120px] rounded-full" />
      </div>

      {/* Main chat application container */}
      <div className="relative flex h-full w-full sm:h-[85vh] sm:max-h-[820px] sm:max-w-2xl flex-col sm:rounded-2xl sm:border sm:border-white/[0.08] sm:bg-[#0f1017] sm:shadow-2xl sm:shadow-black/70 overflow-hidden z-10">
        {/* Subtle top edge gradient highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-20 pointer-events-none"
          aria-hidden="true"
        />

        {/* Header bar */}
        <ChatHeader
          agent={agent}
          onReset={resetConversation}
          disabled={isSending}
        />

        {/* Scrollable message stream & greeting */}
        <MessageList
          messages={messages}
          agent={agent}
          isSending={isSending}
        />

        {/* Rate limit warning banner */}
        {isRateLimited && (
          <ChatRateLimitBanner secondsRemaining={rateLimitSecondsRemaining} />
        )}

        {/* General inline error banner with optional retry */}
        {status === 'error' && errorMessage && (
          <ChatInlineErrorBanner
            message={errorMessage}
            onRetry={lastFailedMessage ? retryLastMessage : () => void reloadAgent()}
          />
        )}

        {/* Message composer input */}
        <MessageComposer
          onSend={sendMessage}
          disabled={isSending || isRateLimited}
          placeholder={`Message ${agent?.name || 'Support Assistant'}...`}
        />
      </div>
    </div>
  );
}
