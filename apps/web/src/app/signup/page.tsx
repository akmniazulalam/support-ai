'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { PasswordInput } from '@/components/auth/password-input';
import {
  AlertCircleIcon,
  BuildingIcon,
  CheckIcon,
  MailIcon,
  UserIcon,
} from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';
import { AuthApiError } from '@/lib/api/auth';

export default function SignUpPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
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

  // Password requirement checks matching backend regex: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/ and length 12-128
  const hasMinLength = password.length >= 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid =
    hasMinLength && hasLowercase && hasUppercase && hasNumber;

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    workspaceName.trim().length > 0 &&
    email.trim().length > 0 &&
    isPasswordValid;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        workspaceName: workspaceName.trim(),
        email: email.trim(),
        password,
      });
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please verify your details.');
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[#09090b]">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
          <span>Loading SupportAI...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      title="Create your workspace"
      subtitle="Start delivering intelligent AI support in minutes"
      footer={
        <span>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-zinc-200 hover:text-white underline underline-offset-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-200 animate-message-entrance"
          >
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="signup-firstname"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              First name
            </label>
            <div className="relative flex items-center">
              <div
                className="pointer-events-none absolute left-3 flex items-center text-zinc-500"
                aria-hidden="true"
              >
                <UserIcon className="h-4 w-4" />
              </div>
              <input
                id="signup-firstname"
                type="text"
                required
                maxLength={100}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSubmitting}
                placeholder="Alex"
                className="w-full rounded-xl bg-[#141520] border border-white/[0.09] py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-150 focus:border-zinc-400/50 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 disabled:opacity-40"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-lastname"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Last name
            </label>
            <input
              id="signup-lastname"
              type="text"
              required
              maxLength={100}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Smith"
              className="w-full rounded-xl bg-[#141520] border border-white/[0.09] py-2 px-3 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-150 focus:border-zinc-400/50 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 disabled:opacity-40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-workspace"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Workspace name
          </label>
          <div className="relative flex items-center">
            <div
              className="pointer-events-none absolute left-3 flex items-center text-zinc-500"
              aria-hidden="true"
            >
              <BuildingIcon className="h-4 w-4" />
            </div>
            <input
              id="signup-workspace"
              type="text"
              required
              maxLength={100}
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Acme Inc"
              className="w-full rounded-xl bg-[#141520] border border-white/[0.09] py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-150 focus:border-zinc-400/50 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 disabled:opacity-40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Work email
          </label>
          <div className="relative flex items-center">
            <div
              className="pointer-events-none absolute left-3 flex items-center text-zinc-500"
              aria-hidden="true"
            >
              <MailIcon className="h-4 w-4" />
            </div>
            <input
              id="signup-email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              placeholder="alex@acme.com"
              className="w-full rounded-xl bg-[#141520] border border-white/[0.09] py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-150 focus:border-zinc-400/50 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 disabled:opacity-40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-medium text-zinc-300 mb-1.5"
          >
            Password
          </label>
          <PasswordInput
            id="signup-password"
            required
            minLength={12}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            placeholder="Min 12 characters"
          />

          {/* Real-time password requirement checklist */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-[#141520]/80 border border-white/[0.06] text-[11px] space-y-1">
            <div
              className={`flex items-center gap-1.5 transition-colors ${
                hasMinLength ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <CheckIcon className="h-3.5 w-3.5" />
              <span>At least 12 characters</span>
            </div>
            <div
              className={`flex items-center gap-1.5 transition-colors ${
                hasUppercase && hasLowercase ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <CheckIcon className="h-3.5 w-3.5" />
              <span>Uppercase & lowercase letters</span>
            </div>
            <div
              className={`flex items-center gap-1.5 transition-colors ${
                hasNumber ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <CheckIcon className="h-3.5 w-3.5" />
              <span>At least one number</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zinc-100 via-white to-zinc-200 py-2.5 px-4 text-sm font-semibold text-zinc-950 shadow-md transition-all duration-150 hover:brightness-105 active:scale-[0.99] disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
              <span>Creating workspace...</span>
            </>
          ) : (
            <span>Create Workspace</span>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
