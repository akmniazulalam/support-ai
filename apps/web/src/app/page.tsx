import Link from "next/link";
import { BotIcon, ChevronRightIcon, SparklesIcon } from "@/components/ui/icons";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6 bg-[#09090b] text-zinc-100 relative overflow-hidden">
      {/* Background subtle radial spotlight */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-zinc-800/10 blur-[140px] rounded-full" />
      </div>

      <main className="relative z-10 flex flex-col items-center text-center max-w-xl animate-message-entrance">
        {/* SupportAI Brand Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs text-zinc-300 mb-8 backdrop-blur-xs">
          <SparklesIcon className="h-3.5 w-3.5 text-emerald-400" />
          <span>SupportAI Platform Milestone 2 Active</span>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.1] text-zinc-200 shadow-xl mb-6">
          <BotIcon className="h-7 w-7 text-zinc-300" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          Intelligent Customer Support for Modern SaaS
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-md mb-8 leading-relaxed">
          Deliver instant, accurate answers to your customers using dedicated AI agents trained on your business knowledge.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <Link
            href="/dashboard"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zinc-100 via-white to-zinc-200 px-5 text-sm font-semibold text-zinc-950 shadow-md transition-all duration-150 hover:brightness-105 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <span>Go to Dashboard</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-12 text-xs text-zinc-500 font-lexend">
          SupportAI &bull; Commercial Customer Support Infrastructure
        </div>
      </main>
    </div>
  );
}

