import {
  createPublicConversation,
  fetchPublicAgent,
  fetchPublicConversation,
  sendPublicMessage,
  WidgetApiError,
} from './api';
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from './storage';
import { getWidgetStyles } from './styles';
import type {
  AgentPublicInfo,
  ChatSession,
  PublicMessage,
  WidgetConfig,
} from './types';
import { WidgetUI } from './ui';

function findWidgetScript(): HTMLScriptElement | null {
  if (typeof document === 'undefined') return null;

  // 1. Check currentScript (standard when executing synchronously)
  if (document.currentScript instanceof HTMLScriptElement) {
    return document.currentScript;
  }

  // 2. Query for script with data-agent-id
  const withAgentId = document.querySelector<HTMLScriptElement>('script[data-agent-id]');
  if (withAgentId) {
    return withAgentId;
  }

  // 3. Fallback: find any script referencing widget.js
  const allScripts = document.querySelectorAll<HTMLScriptElement>('script[src*="widget.js"]');
  return allScripts[allScripts.length - 1] ?? null;
}

function resolveApiBaseUrl(script: HTMLScriptElement | null): string {
  // 1. Explicit data-api-url override on script tag (development / staging testing)
  if (script) {
    const override = script.getAttribute('data-api-url');
    if (override && override.trim().length > 0) {
      return override.trim().replace(/\/+$/, '');
    }
  }

  // 2. Extract origin from script.src
  if (script?.src) {
    try {
      const parsed = new URL(script.src);
      // If served from localhost:3000 web dev server, connect directly to localhost:3001
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      // In production, route via the web app's proxy /api/backend
      return `${parsed.origin}/api/backend`;
    } catch {
      // Ignore URL parsing errors
    }
  }

  // 3. Default fallback
  return 'http://localhost:3001';
}

class SupportAIWidget {
  private config: WidgetConfig;
  private shadow: ShadowRoot;
  private ui: WidgetUI;

