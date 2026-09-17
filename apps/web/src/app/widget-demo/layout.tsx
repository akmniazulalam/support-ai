import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Widget Demo',
};

export default function WidgetDemoLayout({ children }: { children: ReactNode }) {
  return children;
}
