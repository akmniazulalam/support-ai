import type { ReactNode } from 'react';
import Link from 'next/link';
import { BotIcon, SparklesIcon } from '@/components/ui/icons';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center p-4 sm:p-6 bg-[#09090b]">
      {/* Background subtle radial spotlight */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-zinc-800/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md animate-message-entrance z-10">
        {/* SupportAI Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg p-1"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.1] text-zinc-200 shadow-md group-hover:border-white/[0.18] transition-colors">
              <BotIcon className="h-5 w-5 text-zinc-300" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#09090b]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">
                Support<span className="text-zinc-400">AI</span>
              </span>
              <span className="text-[10px] font-lexend uppercase px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-400">
                SaaS
              </span>
            </div>
          </Link>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* Card Shell */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-[#0f1017]/90 p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-md">
          {/* Subtle top edge gradient sheen */}
          <div
            className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {children}

          {footer && (
            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-zinc-400">
              {footer}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-zinc-500">
          <SparklesIcon className="h-3.5 w-3.5 text-zinc-500" />
          <span>Intelligent Customer Support Platform</span>
        </div>
      </div>
    </div>
  );
}
