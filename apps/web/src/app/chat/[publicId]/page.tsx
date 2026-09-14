import { ChatShell } from '@/components/chat/chat-shell';

interface ChatPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { publicId } = await params;

  return <ChatShell publicId={publicId} />;
}
