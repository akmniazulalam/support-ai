'use client';

import { useParams } from 'next/navigation';
import { ConversationInbox } from '@/components/conversations/conversation-inbox';

export default function ConversationDetailPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params?.conversationId ?? null;

  return <ConversationInbox initialConversationId={conversationId} />;
}
