"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  BotIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  ZapIcon,
} from "@/components/ui/icons";
import { deleteAgent } from "@/lib/api/agents";
import type { Agent } from "@/types/agents";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

interface AgentCardProps {
  agent: Agent;
  onDeleted: (id: string) => void;
}

export function AgentCard({ agent, onDeleted }: AgentCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAgent(agent.id);
      setIsDeleteOpen(false);
      onDeleted(agent.id);
    } catch {
      setDeleteError("Failed to delete agent. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const createdDate = new Date(agent.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-[#111218] p-5 transition-colors hover:border-white/[0.14] hover:bg-[#141520]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 border border-white/[0.1]">
              <BotIcon className="h-5 w-5 text-zinc-300" />
            </div>
            <div className="min-w-0">
              <Link href={`/dashboard/agents/${agent.id}`}>
                <h3 className="text-sm font-semibold text-zinc-100 truncate">
                  {agent.name}
                </h3>
              </Link>
              <p className="text-[11px] font-lexend text-zinc-500 truncate">
                /{agent.slug}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              agent.isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-zinc-800 text-zinc-500 border border-white/[0.06]"
            }`}>
            {agent.isActive ? (
              <ZapIcon className="h-3 w-3" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            )}
            {agent.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Greeting preview */}
        {agent.greeting ? (
          <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
            &ldquo;{agent.greeting}&rdquo;
          </p>
        ) : (
          <p className="text-xs text-zinc-600 italic mb-4">
            No greeting configured
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-zinc-600 font-lexend">
            Created {createdDate}
          </span>

          <div className="flex items-center gap-1">
            {/* Knowledge link */}
            <Link
              href={`/dashboard/agents/${agent.id}/knowledge`}
              title="Manage knowledge base"
              aria-label={`Manage knowledge base for ${agent.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors">
              <BookOpenIcon className="h-3.5 w-3.5" />
            </Link>

            {/* Delete */}
            <button
              type="button"
              title="Delete agent"
              aria-label={`Delete agent ${agent.name}`}
              onClick={() => setIsDeleteOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <TrashIcon className="h-3.5 w-3.5" />
            </button>

            {/* Edit / open */}
            <Link
              href={`/dashboard/agents/${agent.id}`}
              title="Edit agent"
              className="flex items-center gap-1 rounded-lg px-2.5 h-7 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors">
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
              <ChevronRightIcon className="h-3 w-3" />
            </Link>
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
