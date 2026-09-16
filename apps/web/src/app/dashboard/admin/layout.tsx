'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTabs } from '@/components/admin/admin-tabs';
import { ShieldCheckIcon } from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-zinc-400 animate-message-entrance">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-lexend text-zinc-500">
            Verifying admin authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="animate-message-entrance pb-12">
      {/* Top Banner / Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-xs">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Admin Console
              </h1>
              <span className="text-[9px] font-lexend uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Staff Only
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Platform-wide operations, monitoring, and tenant management
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <AdminTabs />

      {/* Page Content */}
      {children}
    </div>
  );
}
