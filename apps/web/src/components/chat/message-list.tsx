import { useEffect, useRef } from 'react';
import { BotIcon, SparklesIcon } from './icons';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import type { AgentPublicInfo, PublicMessage } from '@/types/chat';

interface MessageListProps {
  messages: PublicMessage[];
  agent: AgentPublicInfo | null;
  isSending: boolean;
}

export function MessageList({ messages, agent, isSending }: MessageListProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      scrollEndRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending]);

  const hasMessages = messages.length > 0;
  const greeting = agent?.greeting;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-4 chat-scrollbar">
      {/* Welcome state when no conversation messages exist */}
      {!hasMessages && (
        <div className="flex flex-col items-center justify-center min-h-[260px] text-center my-auto py-8 px-4 animate-message-entrance">
          <div className="relative mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#141620] border border-white/[0.1] text-zinc-300 shadow-lg shadow-black/40">
              <BotIcon className="h-7 w-7 text-zinc-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#090a0f] border border-white/[0.1]">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-1.5 mb-1.5">
            <span>{agent?.name || 'Support Assistant'}</span>
            <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </h2>

          <p className="text-xs text-zinc-400 max-w-sm mb-5 leading-normal">
            Ask any question regarding our products, documentation, or services.
          </p>

          {greeting && (
            <div className="w-full max-w-md rounded-2xl p-4 bg-[#141520]/80 border border-white/[0.08] text-left shadow-sm backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-2 text-xs font-medium text-zinc-300">
                <SparklesIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span>Greeting from {agent?.name || 'Agent'}</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                {greeting}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Render conversation messages */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          agentName={agent?.name}
        />
      ))}

      {/* Typing indicator */}
      {isSending && <TypingIndicator agentName={agent?.name} />}

      {/* Anchor for auto-scrolling */}
      <div ref={scrollEndRef} className="h-px" />
    </div>
  );
}
