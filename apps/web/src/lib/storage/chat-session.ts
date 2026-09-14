import type { ChatSession } from '@/types/chat';

function getStorageKey(publicId: string): string {
  return `supportai_chat_${publicId}`;
}

export function getStoredSession(publicId: string): ChatSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getStorageKey(publicId));
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
      return parsed as ChatSession;
    }

    // Invalid format in storage, remove it
    clearStoredSession(publicId);
    return null;
  } catch {
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
      window.sessionStorage.setItem(getStorageKey(publicId), JSON.stringify(session));
    }
  } catch {
    // Gracefully handle storage quota or privacy mode errors
  }
}

export function clearStoredSession(publicId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(getStorageKey(publicId));
  } catch {
    // Ignore storage deletion errors
  }
}
