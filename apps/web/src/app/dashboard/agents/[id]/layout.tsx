import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Agent Details',
    template: '%s | SupportAI',
  },
};

export default function AgentDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
