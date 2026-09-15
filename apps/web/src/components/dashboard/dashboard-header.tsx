'use client';

import { useState, useRef, useEffect } from 'react';
import {
  BuildingIcon,
  ChevronDownIcon,
  LogOutIcon,
  MenuIcon,
  ShieldCheckIcon,
} from '@/components/ui/icons';

import { useAuth } from '@/hooks/use-auth';

interface DashboardHeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export function DashboardHeader({
  onOpenMobileMenu,
  title = 'Overview',
}: DashboardHeaderProps) {
  const { user, workspace, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : 'U';

  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#0c0d14]/80 backdrop-blur-md shrink-0 z-10">
      {/* Left: Mobile menu button & page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight truncate">
            {title}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
      </div>

      {/* Right: Workspace badge & user dropdown */}
      <div className="flex items-center gap-3">
        {/* Workspace Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-[#141520] border border-white/[0.07] px-3 py-1.5 text-xs text-zinc-300 shadow-xs">
          <BuildingIcon className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-200">{workspace?.name || 'Workspace'}</span>
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            aria-label="User account menu"
            className="flex items-center gap-2 rounded-xl bg-[#141520] border border-white/[0.08] p-1.5 pr-2.5 text-xs text-zinc-300 hover:border-white/[0.16] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 border border-white/[0.1] text-xs font-bold text-zinc-100">
              {userInitials}
            </div>
            <span className="hidden md:inline font-medium text-zinc-200 max-w-[120px] truncate">
              {user?.firstName || 'Account'}
            </span>
            <ChevronDownIcon className="h-3.5 w-3.5 text-zinc-500" />
          </button>

          {isUserMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141520] border border-white/[0.1] p-1.5 shadow-2xl shadow-black/80 backdrop-blur-md z-30 animate-message-entrance"
            >
              <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                <div className="text-xs font-semibold text-zinc-100 truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">
                  {user?.email}
                </div>
              </div>

              <div className="px-2 py-1.5 text-[11px] text-zinc-400 flex items-center gap-2">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span>Workspace Owner</span>
              </div>

              <div className="my-1 border-t border-white/6" />

              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setIsUserMenuOpen(false);
                  await logout();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
              >
                <LogOutIcon className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
