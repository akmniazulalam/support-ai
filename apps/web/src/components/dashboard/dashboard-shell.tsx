'use client';

import { useState, type ReactNode } from 'react';
import { DashboardHeader } from './dashboard-header';
import { DashboardSidebar } from './dashboard-sidebar';
import { MobileSidebar } from './mobile-sidebar';

interface DashboardShellProps {
  children: ReactNode;
  title?: string;
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Desktop Sidebar (Fixed Left) */}
      <div className="hidden lg:flex lg:shrink-0">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          title={title}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 chat-scrollbar">
          <div className="mx-auto max-w-6xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
