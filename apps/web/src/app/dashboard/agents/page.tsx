'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircleIcon,
  BotIcon,
  ExternalLinkIcon,
  PlusIcon,
  RefreshCwIcon,
  ZapIcon,
} from '@/components/ui/icons';
import { getAgents } from '@/lib/api/agents';
import type { Agent } from '@/types/agents';
import { AgentCard } from './agent-card';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadAgents() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAgents();
        if (isMounted) setAgents(data);
      } catch {
        if (isMounted) setError('Unable to load agents. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadAgents();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  return (
    <div className="space-y-6 animate-message-entrance pb-10">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            AI Agents
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your AI support agents and their configurations.
          </p>
        </div>
        <Link
          href="/dashboard/agents/new"
          className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          New Agent
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111218] p-16">
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <div className="h-6 w-6 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
            <p className="text-xs font-lexend text-zinc-500">Loading agents…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <RefreshCwIcon className="h-3 w-3" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-[#111218] p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 border border-white/[0.1] mb-4">
            <BotIcon className="h-7 w-7 text-zinc-400" />
          </div>
          <h2 className="text-base font-semibold text-zinc-200">No agents yet</h2>
          <p className="mt-1 text-sm text-zinc-500 max-w-xs">
            Create your first AI support agent to start handling customer conversations.
          </p>
          <Link
            href="/dashboard/agents/new"
            className="mt-5 flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
          >
            <PlusIcon className="h-4 w-4" />
            Create your first agent
          </Link>
        </div>
      )}

      {/* Agent Grid */}
      {!isLoading && !error && agents.length > 0 && (
        <>
          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.08] bg-[#111218] p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <BotIcon className="h-3.5 w-3.5" />
                Total Agents
              </div>
              <span className="text-2xl font-bold text-zinc-100">{agents.length}</span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#111218] p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <ZapIcon className="h-3.5 w-3.5 text-emerald-400" />
                Active
              </div>
              <span className="text-2xl font-bold text-emerald-400">
                {agents.filter((a) => a.isActive).length}
              </span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#111218] p-4 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                Inactive
              </div>
              <span className="text-2xl font-bold text-zinc-400">
                {agents.filter((a) => !a.isActive).length}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onDeleted={(id) => setAgents((prev) => prev.filter((a) => a.id !== id))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
