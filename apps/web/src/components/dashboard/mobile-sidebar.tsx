'use client';

import { useEffect } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { XIcon } from '@/components/ui/icons';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-message-entrance"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#0c0d14] shadow-2xl z-10 animate-message-entrance">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute top-4 right-3 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <DashboardSidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
