'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAgents } from '@/lib/api/agents';

export default function KnowledgeBaseRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function routeToKnowledge() {
      try {
        const agents = await getAgents();
        if (!isMounted) return;
        if (agents.length > 0) {
          router.replace(`/dashboard/agents/${agents[0].id}/knowledge`);
        } else {
          router.replace('/dashboard/agents');
        }
      } catch {
        if (isMounted) {
          setError('Unable to load agents. Please try again.');
        }
      }
    }

    void routeToKnowledge();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-64 w-full items-center justify-center text-zinc-400 animate-message-entrance">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs font-lexend text-zinc-500">
          Loading knowledge base…
        </p>
      </div>
    </div>
  );
}
