'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpenIcon,
  BotIcon,
  BuildingIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessagesSquareIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@/components/ui/icons';

import { useAuth } from '@/hooks/use-auth';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboardIcon;
  badge?: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    label: 'AI Agents',
    href: '/dashboard/agents',
    icon: BotIcon,
  },
  {
    label: 'Conversations',
    href: '/dashboard/conversations',
    icon: MessagesSquareIcon,
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCardIcon,
  },
  {
    label: 'Knowledge Base',
    href: '/dashboard/knowledge',
    icon: BookOpenIcon,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: SettingsIcon,
    badge: 'Soon',
    disabled: true,
  },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Admin Overview',
    href: '/dashboard/admin',
    icon: ShieldCheckIcon,
  },
  {
    label: 'Users',
    href: '/dashboard/admin/users',
    icon: UserIcon,
  },
  {
    label: 'Workspaces',
    href: '/dashboard/admin/workspaces',
    icon: BuildingIcon,
  },
  {
    label: 'Subscriptions',
    href: '/dashboard/admin/subscriptions',
    icon: CreditCardIcon,
  },
];

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, workspace, logout, isAdmin } = useAuth();

  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : 'U';

  return (
    <aside className="flex h-full w-64 flex-col bg-[#0c0d14] border-r border-white/[0.08] select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-white/[0.08] shrink-0">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg p-1"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.1] text-zinc-200 shadow-sm group-hover:border-white/[0.2] transition-colors">
            <BotIcon className="h-4 w-4 text-zinc-300" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#0c0d14]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-white">
              Support<span className="text-zinc-400">AI</span>
            </span>
            <span className="text-[9px] font-lexend uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
              v1.0
            </span>
          </div>
        </Link>
      </div>

      {/* Active Workspace Pill */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between rounded-xl bg-[#141520] border border-white/[0.07] px-3 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <BuildingIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-zinc-200 truncate">
                {workspace?.name || 'My Workspace'}
              </div>
              <div className="text-[10px] text-zinc-500 font-lexend truncate">
                {workspace?.slug || 'workspace'}
              </div>
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Active workspace" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 chat-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === item.href
              : item.href === '/dashboard/knowledge'
                ? pathname === '/dashboard/knowledge' || pathname.includes('/knowledge')
                : item.href === '/dashboard/agents'
                  ? (pathname === '/dashboard/agents' || pathname.startsWith('/dashboard/agents/')) && !pathname.includes('/knowledge')
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-zinc-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-lexend uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500 border border-white/[0.04]">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-xs'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Administration Section - Only visible to ADMIN users */}
        {isAdmin && (
          <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                Administration
              </span>
              <span className="text-[9px] font-lexend uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Admin
              </span>
            </div>
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/dashboard/admin'
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-xs'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Card & Logout Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-[#090a0f]/80">
        <div className="flex items-center justify-between rounded-xl bg-[#141520] border border-white/[0.06] p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-white/[0.1] text-xs font-bold text-zinc-200">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </span>
                {isAdmin && (
                  <span className="text-[9px] font-lexend uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 font-lexend truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
