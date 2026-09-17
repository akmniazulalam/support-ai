'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircleIcon,
  BotIcon,
  BuildingIcon,
  CheckIcon,
  ExternalLinkIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@/components/ui/icons';

import { useAuth } from '@/hooks/use-auth';
import { getAgents } from '@/lib/api/auth';
import type { PublicAgentInfo } from '@/types/auth';

export default function DashboardOverviewPage() {
  const { user, workspace } = useAuth();
  const [agents, setAgents] = useState<PublicAgentInfo[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadAgents() {
      setIsLoadingAgents(true);
      setAgentsError(null);
      try {
        const data = await getAgents();
        if (isMounted) {
          setAgents(data);
        }
      } catch {
        if (isMounted) {
          setAgentsError('Unable to load agents at this time.');
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
  }, [reloadKey]);

  const activeAgentsCount = agents.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6 animate-message-entrance pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#11131c] via-[#0e1017] to-[#12141e] p-6 sm:p-8 shadow-xl shadow-black/50">
        <div
          className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-lexend uppercase tracking-wider text-emerald-400">
                Workspace Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.firstName || 'there'}!
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Here is an overview of your SupportAI workspace{' '}
              <span className="font-semibold text-zinc-200">
                &ldquo;{workspace?.name}&rdquo;
              </span>
              . Manage your customer support agents, knowledge base, and live customer conversations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-lexend px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300">
              <BuildingIcon className="h-3.5 w-3.5 text-zinc-400" />
              <span>Workspace: {workspace?.slug || 'default'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Real Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0f1017] p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">
              Workspace Status
            </span>
            <BuildingIcon className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">Online</span>
            <span className="text-xs text-emerald-400 font-lexend">Ready</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Active in region: US East (Production)
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0f1017] p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">
              Configured Agents
            </span>
            <BotIcon className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            {isLoadingAgents ? (
              <span className="h-7 w-12 rounded bg-white/[0.06] animate-pulse" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {agents.length}
              </span>
            )}
            <span className="text-xs text-zinc-400">
              ({activeAgentsCount} active)
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time AI customer support agents
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0f1017] p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">
              Account Role
            </span>
            <ShieldCheckIcon className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">Owner</span>
            <span className="text-xs text-zinc-400 font-lexend">Full Access</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 truncate">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Agents List & Public Chat Links */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f1017] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BotIcon className="h-5 w-5 text-zinc-300" />
            <h2 className="text-base font-semibold text-zinc-100">
              AI Support Agents
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-lexend">
            {agents.length} total
          </span>
        </div>

        {isLoadingAgents ? (
          <div className="flex items-center justify-center p-8 text-xs font-lexend text-zinc-500 gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
            <span>Loading agents...</span>
          </div>
        ) : agentsError ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="h-4 w-4 shrink-0" />
              <span>{agentsError}</span>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
            >
              <RefreshCwIcon className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : agents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.1] p-8 text-center bg-white/[0.01]">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 border border-white/[0.08] text-zinc-400 mb-3">
              <BotIcon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">
              No AI agents created yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
              Get started by creating your first AI support agent to assist your customers.
            </p>
            <Link
              href="/dashboard/agents/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>Create Agent</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#141520] border border-white/[0.08] text-zinc-300 mt-0.5">
                    <BotIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-100 truncate">
                        {agent.name}
                      </span>
                      <span
                        className={`text-[10px] font-lexend px-2 py-0.5 rounded-full border ${
                          agent.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {agent.greeting || 'No custom greeting configured'}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-lexend">
                      Public ID: {agent.publicId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/chat/${agent.publicId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    <span>Open Public Chat</span>
                    <ExternalLinkIcon className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Getting Started & Onboarding Guidance */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f1017] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-zinc-300" />
          <h2 className="text-base font-semibold text-zinc-100">
            Getting Started with SupportAI
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-[#141520] border border-white/[0.07] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-lexend font-semibold text-emerald-400">
                  Step 1
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckIcon className="h-3 w-3" />
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Workspace Created
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Your workspace &ldquo;{workspace?.name}&rdquo; is ready and configured.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05] text-[11px] text-emerald-400 font-medium">
              Completed
            </div>
          </div>

          <div className="rounded-xl bg-[#141520] border border-white/[0.07] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-lexend font-semibold text-emerald-400">
                  Step 2
                </span>
                <span className="text-[10px] font-lexend uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Agent & Knowledge Base
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Configure AI system instructions, connect documentation, FAQs, and website links.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05]">
              <Link
                href="/dashboard/agents"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Manage Agents →
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-[#141520] border border-white/[0.07] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-lexend font-semibold text-emerald-400">
                  Step 3
                </span>
                <span className="text-[10px] font-lexend uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Public Customer Chat
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Deliver real-time customer support at <code className="font-lexend text-zinc-300">/chat/[publicId]</code>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05] text-[11px] text-emerald-400 font-medium">
              Live & Accessible
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Details Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f1017] p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
          Workspace Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#141520] border border-white/[0.05]">
            <span className="text-zinc-500 block mb-1">Workspace ID</span>
            <span className="font-lexend text-zinc-200 truncate block">
              {workspace?.id}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#141520] border border-white/[0.05]">
            <span className="text-zinc-500 block mb-1">URL Slug</span>
            <span className="font-lexend text-zinc-200 truncate block">
              {workspace?.slug}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#141520] border border-white/[0.05]">
            <span className="text-zinc-500 block mb-1">Created At</span>
            <span className="text-zinc-200 block">
              {workspace?.createdAt
                ? new Date(workspace.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#141520] border border-white/[0.05]">
            <span className="text-zinc-500 block mb-1">Owner Email</span>
            <span className="text-zinc-200 truncate block font-lexend">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
