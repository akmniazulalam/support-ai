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

// ─── Security Settings Card ──────────────────────────────────────────────────

function SecuritySettingsCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Requirements checks matching backend DTO
  const hasMinLength = newPassword.length >= 12;
  const hasMaxLength = newPassword.length <= 128;
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isNewPasswordValid =
    hasMinLength && hasMaxLength && hasLowercase && hasUppercase && hasNumber;
  const canSubmit =
    currentPassword.length > 0 &&
    isNewPasswordValid &&
    passwordsMatch &&
    !isSaving;

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      // Clear password fields immediately upon successful change
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully.');
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : 'Failed to update password. Please check your current password.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300">
          <LockIcon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Security & Password</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Update your account password to ensure your account remains secure.
          </p>
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
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2"
          >
            Current Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setSuccess(null);
              }}
              autoComplete="current-password"
              placeholder="Enter your current password"
              required
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 pr-10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              tabIndex={-1}
              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
            >
              {showCurrent ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2"
            >
              New Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setSuccess(null);
                }}
                autoComplete="new-password"
                placeholder="Minimum 12 characters"
                required
                className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 pr-10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                tabIndex={-1}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
              >
                {showNew ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2"
            >
              Confirm New Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setSuccess(null);
                }}
                autoComplete="new-password"
                placeholder="Repeat new password"
                required
                className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 pr-10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
              >
                {showConfirm ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2 text-xs">
          <p className="text-zinc-400 font-medium">Password Requirements:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-500">
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-400' : ''}`}>
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {hasMinLength ? <CheckIcon className="h-3.5 w-3.5" /> : '•'}
              </span>
              <span>Minimum 12 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasLowercase ? 'text-emerald-400' : ''}`}>
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {hasLowercase ? <CheckIcon className="h-3.5 w-3.5" /> : '•'}
              </span>
              <span>At least one lowercase letter</span>
            </div>
            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-400' : ''}`}>
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {hasUppercase ? <CheckIcon className="h-3.5 w-3.5" /> : '•'}
              </span>
              <span>At least one uppercase letter</span>
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-400' : ''}`}>
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {hasNumber ? <CheckIcon className="h-3.5 w-3.5" /> : '•'}
              </span>
              <span>At least one number (0-9)</span>
            </div>
            {confirmPassword.length > 0 && (
              <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  {passwordsMatch ? <CheckIcon className="h-3.5 w-3.5" /> : '•'}
                </span>
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
                <span>Updating…</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Workspace Settings Card ─────────────────────────────────────────────────

interface WorkspaceSettingsCardProps {
  workspace: FullWorkspace | null;
  updateWorkspace: (name: string) => Promise<void>;
}

function WorkspaceSettingsCard({
  workspace,
  updateWorkspace,
}: WorkspaceSettingsCardProps) {
  const [workspaceName, setWorkspaceName] = useState(workspace?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDirty = workspace && workspaceName.trim() !== workspace.name;
  const canSave = isDirty && workspaceName.trim().length > 0 && !isSaving;

  async function handleWorkspaceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateWorkspace(workspaceName.trim());
      setSuccess('Workspace updated successfully.');
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : 'Failed to update workspace. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111218] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300">
          <BuildingIcon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Workspace Preferences</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure your workspace organization identity and identifier.
          </p>
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
      <form onSubmit={handleWorkspaceSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="workspaceName"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2"
          >
            Workspace Name <span className="text-red-400">*</span>
          </label>
          <input
            id="workspaceName"
            type="text"
            value={workspaceName}
            onChange={(e) => {
              setWorkspaceName(e.target.value);
              setSuccess(null);
            }}
            placeholder="e.g. Acme Support"
            maxLength={100}
            required
            className="w-full rounded-xl border border-white/[0.1] bg-[#0c0d14] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="workspaceSlug"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Workspace Slug
            </label>
            <span className="text-[10px] text-zinc-500 font-lexend">Read-only</span>
          </div>
          <input
            id="workspaceSlug"
            type="text"
            value={workspace?.slug ?? ''}
            disabled
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed select-none font-lexend"
          />
          <p className="mt-1.5 text-[11px] text-zinc-500">
            The workspace slug is auto-generated and serves as your organization&apos;s unique URL identifier.
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
              <span>Save Workspace</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, workspace, isLoading, updateProfile, updateWorkspace, isAdmin } =
    useAuth();

  if (isLoading || !user) {
    return (
      <div className="animate-message-entrance pb-10 space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-7 w-32 rounded-lg bg-zinc-800 animate-pulse mb-2" />
          <div className="h-4 w-72 rounded bg-zinc-800/60 animate-pulse" />
        </div>

        {/* Cards Skeletons */}
        <div className="space-y-6 max-w-3xl">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-white/[0.06] bg-[#111218]/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-message-entrance pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white font-lexend">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your account and workspace preferences.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 max-w-3xl">
        <AccountSettingsCard
          user={user}
          updateProfile={updateProfile}
          isAdmin={isAdmin}
        />

        <SecuritySettingsCard />

        <WorkspaceSettingsCard
          workspace={workspace}
          updateWorkspace={updateWorkspace}
        />
      </div>
    </div>
  );
}
