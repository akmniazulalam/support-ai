import type { AgentPublicInfo, PublicMessage, WidgetStatus } from './types';

export interface WidgetCallbacks {
  onToggle: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onRetry: () => Promise<void>;
}

export class WidgetUI {
  private shadow: ShadowRoot;
  private callbacks: WidgetCallbacks;

  // Key DOM references
  private launcherBtn!: HTMLButtonElement;
  private unreadBadge!: HTMLDivElement;
  private panel!: HTMLDivElement;
  private agentNameEl!: HTMLDivElement;
  private agentStatusEl!: HTMLDivElement;
  private messagesContainer!: HTMLDivElement;
  private greetingCard!: HTMLDivElement;
  private greetingTitle!: HTMLDivElement;
  private greetingText!: HTMLDivElement;
  private typingIndicator!: HTMLDivElement;
  private errorBanner!: HTMLDivElement;
  private errorMessageText!: HTMLSpanElement;
  private retryBtn!: HTMLButtonElement;
  private textarea!: HTMLTextAreaElement;
  private sendBtn!: HTMLButtonElement;

  private isOpen = false;
  private currentStatus: WidgetStatus = 'initializing';

  constructor(shadow: ShadowRoot, callbacks: WidgetCallbacks) {
    this.shadow = shadow;
    this.callbacks = callbacks;
    this.buildDOM();
    this.attachEventListeners();
  }

  private buildDOM(): void {
    // 1. Floating launcher button
    this.launcherBtn = document.createElement('button');
    this.launcherBtn.className = 'supportai-launcher';
    this.launcherBtn.type = 'button';
    this.launcherBtn.setAttribute('aria-label', 'Open support chat');
    this.launcherBtn.setAttribute('aria-expanded', 'false');
    this.launcherBtn.setAttribute('aria-haspopup', 'dialog');

    this.launcherBtn.innerHTML = `
      <div class="supportai-launcher-icon supportai-icon-chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="supportai-launcher-icon supportai-icon-close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      <div class="supportai-unread-badge"></div>
    `;

    this.unreadBadge = this.launcherBtn.querySelector('.supportai-unread-badge') as HTMLDivElement;

    // 2. Chat Panel Container
    this.panel = document.createElement('div');
    this.panel.className = 'supportai-panel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Customer Support Chat');
    this.panel.setAttribute('aria-modal', 'false');

    this.panel.innerHTML = `
      <!-- Header -->
      <div class="supportai-header">
        <div class="supportai-header-info">
          <div class="supportai-avatar" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8V4H8"/>
              <rect width="16" height="12" x="4" y="8" rx="2"/>
              <path d="M2 14h2"/>
              <path d="M20 14h2"/>
              <path d="M15 13v2"/>
              <path d="M9 13v2"/>
            </svg>
            <div class="supportai-avatar-badge"></div>
          </div>
          <div class="supportai-agent-meta">
            <div class="supportai-agent-name">Support AI</div>
            <div class="supportai-agent-status">Online</div>
          </div>
        </div>
        <div class="supportai-header-actions">
          <button class="supportai-header-btn supportai-close-btn" type="button" aria-label="Minimize support chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages Stream -->
      <div class="supportai-messages-wrap" tabindex="0" role="log" aria-live="polite">
        <div class="supportai-greeting-card" style="display: none;">
          <div class="supportai-greeting-title">Welcome to support</div>
          <div class="supportai-greeting-text">How can we assist you today?</div>
        </div>

        <div class="supportai-typing">
          <div class="supportai-typing-dot"></div>
          <div class="supportai-typing-dot"></div>
          <div class="supportai-typing-dot"></div>
        </div>
      </div>

      <!-- Status Banner (Error / Rate Limit) -->
      <div class="supportai-banner" role="alert">
        <span class="supportai-banner-text"></span>
        <button class="supportai-banner-retry" type="button">Retry</button>
      </div>

      <!-- Composer Input -->
      <div class="supportai-composer-wrap">
        <textarea
          class="supportai-textarea"
          rows="1"
          placeholder="Write a message..."
          aria-label="Type your message"
          maxlength="4000"
        ></textarea>
        <button class="supportai-send-btn" type="button" aria-label="Send message" disabled>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <!-- Branding Footer -->
      <div class="supportai-footer">
        Powered by <span class="supportai-footer-link">SupportAI</span>
      </div>
    `;

