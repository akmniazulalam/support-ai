'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  BotIcon,
  CheckIcon,
  FileTextIcon,
  GlobeIcon,
  HelpCircleIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  XIcon,
} from '@/components/ui/icons';
import { getAgent } from '@/lib/api/agents';
import {
  createKnowledgeSource,
  deleteKnowledgeSource,
  getKnowledgeSources,
  updateKnowledgeSource,
} from '@/lib/api/agents';
import { AuthApiError } from '@/lib/api/auth';
import type { Agent, KnowledgeSource, KnowledgeSourceType } from '@/types/agents';
import { DeleteConfirmDialog } from '../../delete-confirm-dialog';

// ─── Helpers ───────────────────────────────────────────────────────────────

const TYPE_META: Record<
  KnowledgeSourceType,
  { label: string; icon: typeof FileTextIcon; description: string; color: string }
> = {
  TEXT: {
    label: 'Text',
    icon: FileTextIcon,
    description: 'Plain text knowledge',
    color: 'text-blue-400',
  },
  FAQ: {
    label: 'FAQ',
    icon: HelpCircleIcon,
    description: 'Question & answer pair',
    color: 'text-violet-400',
  },
  WEBSITE: {
    label: 'Website URL',
    icon: GlobeIcon,
    description: 'A website URL',
    color: 'text-cyan-400',
  },
};

function KnowledgeTypeBadge({ type }: { type: KnowledgeSourceType }) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

// ─── Knowledge Source Form ─────────────────────────────────────────────────

interface KnowledgeFormProps {
  agentId: string;
  editing: KnowledgeSource | null;
  onSaved: (ks: KnowledgeSource) => void;
  onCancel: () => void;
}

