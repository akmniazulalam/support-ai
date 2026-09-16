import type {
  AgentPublicInfo,
  CreateConversationResponse,
  GetAgentResponse,
  GetConversationResponse,
  PublicMessage,
  SendMessageResponse,
} from './types';

export class WidgetApiError extends Error {
  readonly status: number;
  readonly isNotFound: boolean;
  readonly isRateLimited: boolean;
  readonly isNetworkError: boolean;

  constructor(message: string, status = 500, isNetworkError = false) {
    super(message);
    this.name = 'WidgetApiError';
    this.status = status;
    this.isNotFound = status === 404;
    this.isRateLimited = status === 429;
    this.isNetworkError = isNetworkError;
  }
}

function buildUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string | string[]; error?: string };
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.message) && data.message.length > 0) {
      return data.message[0];
    }
    return response.statusText || 'An unexpected error occurred.';
  } catch {
    return response.statusText || 'An unexpected error occurred.';
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Network connection failed. Please verify your internet connection.';
    throw new WidgetApiError(message, 0, true);
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new WidgetApiError(message, response.status, false);
  }

  return (await response.json()) as T;
}

export async function fetchPublicAgent(
  apiUrl: string,
  publicId: string,
): Promise<AgentPublicInfo> {
  const url = buildUrl(apiUrl, `/public/agents/${encodeURIComponent(publicId)}`);
  const data = await request<GetAgentResponse>(url, {
    method: 'GET',
  });
  return data.agent;
}

export async function createPublicConversation(
  apiUrl: string,
  publicId: string,
): Promise<CreateConversationResponse> {
  const url = buildUrl(apiUrl, `/public/agents/${encodeURIComponent(publicId)}/conversations`);
  return request<CreateConversationResponse>(url, {
    method: 'POST',
  });
}

export async function fetchPublicConversation(
  apiUrl: string,
  conversationId: string,
  sessionToken: string,
): Promise<{ id: string; messages: PublicMessage[] }> {
  const url = buildUrl(apiUrl, `/public/conversations/${encodeURIComponent(conversationId)}`);
  const data = await request<GetConversationResponse>(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  return data.conversation;
}

export async function sendPublicMessage(
  apiUrl: string,
  conversationId: string,
  sessionToken: string,
  message: string,
): Promise<PublicMessage> {
  const url = buildUrl(
    apiUrl,
    `/public/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
  const data = await request<SendMessageResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionToken,
      message,
    }),
  });
  return data.message;
}
