export type MessageRole = 'USER' | 'ASSISTANT';

export interface PublicMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface AgentPublicInfo {
  name: string;
  greeting: string | null;
  publicId: string;
}

export interface PublicConversation {
  id: string;
  messages: PublicMessage[];
}

export interface CreateConversationResponse {
  conversation: {
    id: string;
    createdAt: string;
  };
  sessionToken: string;
}

export interface GetAgentResponse {
  agent: AgentPublicInfo;
}

export interface GetConversationResponse {
  conversation: PublicConversation;
}

export interface SendMessageResponse {
  message: PublicMessage;
}

export interface ChatSession {
  conversationId: string;
  sessionToken: string;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export type ChatStatus =
  | 'initializing'
  | 'ready'
  | 'sending'
  | 'error'
  | 'rate_limited'
  | 'not_found';
