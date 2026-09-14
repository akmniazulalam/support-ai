import type {
  AgentPublicInfo,
  ApiErrorPayload,
  CreateConversationResponse,
  GetAgentResponse,
  GetConversationResponse,
  PublicConversation,
  PublicMessage,
  SendMessageResponse,
} from '@/types/chat';

export class PublicChatApiError extends Error {
  readonly status: number;
  readonly isNotFound: boolean;
  readonly isRateLimited: boolean;
  readonly isNetworkError: boolean;

  constructor(message: string, status = 500, isNetworkError = false) {
    super(message);
    this.name = 'PublicChatApiError';
    this.status = status;
    this.isNotFound = status === 404;
    this.isRateLimited = status === 429;
    this.isNetworkError = isNetworkError;
  }
}

const BASE_API_PATH = '/api/backend/public';

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorPayload;
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.message) && data.message.length > 0) {
      return data.message[0];
    }
    return response.statusText || 'An unexpected error occurred';
  } catch {
    return response.statusText || 'An unexpected error occurred';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_API_PATH}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Network connection failed. Please check your internet connection.';
    throw new PublicChatApiError(message, 0, true);
  }

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new PublicChatApiError(errorMessage, response.status, false);
  }

  return (await response.json()) as T;
}

export async function getPublicAgent(publicId: string): Promise<AgentPublicInfo> {
  const data = await request<GetAgentResponse>(`/agents/${encodeURIComponent(publicId)}`, {
    method: 'GET',
  });
  return data.agent;
}

export async function createPublicConversation(
  publicId: string,
): Promise<CreateConversationResponse> {
  return request<CreateConversationResponse>(
    `/agents/${encodeURIComponent(publicId)}/conversations`,
    {
      method: 'POST',
    },
  );
}

export async function getPublicConversation(
  conversationId: string,
  sessionToken: string,
): Promise<PublicConversation> {
  const data = await request<GetConversationResponse>(
    `/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    },
  );
  return data.conversation;
}

export async function sendPublicMessage(
  conversationId: string,
  sessionToken: string,
  message: string,
): Promise<PublicMessage> {
  const data = await request<SendMessageResponse>(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken,
        message,
      }),
    },
  );
  return data.message;
}
