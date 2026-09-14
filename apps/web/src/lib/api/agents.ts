import { authenticatedRequest } from '@/lib/api/auth';
import type {
  Agent,
  CreateAgentDto,
  CreateKnowledgeSourceDto,
  KnowledgeSource,
  TestChatResponse,
  UpdateAgentDto,
  UpdateKnowledgeSourceDto,
} from '@/types/agents';

// ─── Agent CRUD ────────────────────────────────────────────────────────────

export function getAgents(): Promise<Agent[]> {
  return authenticatedRequest<Agent[]>('/agents', { method: 'GET' });
}

export function getAgent(id: string): Promise<Agent> {
  return authenticatedRequest<Agent>(`/agents/${id}`, { method: 'GET' });
}

export function createAgent(dto: CreateAgentDto): Promise<Agent> {
  return authenticatedRequest<Agent>('/agents', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateAgent(id: string, dto: UpdateAgentDto): Promise<Agent> {
  return authenticatedRequest<Agent>(`/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function deleteAgent(id: string): Promise<{ success: boolean }> {
  return authenticatedRequest<{ success: boolean }>(`/agents/${id}`, {
    method: 'DELETE',
  });
}

// ─── Knowledge CRUD ────────────────────────────────────────────────────────

export function getKnowledgeSources(agentId: string): Promise<KnowledgeSource[]> {
  return authenticatedRequest<KnowledgeSource[]>(
    `/agents/${agentId}/knowledge`,
    { method: 'GET' },
  );
}

export function createKnowledgeSource(
  agentId: string,
  dto: CreateKnowledgeSourceDto,
): Promise<KnowledgeSource> {
  return authenticatedRequest<KnowledgeSource>(
    `/agents/${agentId}/knowledge`,
    { method: 'POST', body: JSON.stringify(dto) },
  );
}

export function updateKnowledgeSource(
  agentId: string,
  knowledgeId: string,
  dto: UpdateKnowledgeSourceDto,
): Promise<KnowledgeSource> {
  return authenticatedRequest<KnowledgeSource>(
    `/agents/${agentId}/knowledge/${knowledgeId}`,
    { method: 'PATCH', body: JSON.stringify(dto) },
  );
}

export function deleteKnowledgeSource(
  agentId: string,
  knowledgeId: string,
): Promise<{ success: boolean }> {
  return authenticatedRequest<{ success: boolean }>(
    `/agents/${agentId}/knowledge/${knowledgeId}`,
    { method: 'DELETE' },
  );
}

// ─── Test Chat ─────────────────────────────────────────────────────────────

export function testChat(
  agentId: string,
  message: string,
): Promise<TestChatResponse> {
  return authenticatedRequest<TestChatResponse>(
    `/agents/${agentId}/test-chat`,
    { method: 'POST', body: JSON.stringify({ message }) },
  );
}
