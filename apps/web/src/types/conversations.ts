export type MessageRole = 'USER' | 'ASSISTANT';

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[];
}

export interface CreateMessageDto {
  message: string;
}

export interface CreateMessageResponse {
  message: ConversationMessage;
}
