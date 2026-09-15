/**
 * Format an ISO date string into a user-friendly relative timestamp.
 * e.g. "Just now", "2m ago", "3h ago", "Yesterday", "Mar 14"
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (isNaN(diffMs) || diffMs < 0) {
      return 'Just now';
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'Just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    const isCurrentYear = date.getFullYear() === now.getFullYear();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: isCurrentYear ? undefined : 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Format an ISO date string into a clean time string like "10:45 AM".
 */
export function formatMessageTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Format an ISO date string into full readable datetime.
 * e.g. "Mar 14, 2026 at 2:30 PM"
 */
export function formatFullDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const dateStr = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
    const timeStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
    return `${dateStr} at ${timeStr}`;
  } catch {
    return '';
  }
}

/**
 * Get a user-friendly short identifier for a conversation ID.
 * Avoids exposing raw database CUIDs directly.
 */
export function getShortConversationId(id: string): string {
  if (!id) return '';
  const suffix = id.length > 6 ? id.slice(-6).toUpperCase() : id.toUpperCase();
  return `#${suffix}`;
}
