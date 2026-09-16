'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BotIcon,
} from '@/components/ui/icons';
import { createAgent } from '@/lib/api/agents';
import { AuthApiError } from '@/lib/api/auth';

export default function NewAgentPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const agent = await createAgent({
        name: name.trim(),
        greeting: greeting.trim() || undefined,
        instructions: instructions.trim() || undefined,
        isActive,
      });
      router.push(`/dashboard/agents/${agent.id}`);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(
          err.validationErrors
            ? err.validationErrors.join(', ')
            : err.message,
        );
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="animate-message-entrance pb-10">
      {/* Back */}
      <Link
        href="/dashboard/agents"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Agents
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-white/[0.1]">
            <BotIcon className="h-5 w-5 text-zinc-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Create New Agent
          </h1>
        </div>
        <p className="text-sm text-zinc-400 ml-13">
          Configure your AI support agent&apos;s name, greeting and system instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5 max-w-2xl">
          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
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
              placeholder="e.g. Customer Support Bot"
              maxLength={100}
              required
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors"
            />
            <p className="text-[11px] text-zinc-600">
              Max 100 characters. A URL-friendly slug will be generated automatically.
            </p>
          </div>

          {/* Greeting */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Greeting Message <span className="text-zinc-600 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Hi! I'm your support assistant. How can I help you today?"
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors resize-none"
            />
            <p className="text-[11px] text-zinc-600">
              The first message your agent sends when a customer starts a conversation. Max 500 characters.
            </p>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              System Instructions <span className="text-zinc-600 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="You are a helpful customer support agent for Acme Corp. Be concise, professional, and always escalate billing issues to the human team..."
              maxLength={10000}
              rows={8}
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors resize-none font-lexend leading-relaxed"
            />
            <p className="text-[11px] text-zinc-600">
              Guides the AI&apos;s tone, behavior, and limitations. Max 10,000 characters.
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

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Agent'
              )}
            </button>
            <Link
              href="/dashboard/agents"
              className="rounded-xl border border-white/[0.1] px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
