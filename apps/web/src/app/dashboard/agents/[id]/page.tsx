'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  BotIcon,
  CheckIcon,
  ExternalLinkIcon,
  SendIcon,
  TrashIcon,
  ZapIcon,
} from '@/components/ui/icons';
import {
  deleteAgent,
  getAgent,
  updateAgent,
} from '@/lib/api/agents';
import { AuthApiError } from '@/lib/api/auth';
import {
  createConversation,
  getConversation,
  sendMessage as sendConversationMessage,
} from '@/lib/api/conversations';
import type { Agent } from '@/types/agents';
import { DeleteConfirmDialog } from '../delete-confirm-dialog';

// ─── Test Chat ─────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatError {
  message: string;
  isRateLimit: boolean;
}

/** sessionStorage key for storing the test-chat conversationId per agent. */
function sessionKey(agentId: string) {
  return `supportai_test_conv_${agentId}`;
}

function TestChatPanel({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [chatError, setChatError] = useState<ChatError | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // On mount: try to restore an existing conversation from sessionStorage
  useEffect(() => {
    let isMounted = true;

    async function restoreOrInit() {
      setIsLoadingHistory(true);
      const stored = sessionStorage.getItem(sessionKey(agent.id));

      if (stored) {
        try {
          const detail = await getConversation(stored);
          if (!isMounted) return;
          conversationIdRef.current = detail.id;
          setMessages(
            detail.messages.map((m) => ({
              role: m.role === 'USER' ? 'user' : 'assistant',
              content: m.content,
            })),
          );
        } catch {
          // Conversation no longer accessible — clear stale key and start fresh
          sessionStorage.removeItem(sessionKey(agent.id));
          conversationIdRef.current = null;
        }
      }

      if (isMounted) setIsLoadingHistory(false);
    }

    void restoreOrInit();
    return () => {
      isMounted = false;
    };
  }, [agent.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function getOrCreateConversationId(): Promise<string> {
    if (conversationIdRef.current) return conversationIdRef.current;
    const conv = await createConversation(agent.id);
    conversationIdRef.current = conv.id;
    sessionStorage.setItem(sessionKey(agent.id), conv.id);
    return conv.id;
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setInput('');
    setChatError(null);
    setLastFailedMessage(null);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsSending(true);

    try {
      const conversationId = await getOrCreateConversationId();
      const { message } = await sendConversationMessage(conversationId, text);
      setMessages((prev) => [...prev, { role: 'assistant', content: message.content }]);
    } catch (err) {
      setLastFailedMessage(text);
      if (
        err instanceof AuthApiError &&
        err.code === 'AI_USAGE_LIMIT_REACHED'
      ) {
        setChatError({
          message: err.message,
          isRateLimit: true,
        });
      } else {
        setChatError({
          message:
            err instanceof AuthApiError
              ? err.message
              : 'Failed to get a response. Please try again.',
          isRateLimit: false,
        });
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleRetry() {
    if (!lastFailedMessage || isSending) return;
    const textToRetry = lastFailedMessage;
    setLastFailedMessage(null);
    setChatError(null);
    setIsSending(true);

    try {
      const conversationId = await getOrCreateConversationId();
      const { message } = await sendConversationMessage(conversationId, textToRetry);
      setMessages((prev) => [...prev, { role: 'assistant', content: message.content }]);
    } catch (err) {
      setLastFailedMessage(textToRetry);
      if (
        err instanceof AuthApiError &&
        err.code === 'AI_USAGE_LIMIT_REACHED'
      ) {
        setChatError({
          message: err.message,
          isRateLimit: true,
        });
      } else {
        setChatError({
          message:
            err instanceof AuthApiError
              ? err.message
              : 'Failed to get a response. Please try again.',
          isRateLimit: false,
        });
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#111218] overflow-hidden h-[520px]">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-2">
          <ZapIcon className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-zinc-200">Test Chat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-lexend text-zinc-500">
            Session persists · reloads restore history
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 chat-scrollbar">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full gap-2 text-zinc-500">
            <span className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
            <span className="text-xs font-lexend">Loading history…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-6">
            <BotIcon className="h-8 w-8 text-zinc-600" />
            <p className="text-xs text-zinc-500 max-w-xs">
              Send a message to test how your agent responds using its current instructions and knowledge base.
            </p>
          </div>
        ) : null}

        {!isLoadingHistory && messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-white/[0.1] mr-2 mt-0.5">
                <BotIcon className="h-3 w-3 text-zinc-300" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-zinc-200 text-zinc-900 rounded-br-sm'
                  : 'bg-[#1a1b26] border border-white/[0.08] text-zinc-200 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-white/[0.1] mr-2 mt-0.5">
              <BotIcon className="h-3 w-3 text-zinc-300" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-[#1a1b26] border border-white/[0.08] px-3.5 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-typing-dot-1" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-typing-dot-2" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-typing-dot-3" />
            </div>
          </div>
        )}

        {chatError && (
          <div className="flex items-start justify-between gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="text-xs text-red-400">
                <p>{chatError.message}</p>
                {chatError.isRateLimit && (
                  <Link
                    href="/dashboard/billing"
                    className="mt-1 inline-block text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
                  >
                    Upgrade to Pro for more messages →
                  </Link>
                )}
              </div>
            </div>
            {!chatError.isRateLimit && lastFailedMessage && (
              <button
                type="button"
                onClick={() => void handleRetry()}
                disabled={isSending}
                className="shrink-0 text-xs text-red-400 hover:text-red-300 font-medium underline underline-offset-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-white/[0.08] shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a test message…"
          disabled={isSending || isLoadingHistory}
          className="flex-1 min-w-0 rounded-xl border border-white/[0.1] bg-[#0c0d14] px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending || isLoadingHistory}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const agentId = params.id;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Edit form state
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAgent() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getAgent(agentId);
        if (!isMounted) return;
        setAgent(data);
        setName(data.name);
        setGreeting(data.greeting ?? '');
        setInstructions(data.instructions ?? '');
        setIsActive(data.isActive);
      } catch {
        if (isMounted) setLoadError('Agent not found or you do not have access.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadAgent();

    return () => {
      isMounted = false;
    };
  }, [agentId]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError('Agent name is required.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updated = await updateAgent(agentId, {
        name: name.trim(),
        greeting: greeting.trim() || undefined,
        instructions: instructions.trim() || undefined,
        isActive,
      });
      setAgent(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setSaveError(
          err.validationErrors ? err.validationErrors.join(', ') : err.message,
        );
      } else {
        setSaveError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAgent(agentId);
      router.push('/dashboard/agents');
    } catch {
      setDeleteError('Failed to delete agent. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111218] p-20 animate-message-entrance">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
          <p className="text-xs font-lexend text-zinc-500">Loading agent…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (loadError || !agent) {
    return (
      <div className="animate-message-entrance">
        <Link
          href="/dashboard/agents"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Agents
        </Link>
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <AlertCircleIcon className="h-5 w-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">
              {loadError ?? 'Agent not found.'}
            </p>
            <button
              type="button"
              onClick={() => router.push('/dashboard/agents')}
              className="mt-2 text-xs text-zinc-400 hover:text-zinc-200 underline"
            >
              Return to agents list
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="animate-message-entrance pb-10 space-y-6">
        {/* Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/dashboard/agents"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Agents
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {/* Public chat link */}
            <Link
              href={`/chat/${agent.publicId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              Public Chat
            </Link>

            {/* Knowledge Base */}
            <Link
              href={`/dashboard/agents/${agent.id}/knowledge`}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
            >
              <BookOpenIcon className="h-3.5 w-3.5" />
              Knowledge Base
            </Link>

            {/* Delete */}
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 border border-white/[0.1]">
            <BotIcon className="h-6 w-6 text-zinc-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
              {agent.name}
            </h1>
            <p className="text-xs font-lexend text-zinc-500 truncate">/{agent.slug}</p>
          </div>
          <span
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              agent.isActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-zinc-800 text-zinc-500 border border-white/[0.06]'
            }`}
          >
            {agent.isActive ? (
              <ZapIcon className="h-3 w-3" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            )}
            {agent.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* LEFT — Edit Form */}
          <div>
            <form onSubmit={handleSave} noValidate className="space-y-4">
              {/* Save Error */}
              {saveError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <p className="text-sm text-red-400">{saveError}</p>
                </div>
              )}

              {/* Name */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Agent Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors"
                />
              </div>

              {/* Greeting */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Greeting Message{' '}
                  <span className="text-zinc-600 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Hi! I'm your support assistant. How can I help you today?"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors resize-none"
                />
              </div>

              {/* Instructions */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  System Instructions{' '}
                  <span className="text-zinc-600 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  maxLength={10000}
                  rows={10}
                  placeholder="You are a helpful customer support agent…"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors resize-none font-lexend leading-relaxed"
                />
                <p className="text-[11px] text-zinc-600">
                  {instructions.length.toLocaleString()} / 10,000 characters
                </p>
              </div>

              {/* Active Toggle */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Active</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Inactive agents will not respond to customer conversations.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    onClick={() => setIsActive((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                      isActive
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-zinc-700 border-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        isActive ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
                      Saving…
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckIcon className="h-4 w-4 text-emerald-600" />
                      Saved!
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <Link
                  href={`/dashboard/agents/${agent.id}/knowledge`}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Knowledge Base
                </Link>
              </div>
            </form>
          </div>

          {/* RIGHT — Test Chat */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Test your agent
            </p>
            <TestChatPanel agent={agent} />
            <p className="mt-2 text-[11px] text-zinc-600">
              Test messages use the agent&apos;s <em>current saved</em> configuration. Save your changes first to test updated instructions.
            </p>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        error={deleteError}
        title="Delete Agent"
        description={`Are you sure you want to delete "${agent.name}"? This will permanently remove the agent and all its knowledge sources. This action cannot be undone.`}
      />
    </>
  );
}
