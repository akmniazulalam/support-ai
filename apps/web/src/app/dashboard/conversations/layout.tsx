import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Conversations',
    template: '%s | SupportAI',
  },
};

export default function ConversationsLayout({ children }: { children: ReactNode }) {
  return children;
}
