import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'New Agent',
};

export default function NewAgentLayout({ children }: { children: ReactNode }) {
  return children;
}
