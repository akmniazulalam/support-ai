import type { Metadata } from 'next';
import { ChatShell } from '@/components/chat/chat-shell';

export const metadata: Metadata = {
  title: 'Customer Chat',
};

interface ChatPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { publicId } = await params;

  return <ChatShell publicId={publicId} />;
}
