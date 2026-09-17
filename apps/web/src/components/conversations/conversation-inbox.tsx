'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircleIcon,
  BotIcon,
  ExternalLinkIcon,
  MessagesSquareIcon,
  PlusIcon,
  RefreshCwIcon,
} from '@/components/ui/icons';
import { getAgents } from '@/lib/api/agents';
import { AuthApiError } from '@/lib/api/auth';
import {
  createConversation,
  getAgentConversations,
  getConversation,
} from '@/lib/api/conversations';
import type { Agent } from '@/types/agents';
import type { ConversationSummary } from '@/types/conversations';
import { ConversationDetail } from './conversation-detail';
import { ConversationList } from './conversation-list';

interface ConversationInboxProps {
  initialConversationId?: string | null;
}

export function ConversationInbox({
  initialConversationId = null,
}: ConversationInboxProps) {
  const router = useRouter();

  // Agents state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  // Conversations state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const selectedConversationId = initialConversationId;
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [conversationsReloadKey, setConversationsReloadKey] = useState(0);
  const [agentsReloadKey, setAgentsReloadKey] = useState(0);

  // Load user's agents
  useEffect(() => {
    let isMounted = true;

    async function loadAgents() {
      setIsLoadingAgents(true);
      setAgentsError(null);
      try {
        const agentList = await getAgents();
        if (!isMounted) return;
        setAgents(agentList);

        // Determine which agent should be active initially
        if (agentList.length > 0) {
          if (initialConversationId) {
            // Check if we can find the agent for this initial conversation
            try {
              const detail = await getConversation(initialConversationId);
              if (isMounted) {
                setSelectedAgentId(detail.agentId);
                return;
              }
            } catch {
              // Fallback to first agent if conversation lookup fails
            }
          }

          // Default to first agent if not already set
          setSelectedAgentId((prev) => (prev ? prev : agentList[0].id));
        }
      } catch {
        if (isMounted) {
          setAgentsError('Unable to load agents. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingAgents(false);
        }
      }
    }

    void loadAgents();

    return () => {
      isMounted = false;
    };
  }, [initialConversationId, agentsReloadKey]);

  // Load conversations for the selected agent
  useEffect(() => {
    let isMounted = true;

    async function loadConversations() {
      if (!selectedAgentId) {
        if (isMounted) setConversations([]);
        return;
      }

      setIsLoadingConversations(true);
      setConversationsError(null);
      try {
        const list = await getAgentConversations(selectedAgentId);
        if (isMounted) {
          setConversations(list);
        }
      } catch {
        if (isMounted) {
          setConversationsError('Unable to load conversations for this agent.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingConversations(false);
        }
      }
    }

    void loadConversations();

    return () => {
      isMounted = false;
    };
  }, [selectedAgentId, conversationsReloadKey]);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback(
    (id: string) => {
      router.push(`/dashboard/conversations/${id}`);
    },
    [router],
  );

  // Handle back navigation on mobile
  const handleBackToInbox = useCallback(() => {
    router.push('/dashboard/conversations');
  }, [router]);

  // Create a new conversation thread for the selected agent
  const handleCreateConversation = async () => {
    if (!selectedAgentId || isCreatingThread) return;
    setIsCreatingThread(true);
    setConversationsError(null);
    try {
      const newConv = await createConversation(selectedAgentId);
      setConversations((prev) => [newConv, ...prev]);
      handleSelectConversation(newConv.id);
    } catch (err) {
      const msg =
        err instanceof AuthApiError
          ? err.message
          : 'Failed to create a new conversation thread. Please try again.';
      setConversationsError(msg);
    } finally {
      setIsCreatingThread(false);
    }
  };

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId),
    [agents, selectedAgentId],
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-6.5rem)] min-h-[580px] rounded-2xl border border-white/[0.08] bg-[#0c0d14] shadow-2xl shadow-black/60 overflow-hidden animate-message-entrance">
      {/* Global agent error banner if agents failed to load */}
      {agentsError && (
        <div className="flex items-center justify-between gap-3 border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            <span>{agentsError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAgentsReloadKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-md border border-red-500/30 px-2 py-0.5 text-xs font-medium text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <RefreshCwIcon className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full lg:w-80 xl:w-96 shrink-0 border-r border-white/[0.08] flex-col h-full ${
            selectedConversationId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <ConversationList
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgentId={(id) => {
              setSelectedAgentId(id);
              router.push('/dashboard/conversations');
            }}
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            isLoading={isLoadingAgents || isLoadingConversations}
            error={conversationsError}
            onRefresh={() => setConversationsReloadKey((k) => k + 1)}
            onCreateConversation={
              agents.length > 0 ? handleCreateConversation : undefined
            }
            isCreating={isCreatingThread}
          />
        </div>

        {/* Right Column: Selected Conversation Detail or Empty Placeholder */}
        <div
          className={`flex-1 min-w-0 flex-col h-full bg-[#0c0d14] ${
            selectedConversationId ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedConversationId ? (
            <ConversationDetail
              conversationId={selectedConversationId}
              agent={selectedAgent}
              onBack={handleBackToInbox}
              onConversationUpdated={() =>
                setConversationsReloadKey((k) => k + 1)
              }
            />
          ) : (
            /* Empty selection placeholder (desktop) */
            <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-[#0c0d14]">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.1] text-zinc-400 shadow-xl mb-4">
                <MessagesSquareIcon className="h-8 w-8 text-zinc-300" />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0c0d14]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>

              <h2 className="text-base font-bold text-zinc-100">
                SupportAI Customer Inbox
              </h2>
              <p className="mt-1.5 text-xs text-zinc-400 max-w-sm leading-relaxed">
                Select a conversation from the left to read customer interactions, review AI answers, and reply.
              </p>

              {/* Helpful CTA actions */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {agents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCreateConversation}
                    disabled={isCreatingThread || !selectedAgentId}
                    className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Start New Thread</span>
                  </button>
                )}

                {selectedAgent?.publicId && (
                  <Link
                    href={`/chat/${selectedAgent.publicId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.08] transition-colors"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    <span>Open Public Chat</span>
                  </Link>
                )}

                {selectedAgent && (
                  <Link
                    href={`/dashboard/agents/${selectedAgent.id}`}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] transition-colors"
                  >
                    <BotIcon className="h-4 w-4" />
                    <span>Agent Settings</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
