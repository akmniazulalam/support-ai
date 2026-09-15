'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BuildingIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@/components/ui/icons';

const TABS = [
  {
    label: 'Overview',
    href: '/dashboard/admin',
    icon: ShieldCheckIcon,
    exact: true,
  },
  {
    label: 'Users',
    href: '/dashboard/admin/users',
    icon: UserIcon,
    exact: false,
  },
  {
    label: 'Workspaces',
    href: '/dashboard/admin/workspaces',
    icon: BuildingIcon,
    exact: false,
  },
  {
    label: 'Subscriptions',
    href: '/dashboard/admin/subscriptions',
    icon: CreditCardIcon,
    exact: false,
  },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-white/[0.08] mb-6">
      <nav className="flex space-x-1 overflow-x-auto chat-scrollbar -mb-px" aria-label="Admin Navigation Tabs">
        {TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
