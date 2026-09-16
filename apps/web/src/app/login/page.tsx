'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { PasswordInput } from '@/components/auth/password-input';
import { AlertCircleIcon, MailIcon } from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';
import { AuthApiError } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to /dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        email: trimmedEmail,
        password,
      });
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else {
        setError('Unable to log in. Please verify your credentials and connection.');
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[#09090b]">
        <div className="flex items-center gap-2 text-xs font-lexend text-zinc-400">
          <span className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
          <span>Loading SupportAI...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your SupportAI workspace"
      footer={
        <span>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-zinc-200 hover:text-white underline underline-offset-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
          >
            Create one now
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-200 animate-message-entrance"
          >
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Email address
          </label>
          <div className="relative flex items-center">
            <div
              className="pointer-events-none absolute left-3 flex items-center text-zinc-500"
              aria-hidden="true"
            >
              <MailIcon className="h-4 w-4" />
            </div>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              placeholder="you@company.com"
              className="w-full rounded-xl bg-[#141520] border border-white/[0.09] py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-150 focus:border-zinc-400/50 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Password
          </label>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            placeholder="••••••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email.trim() || !password}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zinc-100 via-white to-zinc-200 py-2.5 px-4 text-sm font-semibold text-zinc-950 shadow-md transition-all duration-150 hover:brightness-105 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in to Dashboard</span>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