    // Cache elements
    this.agentNameEl = this.panel.querySelector('.supportai-agent-name') as HTMLDivElement;
    this.agentStatusEl = this.panel.querySelector('.supportai-agent-status') as HTMLDivElement;
    this.messagesContainer = this.panel.querySelector('.supportai-messages-wrap') as HTMLDivElement;
    this.greetingCard = this.panel.querySelector('.supportai-greeting-card') as HTMLDivElement;
    this.greetingTitle = this.panel.querySelector('.supportai-greeting-title') as HTMLDivElement;
    this.greetingText = this.panel.querySelector('.supportai-greeting-text') as HTMLDivElement;
    this.typingIndicator = this.panel.querySelector('.supportai-typing') as HTMLDivElement;
    this.errorBanner = this.panel.querySelector('.supportai-banner') as HTMLDivElement;
    this.errorMessageText = this.panel.querySelector('.supportai-banner-text') as HTMLSpanElement;
    this.retryBtn = this.panel.querySelector('.supportai-banner-retry') as HTMLButtonElement;
    this.textarea = this.panel.querySelector('.supportai-textarea') as HTMLTextAreaElement;
    this.sendBtn = this.panel.querySelector('.supportai-send-btn') as HTMLButtonElement;

    // Append to shadow root
    this.shadow.appendChild(this.launcherBtn);
    this.shadow.appendChild(this.panel);
  }

  private attachEventListeners(): void {
    // Launcher click
    this.launcherBtn.addEventListener('click', () => {
      this.callbacks.onToggle();
    });

    // Close button in header
    const closeBtn = this.panel.querySelector('.supportai-close-btn');
    closeBtn?.addEventListener('click', () => {
      this.callbacks.onToggle();
    });

    // Textarea input & resizing
    this.textarea.addEventListener('input', () => {
      this.autoResizeTextarea();
      this.updateSendButtonState();
    });

    // Keyboard handling in composer (Enter to send, Shift+Enter for newline)
    this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void this.handleSend();
      }
    });

    // Send button click
    this.sendBtn.addEventListener('click', () => {
      void this.handleSend();
    });

    // Retry button click
    this.retryBtn.addEventListener('click', () => {
      void this.callbacks.onRetry();
    });

    // Escape key closes the panel
    window.addEventListener('keydown', this.handleWindowKeyDown);
  }

  private handleWindowKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen) {
      this.callbacks.onToggle();
      this.launcherBtn.focus();
    }
  };

  private autoResizeTextarea(): void {
    this.textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(this.textarea.scrollHeight, 38), 110);
    this.textarea.style.height = `${newHeight}px`;
  }

  private updateSendButtonState(): void {
    const hasText = this.textarea.value.trim().length > 0;
    const canSend = hasText && this.currentStatus !== 'sending' && this.currentStatus !== 'rate_limited';
    this.sendBtn.disabled = !canSend;
  }

  private async handleSend(): Promise<void> {
    const content = this.textarea.value.trim();
    if (!content || this.currentStatus === 'sending' || this.currentStatus === 'rate_limited') {
      return;
    }

    this.textarea.value = '';
    this.autoResizeTextarea();
    this.updateSendButtonState();

    await this.callbacks.onSendMessage(content);
  }

  public setOpen(open: boolean): void {
    this.isOpen = open;
    this.launcherBtn.classList.toggle('is-open', open);
    this.launcherBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    this.panel.classList.toggle('is-open', open);

    if (open) {
      this.unreadBadge.classList.remove('is-visible');
      setTimeout(() => {
        this.textarea.focus();
        this.scrollToBottom();
      }, 100);
    }
  }

  public showUnreadDot(): void {
    if (!this.isOpen) {
      this.unreadBadge.classList.add('is-visible');
    }
  }

  public setAgent(agent: AgentPublicInfo | null): void {
    if (!agent) {
      this.agentNameEl.textContent = 'Support AI';
      this.greetingCard.style.display = 'none';
      return;
    }

    this.agentNameEl.textContent = agent.name;
    this.greetingTitle.textContent = `Welcome to ${agent.name}`;

    if (agent.greeting && agent.greeting.trim().length > 0) {
      this.greetingText.textContent = agent.greeting.trim();
      this.greetingCard.style.display = 'block';
    } else {
      this.greetingText.textContent = 'How can we help you today?';
      this.greetingCard.style.display = 'block';
    }
  }

  public setStatus(status: WidgetStatus, errorMessage: string | null = null, secondsRemaining = 0): void {
    this.currentStatus = status;
    this.updateSendButtonState();

    // Typing indicator
    if (status === 'sending') {
      this.typingIndicator.classList.add('is-visible');
      this.scrollToBottom();
    } else {
      this.typingIndicator.classList.remove('is-visible');
    }

    // Error and rate limit banners
    if (status === 'error' && errorMessage) {
      this.errorBanner.className = 'supportai-banner is-visible is-error';
      this.errorMessageText.textContent = errorMessage;
      this.retryBtn.style.display = 'inline-block';
    } else if (status === 'rate_limited') {
      this.errorBanner.className = 'supportai-banner is-visible is-rate-limit';
      this.errorMessageText.textContent = `Too many messages. Please wait ${secondsRemaining}s.`;
      this.retryBtn.style.display = 'none';
    } else if (status === 'not_found') {
      this.errorBanner.className = 'supportai-banner is-visible is-error';
      this.errorMessageText.textContent = errorMessage || 'Support agent is currently inactive or not found.';
      this.retryBtn.style.display = 'none';
      this.textarea.disabled = true;
      this.sendBtn.disabled = true;
    } else {
      this.errorBanner.className = 'supportai-banner';
      this.errorBanner.style.display = 'none';
    }
  }

  public renderMessages(messages: PublicMessage[]): void {
    // Preserve greeting card and typing indicator
    // Remove all existing message rows
    const existingRows = this.messagesContainer.querySelectorAll('.supportai-message-row');
    existingRows.forEach((r) => r.remove());

    // If we have messages, hide greeting card to save space
    if (messages.length > 0) {
      this.greetingCard.style.display = 'none';
    }

    // Insert messages before the typing indicator
    messages.forEach((msg) => {
      const row = this.createMessageElement(msg);
      this.messagesContainer.insertBefore(row, this.typingIndicator);
    });

    this.scrollToBottom();
  }

  public appendMessage(msg: PublicMessage): void {
    this.greetingCard.style.display = 'none';
    const row = this.createMessageElement(msg);
    this.messagesContainer.insertBefore(row, this.typingIndicator);
    this.scrollToBottom();
  }

  private createMessageElement(msg: PublicMessage): HTMLDivElement {
    const isUser = msg.role === 'USER';
    const row = document.createElement('div');
    row.className = `supportai-message-row ${isUser ? 'is-user' : 'is-assistant'}`;

    const bubble = document.createElement('div');
    bubble.className = 'supportai-bubble';
    bubble.textContent = msg.content;

    const timeEl = document.createElement('div');
    timeEl.className = 'supportai-message-time';
    timeEl.textContent = this.formatTime(msg.createdAt);

    row.appendChild(bubble);
    row.appendChild(timeEl);

    return row;
  }

  private formatTime(iso: string): string {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  public scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleWindowKeyDown);
  }
}
