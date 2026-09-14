// Matches KnowledgeSourceType enum from Prisma
export type KnowledgeSourceType = 'TEXT' | 'FAQ' | 'WEBSITE';

// Matches publicAgentSelect in agents.service.ts
export interface Agent {
  id: string;
  publicId: string;
  name: string;
  slug: string;
  greeting: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Matches publicKnowledgeSourceSelect in knowledge.service.ts
export interface KnowledgeSource {
  id: string;
  agentId: string;
  type: KnowledgeSourceType;
  title: string;
  content: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// DTOs — mirror server-side validation rules
export interface CreateAgentDto {
  name: string;
  greeting?: string;
  instructions?: string;
  isActive?: boolean;
}

export interface UpdateAgentDto {
  name?: string;
  greeting?: string;
  instructions?: string;
  isActive?: boolean;
}

export interface CreateKnowledgeSourceDto {
  type: KnowledgeSourceType;
  title: string;
  content?: string;
  sourceUrl?: string;
}

export interface UpdateKnowledgeSourceDto {
  type?: KnowledgeSourceType;
  title?: string;
  content?: string;
  sourceUrl?: string;
}

export interface TestChatResponse {
  answer: string;
}
