import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DashboardAuthGuard } from '@/components/dashboard/dashboard-auth-guard';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | SupportAI',
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardAuthGuard>{children}</DashboardAuthGuard>;
}
