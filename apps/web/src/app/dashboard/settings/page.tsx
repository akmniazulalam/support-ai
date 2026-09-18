'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { changePassword, AuthApiError } from '@/lib/api/auth';
import {
  AlertCircleIcon,
  BuildingIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@/components/ui/icons';
import type { FullWorkspace, SafeUser } from '@/types/auth';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface AccountSettingsCardProps {
  user: SafeUser;
  updateProfile: (dto: { firstName?: string; lastName?: string }) => Promise<void>;
  isAdmin: boolean;
}

function AccountSettingsCard({ user, updateProfile, isAdmin }: AccountSettingsCardProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDirty =
    firstName.trim() !== user.firstName || lastName.trim() !== user.lastName;
  const canSave =
    isDirty &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    !isSaving;

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : 'Failed to update profile. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300">
            <UserIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Account Settings</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your personal information and account profile.
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {isAdmin ? (
            <span className="flex items-center gap-1 text-[10px] font-lexend uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheckIcon className="h-3 w-3" />
              Admin
            </span>
          ) : (
            <span className="text-[10px] font-lexend uppercase px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
              Member
            </span>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
          <AlertCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-400">
          <CheckIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2"
            >
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setSuccess(null);
              }}
              maxLength={100}
              required
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2"
            >
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setSuccess(null);
              }}
              maxLength={100}
              required
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Email Address
            </label>
            <span className="text-[10px] text-zinc-500 font-lexend">Read-only</span>
          </div>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed select-none"
          />
          <p className="mt-1.5 text-[11px] text-zinc-500">
            Email address is tied to your account and cannot be modified directly.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={!canSave}
            className="flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


