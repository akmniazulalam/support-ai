import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from '@/lib/auth/auth-storage';
import type {
  AuthResponse,
  AuthTokens,
  CurrentUserResponse,
  FullWorkspace,
  LoginDto,
  PublicAgentInfo,
  SafeUser,
  SignUpDto,
  UpdateProfileDto,
  UpdateWorkspaceDto,
} from '@/types/auth';

export class AuthApiError extends Error {
  readonly status: number;
  readonly isUnauthorized: boolean;
  readonly isNotFound: boolean;
  readonly isConflict: boolean;
  readonly isNetworkError: boolean;
  readonly validationErrors?: string[];

  constructor(
    message: string,
    status = 500,
    isNetworkError = false,
    validationErrors?: string[],
  ) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.isUnauthorized = status === 401;
    this.isNotFound = status === 404;
    this.isConflict = status === 409;
    this.isNetworkError = isNetworkError;
    this.validationErrors = validationErrors;
  }
}

const BASE_API_PATH = '/api/backend';

interface NestErrorPayload {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

async function parseErrorResponse(response: Response): Promise<{
  message: string;
  validationErrors?: string[];
}> {
  try {
    const data = (await response.json()) as NestErrorPayload;
    if (typeof data.message === 'string') {
      return { message: data.message };
    }
    if (Array.isArray(data.message) && data.message.length > 0) {
      return {
        message: data.message[0],
        validationErrors: data.message,
      };
    }
    return { message: response.statusText || 'An unexpected error occurred' };
  } catch {
    return { message: response.statusText || 'An unexpected error occurred' };
  }
}

// Single-flight refresh token promise to prevent concurrent refreshes
let refreshPromise: Promise<AuthTokens | null> | null = null;

async function attemptTokenRefresh(): Promise<AuthTokens | null> {
  const currentTokens = getStoredTokens();
  if (!currentTokens?.refreshToken) {
    clearStoredTokens();
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_API_PATH}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
      });

      if (!response.ok) {
        clearStoredTokens();
        return null;
      }

      const newTokens = (await response.json()) as AuthTokens;
      setStoredTokens(newTokens);
      return newTokens;
    } catch {
      clearStoredTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Low-level request helper
async function rawRequest<T>(
  path: string,
  init?: RequestInit,
  accessToken?: string,
): Promise<T> {
  const url = `${BASE_API_PATH}${path}`;
  const headers = new Headers(init?.headers);

  headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Network connection failed. Please check your internet connection.';
    throw new AuthApiError(message, 0, true);
  }

  if (!response.ok) {
    const { message, validationErrors } = await parseErrorResponse(response);
    throw new AuthApiError(
      message,
      response.status,
      false,
      validationErrors,
    );
  }

  return (await response.json()) as T;
}

// Authenticated request with automatic 401 token refresh retry
export async function authenticatedRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const tokens = getStoredTokens();
  const accessToken = tokens?.accessToken;

  try {
    return await rawRequest<T>(path, init, accessToken);
  } catch (error) {
    if (error instanceof AuthApiError && error.isUnauthorized) {
      // Access token expired, attempt refresh
      const refreshedTokens = await attemptTokenRefresh();
      if (refreshedTokens?.accessToken) {
        // Retry with refreshed access token
        return await rawRequest<T>(path, init, refreshedTokens.accessToken);
      }
    }
    throw error;
  }
}

// Public Auth Endpoints
export async function signup(dto: SignUpDto): Promise<AuthResponse> {
  return rawRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  return rawRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  return rawRequest<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return authenticatedRequest<CurrentUserResponse>('/auth/me', {
    method: 'GET',
  });
}

export async function logout(): Promise<{ success: boolean }> {
  try {
    return await authenticatedRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Return success locally even if server is unreachable
    return { success: true };
  } finally {
    clearStoredTokens();
  }
}

// Workspace Endpoints
export async function getCurrentWorkspace(): Promise<FullWorkspace> {
  return authenticatedRequest<FullWorkspace>('/workspaces/me', {
    method: 'GET',
  });
}

export async function updateCurrentWorkspace(
  dto: UpdateWorkspaceDto,
): Promise<FullWorkspace> {
  return authenticatedRequest<FullWorkspace>('/workspaces/me', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

// User Profile Endpoints
export async function updateCurrentUser(
  dto: UpdateProfileDto,
): Promise<SafeUser> {
  return authenticatedRequest<SafeUser>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

// Agent Endpoints
export async function getAgents(): Promise<PublicAgentInfo[]> {
  return authenticatedRequest<PublicAgentInfo[]>('/agents', {
    method: 'GET',
  });
}
