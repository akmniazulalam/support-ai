import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Agents',
    template: '%s | SupportAI',
  },
};

export default function AgentsLayout({ children }: { children: ReactNode }) {
  return children;
}
