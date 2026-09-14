import type { AuthTokens } from '@/types/auth';

const STORAGE_KEY = 'supportai_auth_tokens';

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'accessToken' in parsed &&
      'refreshToken' in parsed &&
      typeof (parsed as AuthTokens).accessToken === 'string' &&
      typeof (parsed as AuthTokens).refreshToken === 'string' &&
      (parsed as AuthTokens).accessToken.trim().length > 0 &&
      (parsed as AuthTokens).refreshToken.trim().length > 0
    ) {
      return parsed as AuthTokens;
    }

    // Invalid structure in storage, clear it
    clearStoredTokens();
    return null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (
      tokens.accessToken &&
      tokens.refreshToken &&
      typeof tokens.accessToken === 'string' &&
      typeof tokens.refreshToken === 'string' &&
      tokens.accessToken.trim().length > 0 &&
      tokens.refreshToken.trim().length > 0
    ) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    }
  } catch {
    // Gracefully handle storage quota or privacy mode errors
  }
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage deletion errors
  }
}
