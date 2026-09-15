import { authenticatedRequest } from '@/lib/api/auth';
import type {
  ConversationDetail,
  ConversationSummary,
  CreateMessageResponse,
} from '@/types/conversations';

/**
 * Fetch all conversations for a specific agent.
 * Backend route: GET /agents/:agentId/conversations
 */
export function getAgentConversations(
  agentId: string,
): Promise<ConversationSummary[]> {
  return authenticatedRequest<ConversationSummary[]>(
    `/agents/${agentId}/conversations`,
    { method: 'GET' },
  );
}

/**
 * Fetch a single conversation with its full message history.
 * Backend route: GET /conversations/:conversationId
 */
export function getConversation(
  conversationId: string,
): Promise<ConversationDetail> {
  return authenticatedRequest<ConversationDetail>(
    `/conversations/${conversationId}`,
    { method: 'GET' },
  );
}

/**
 * Append a customer/user message and trigger the assistant's AI response.
 * Backend route: POST /conversations/:conversationId/messages
 * Returns the generated assistant message.
 */
export function sendMessage(
  conversationId: string,
  message: string,
): Promise<CreateMessageResponse> {
  return authenticatedRequest<CreateMessageResponse>(
    `/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    },
  );
}

/**
 * Create a new conversation for an agent.
 * Backend route: POST /agents/:agentId/conversations
 */
export function createConversation(
  agentId: string,
): Promise<ConversationSummary> {
  return authenticatedRequest<ConversationSummary>(
    `/agents/${agentId}/conversations`,
    { method: 'POST' },
  );
}
