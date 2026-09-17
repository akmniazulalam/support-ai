import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Workspaces',
};

export default function AdminWorkspacesLayout({ children }: { children: ReactNode }) {
  return children;
}