function KnowledgeForm({ agentId, editing, onSaved, onCancel }: KnowledgeFormProps) {
  const [type, setType] = useState<KnowledgeSourceType>(editing?.type ?? 'TEXT');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [content, setContent] = useState(editing?.content ?? '');
  const [sourceUrl, setSourceUrl] = useState(editing?.sourceUrl ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if ((type === 'TEXT' || type === 'FAQ') && !content.trim()) {
      setError(type === 'FAQ' ? 'Answer content is required for FAQ sources.' : 'Content is required for text sources.');
      return;
    }
    if (type === 'WEBSITE') {
      const cleanUrl = sourceUrl.trim();
      if (!cleanUrl) {
        setError('Website URL is required.');
        return;
      }
      if (!/^https?:\/\/.+/i.test(cleanUrl)) {
        setError('Please enter a valid URL starting with http:// or https://.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dto = {
        type,
        title: title.trim(),
        content: type !== 'WEBSITE' ? content.trim() || undefined : undefined,
        sourceUrl: type === 'WEBSITE' ? sourceUrl.trim() || undefined : undefined,
      };

      let result: KnowledgeSource;
      if (editing) {
        result = await updateKnowledgeSource(agentId, editing.id, dto);
      } else {
        result = await createKnowledgeSource(agentId, dto);
      }
      onSaved(result);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(
          err.validationErrors ? err.validationErrors.join(', ') : err.message,
        );
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const needsContent = type === 'TEXT' || type === 'FAQ';
  const needsUrl = type === 'WEBSITE';

  return (
    <div className="rounded-2xl border border-white/[0.12] bg-[#141520] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">
          {editing ? 'Edit Knowledge Source' : 'Add Knowledge Source'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5">
          <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Type selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TYPE_META) as KnowledgeSourceType[]).map((t) => {
              const meta = TYPE_META[t];
              const Icon = meta.icon;
              const selected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors ${
                    selected
                      ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                      : 'border-white/[0.08] bg-[#0c0d14] text-zinc-500 hover:border-white/[0.15] hover:text-zinc-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${selected ? meta.color : ''}`} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === 'FAQ'
                ? 'e.g. What is your refund policy?'
                : type === 'WEBSITE'
                ? 'e.g. Documentation homepage'
                : 'e.g. Product feature overview'
            }
            maxLength={200}
            required
            className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Content (TEXT / FAQ) */}
        {needsContent && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              {type === 'FAQ' ? 'Answer' : 'Content'}{' '}
              <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'FAQ'
                  ? 'We offer a 30-day full refund on all purchases…'
                  : 'Enter the knowledge content here…'
              }
              maxLength={50000}
              rows={6}
              required
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none font-lexend leading-relaxed"
            />
            <p className="mt-1 text-[11px] text-zinc-600">
              {content.length.toLocaleString()} / 50,000 characters
            </p>
          </div>
        )}

        {/* Source URL (WEBSITE) */}
        {needsUrl && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Website URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://docs.example.com"
              maxLength={2048}
              required
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Add a website URL as a knowledge source. The URL will be stored and referenced by the agent.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                {editing ? 'Save Changes' : 'Add Source'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/[0.1] px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Knowledge Source Row ──────────────────────────────────────────────────

interface KsRowProps {
  ks: KnowledgeSource;
  onEdit: () => void;
  onDelete: () => void;
}

function KsRow({ ks, onEdit, onDelete }: KsRowProps) {
  const [expanded, setExpanded] = useState(false);
  const createdDate = new Date(ks.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111218] p-4 transition-colors hover:border-white/[0.12]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <KnowledgeTypeBadge type={ks.type} />
          </div>
          <p className="text-sm font-medium text-zinc-200 truncate">{ks.title}</p>
          <p className="text-[11px] text-zinc-600 font-lexend mt-0.5">Added {createdDate}</p>

          {/* Preview */}
          {(ks.content || ks.sourceUrl) && (
            <div className="mt-2">
              {ks.sourceUrl ? (
                <a
                  href={ks.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={ks.sourceUrl}
                  className="block max-w-full truncate text-xs text-cyan-400 hover:underline"
                >
                  {ks.sourceUrl}
                </a>
              ) : ks.content ? (
                <>
                  <p className={`text-xs text-zinc-400 font-lexend leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                    {ks.content}
                  </p>
                  {ks.content.length > 120 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 mt-1 transition-colors"
                    >
                      {expanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Edit"
            aria-label={`Edit knowledge source ${ks.title}`}
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Delete"
            aria-label={`Delete knowledge source ${ks.title}`}
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const params = useParams<{ id: string }>();
  const agentId = params.id;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);

  // Delete state
  const [deletingSource, setDeletingSource] = useState<KnowledgeSource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [agentData, sourcesData] = await Promise.all([
          getAgent(agentId),
          getKnowledgeSources(agentId),
        ]);
        if (isMounted) {
          setAgent(agentData);
          setSources(sourcesData);
        }
      } catch {
        if (isMounted) setLoadError('Unable to load knowledge base. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [agentId, reloadKey]);

  function handleSaved(ks: KnowledgeSource) {
    if (editingSource) {
      setSources((prev) => prev.map((s) => (s.id === ks.id ? ks : s)));
    } else {
      setSources((prev) => [...prev, ks]);
    }
    setShowForm(false);
    setEditingSource(null);
  }

  function handleEditClick(ks: KnowledgeSource) {
    setEditingSource(ks);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingSource(null);
  }

  async function handleDelete() {
    if (!deletingSource) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteKnowledgeSource(agentId, deletingSource.id);
      setSources((prev) => prev.filter((s) => s.id !== deletingSource.id));
      setDeletingSource(null);
    } catch {
      setDeleteError('Failed to delete this knowledge source. Please try again.');
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
          <p className="text-xs font-lexend text-zinc-500">Loading knowledge base…</p>
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
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const textCount = sources.filter((s) => s.type === 'TEXT').length;
  const faqCount = sources.filter((s) => s.type === 'FAQ').length;
  const websiteCount = sources.filter((s) => s.type === 'WEBSITE').length;

  return (
    <>
      <div className="animate-message-entrance pb-10 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/agents"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Agents
          </Link>
          <span className="text-zinc-700">/</span>
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="text-zinc-500 hover:text-zinc-300 transition-colors truncate max-w-[160px]"
          >
            {agent.name}
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300 font-medium">Knowledge Base</span>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-white/[0.1]">
              <BookOpenIcon className="h-5 w-5 text-zinc-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                Knowledge Base
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                for <span className="text-zinc-400 font-medium">{agent.name}</span>
              </p>
            </div>
          </div>

          {!showForm && (
            <button
              type="button"
              onClick={() => {
                setEditingSource(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors shrink-0"
            >
              <PlusIcon className="h-4 w-4" />
              Add Source
            </button>
          )}
        </div>

        {/* Stats */}
        {sources.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/[0.08] bg-[#111218] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Total</div>
              <span className="text-xl font-bold text-zinc-100">{sources.length}</span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#111218] p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-1">
                <FileTextIcon className="h-3 w-3" /> Text
              </div>
              <span className="text-xl font-bold text-zinc-100">{textCount}</span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#111218] p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400 mb-1">
                <HelpCircleIcon className="h-3 w-3" /> FAQ
              </div>
              <span className="text-xl font-bold text-zinc-100">{faqCount}</span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#111218] p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                <GlobeIcon className="h-3 w-3" /> URLs
              </div>
              <span className="text-xl font-bold text-zinc-100">{websiteCount}</span>
            </div>
          </div>
        )}

        {/* Inline Form */}
        {showForm && (
          <KnowledgeForm
            agentId={agentId}
            editing={editingSource}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        {/* Empty State */}
        {!showForm && sources.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-[#111218] p-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 border border-white/[0.1] mb-4">
              <BookOpenIcon className="h-7 w-7 text-zinc-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-200">No knowledge sources yet</h2>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm">
              Add text documents, FAQ entries, or website URLs to give your AI agent the knowledge it needs to answer customer questions.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingSource(null);
                setShowForm(true);
              }}
              className="mt-5 flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Add your first source
            </button>
          </div>
        )}

        {/* Source List */}
        {sources.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {sources.length} {sources.length === 1 ? 'source' : 'sources'}
            </div>
            {sources.map((ks) => (
              <KsRow
                key={ks.id}
                ks={ks}
                onEdit={() => handleEditClick(ks)}
                onDelete={() => {
                  setDeletingSource(ks);
                  setDeleteError(null);
                }}
              />
            ))}
          </div>
        )}

        {/* Agent nav footer */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <BotIcon className="h-4 w-4" />
            Back to Agent Settings
          </Link>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={deletingSource !== null}
        onClose={() => {
          setDeletingSource(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        error={deleteError}
        title="Delete Knowledge Source"
        description={`Are you sure you want to delete "${deletingSource?.title ?? 'this source'}"? This action cannot be undone.`}
      />
    </>
  );
}
