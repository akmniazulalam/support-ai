import type { ChatSession } from './types';

function getStorageKey(publicId: string): string {
  return `supportai_chat_${publicId}`;
}

export function getStoredSession(publicId: string): ChatSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(publicId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'conversationId' in parsed &&
      'sessionToken' in parsed &&
      typeof (parsed as ChatSession).conversationId === 'string' &&
      typeof (parsed as ChatSession).sessionToken === 'string' &&
      (parsed as ChatSession).conversationId.trim().length > 0 &&
      (parsed as ChatSession).sessionToken.trim().length > 0
    ) {
      return {
        conversationId: (parsed as ChatSession).conversationId.trim(),
        sessionToken: (parsed as ChatSession).sessionToken.trim(),
      };
    }

    // Corrupt or invalid shape, discard cleanly
    clearStoredSession(publicId);
    return null;
  } catch {
    // Defensive handling for localStorage disabled or parse failure
    return null;
  }
}

export function setStoredSession(publicId: string, session: ChatSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (
      session.conversationId &&
      session.sessionToken &&
      typeof session.conversationId === 'string' &&
      typeof session.sessionToken === 'string'
    ) {
      const payload: ChatSession = {
        conversationId: session.conversationId.trim(),
        sessionToken: session.sessionToken.trim(),
      };
      window.localStorage.setItem(getStorageKey(publicId), JSON.stringify(payload));
    }
  } catch {
    // Gracefully ignore quota or privacy mode errors
  }
}

export function clearStoredSession(publicId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(getStorageKey(publicId));
  } catch {
    // Ignore deletion errors
  }
}