  private agent: AgentPublicInfo | null = null;
  private activeSession: ChatSession | null = null;
  private messages: PublicMessage[] = [];
  private isExpanded = false;
  private lastFailedMessage: string | null = null;
  private rateLimitTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: WidgetConfig, shadow: ShadowRoot) {
    this.config = config;
    this.shadow = shadow;

    // Inject encapsulated CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = getWidgetStyles(config.position);
    this.shadow.appendChild(styleEl);

    // Initialize UI controller
    this.ui = new WidgetUI(this.shadow, {
      onToggle: () => this.togglePanel(),
      onSendMessage: (content) => this.sendMessage(content),
      onRetry: () => this.retryLastMessage(),
    });

    // Start initialization
    void this.initialize();
  }

  private togglePanel(): void {
    this.isExpanded = !this.isExpanded;
    this.ui.setOpen(this.isExpanded);
  }

  private startRateLimitCooldown(seconds = 60): void {
    let remaining = seconds;
    this.ui.setStatus('rate_limited', null, remaining);

    if (this.rateLimitTimer) {
      clearInterval(this.rateLimitTimer);
    }

    this.rateLimitTimer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (this.rateLimitTimer) {
          clearInterval(this.rateLimitTimer);
          this.rateLimitTimer = null;
        }
        this.ui.setStatus('ready');
      } else {
        this.ui.setStatus('rate_limited', null, remaining);
      }
    }, 1000);
  }

  private async initialize(): Promise<void> {
    this.ui.setStatus('initializing');

    try {
      // 1. Fetch public agent configuration
      const agentData = await fetchPublicAgent(this.config.apiUrl, this.config.agentId);
      this.agent = agentData;
      this.ui.setAgent(agentData);

      // 2. Validate existing stored session if available
      const stored = getStoredSession(this.config.agentId);
      if (stored) {
        try {
          const conversationData = await fetchPublicConversation(
            this.config.apiUrl,
            stored.conversationId,
            stored.sessionToken,
          );
          this.activeSession = stored;
          this.messages = conversationData.messages;
          this.ui.renderMessages(this.messages);
        } catch {
          // If session expired or not found, clear storage and start clean
          clearStoredSession(this.config.agentId);
          this.activeSession = null;
          this.messages = [];
          this.ui.renderMessages([]);
        }
      }

      this.ui.setStatus('ready');
    } catch (err) {
      if (err instanceof WidgetApiError) {
        if (err.isNotFound) {
          this.ui.setStatus('not_found', 'Support agent not found or currently inactive.');
        } else if (err.isRateLimited) {
          this.startRateLimitCooldown();
        } else {
          this.ui.setStatus('error', err.message);
        }
      } else {
        this.ui.setStatus('error', 'Unable to connect to support services.');
      }
    }
  }

  private async sendMessage(content: string): Promise<void> {
    const trimmed = content.trim();
    if (!trimmed) return;

    this.lastFailedMessage = null;
    this.ui.setStatus('sending');

    // 1. Ensure active session exists or create one
    let session = this.activeSession;
    if (!session) {
      try {
        const convRes = await createPublicConversation(this.config.apiUrl, this.config.agentId);
        session = {
          conversationId: convRes.conversation.id,
          sessionToken: convRes.sessionToken,
        };
        this.activeSession = session;
        setStoredSession(this.config.agentId, session);
      } catch (convErr) {
        if (convErr instanceof WidgetApiError && convErr.isRateLimited) {
          this.startRateLimitCooldown();
          return;
        }
        this.lastFailedMessage = trimmed;
        this.ui.setStatus('error', 'Could not initialize conversation. Please try again.');
        return;
      }
    }

    // 2. Optimistic user message in UI
    const optimisticMsg: PublicMessage = {
      id: `local-${Date.now()}`,
      role: 'USER',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(optimisticMsg);
    this.ui.appendMessage(optimisticMsg);

    // 3. Send message through public API
    try {
      const assistantMsg = await sendPublicMessage(
        this.config.apiUrl,
        session.conversationId,
        session.sessionToken,
        trimmed,
      );

      this.messages.push(assistantMsg);
      this.ui.appendMessage(assistantMsg);
      this.ui.setStatus('ready');

      // If panel is closed, show subtle unread dot
      if (!this.isExpanded) {
        this.ui.showUnreadDot();
      }
    } catch (sendErr) {
      this.lastFailedMessage = trimmed;

      if (sendErr instanceof WidgetApiError) {
        if (sendErr.isRateLimited) {
          this.startRateLimitCooldown();
        } else if (sendErr.isNotFound) {
          // Stored session invalidated
          clearStoredSession(this.config.agentId);
          this.activeSession = null;
          this.ui.setStatus('error', 'Your session expired. Please send a message to start a new chat.');
        } else {
          this.ui.setStatus('error', sendErr.message);
        }
      } else {
        this.ui.setStatus('error', 'Failed to send message. Please check your connection.');
      }
    }
  }

  private async retryLastMessage(): Promise<void> {
    if (this.lastFailedMessage) {
      const msg = this.lastFailedMessage;
      this.lastFailedMessage = null;
      await this.sendMessage(msg);
    }
  }
}

// Self-initialization entry point
function initWidget(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Multiple script execution guard
  const ROOT_ID = 'supportai-widget-root';
  if (document.getElementById(ROOT_ID)) {
    return;
  }

  const script = findWidgetScript();
  const agentId = script?.getAttribute('data-agent-id')?.trim();

  if (!agentId) {
    // Safe error message in debug/console context without crashing host
    console.error(
      '[SupportAI Widget] Failed to initialize: missing required "data-agent-id" attribute on script element.',
    );
    return;
  }

  const positionAttr = script?.getAttribute('data-position')?.trim().toLowerCase();
  const position = positionAttr === 'bottom-left' ? 'bottom-left' : 'bottom-right';
  const apiUrl = resolveApiBaseUrl(script);

  const config: WidgetConfig = {
    agentId,
    position,
    apiUrl,
  };

  function mount(): void {
    if (document.getElementById(ROOT_ID)) return;

    const hostEl = document.createElement('div');
    hostEl.id = ROOT_ID;
    hostEl.setAttribute('aria-live', 'polite');

    const shadow = hostEl.attachShadow({ mode: 'open' });
    document.body.appendChild(hostEl);

    new SupportAIWidget(config, shadow);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
}

initWidget();
