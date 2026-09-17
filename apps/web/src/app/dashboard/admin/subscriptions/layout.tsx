import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Subscriptions',
};

export default function AdminSubscriptionsLayout({ children }: { children: ReactNode }) {
  return children;
}
