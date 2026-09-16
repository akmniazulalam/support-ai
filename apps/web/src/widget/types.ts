export type MessageRole = 'USER' | 'ASSISTANT';

export interface PublicMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface AgentPublicInfo {
  publicId: string;
  name: string;
  greeting: string | null;
}

export interface ChatSession {
  conversationId: string;
  sessionToken: string;
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

export interface PublicConversation {
  id: string;
  messages: PublicMessage[];
}

export interface GetConversationResponse {
  conversation: PublicConversation;
}

export interface SendMessageResponse {
  message: PublicMessage;
}

export interface WidgetConfig {
  agentId: string;
  position: 'bottom-right' | 'bottom-left';
  apiUrl: string;
}

export type WidgetStatus =
  | 'initializing'
  | 'ready'
  | 'sending'
  | 'error'
  | 'rate_limited'
  | 'not_found';
