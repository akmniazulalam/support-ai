export function getWidgetStyles(position: 'bottom-right' | 'bottom-left' = 'bottom-right'): string {
  const isLeft = position === 'bottom-left';
  const posAlign = isLeft ? 'left: 20px;' : 'right: 20px;';
  const panelPosAlign = isLeft ? 'left: 20px;' : 'right: 20px;';

  return `
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');

:host {
  all: initial;
  position: fixed;
  z-index: 2147483647;
  font-family: 'Lexend', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color-scheme: dark;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Floating Launcher */
.supportai-launcher {
  position: fixed;
  bottom: 20px;
  ${posAlign}
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #111218;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
  z-index: 2147483647;
}

.supportai-launcher:hover {
  transform: scale(1.05);
  background: #171822;
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 12px 35px -5px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.3);
}

.supportai-launcher:active {
  transform: scale(0.96);
}

.supportai-launcher:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 3px;
}

.supportai-launcher-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.supportai-launcher.is-open .supportai-icon-chat {
  display: none;
}

.supportai-launcher.is-open .supportai-icon-close {
  display: block;
  color: #d4d4d8;
}

.supportai-launcher:not(.is-open) .supportai-icon-chat {
  display: block;
}

.supportai-launcher:not(.is-open) .supportai-icon-close {
  display: none;
}

/* Launcher Notification Badge */
.supportai-unread-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid #111218;
  border-radius: 50%;
  display: none;
}

.supportai-unread-badge.is-visible {
  display: block;
}

/* Chat Panel Container */
.supportai-panel {
  position: fixed;
  bottom: 88px;
  ${panelPosAlign}
  width: 380px;
  max-width: calc(100vw - 40px);
  height: 600px;
  max-height: calc(100vh - 110px);
  background: #0f1017;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2147483646;
  opacity: 0;
  transform: translateY(16px) scale(0.96);
  pointer-events: none;
  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.supportai-panel.is-open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

/* Panel Header */
.supportai-header {
  padding: 14px 16px;
  background: #12131c;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.supportai-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.supportai-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #1b1c28;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.supportai-avatar-badge {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border: 1.5px solid #12131c;
  border-radius: 50%;
}

.supportai-agent-meta {
  min-width: 0;
}

.supportai-agent-name {
  font-size: 13px;
  font-weight: 600;
  color: #f4f4f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.supportai-agent-status {
  font-size: 11px;
  color: #71717a;
  line-height: 1.2;
  margin-top: 2px;
}

.supportai-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.supportai-header-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;
  outline: none;
}

.supportai-header-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #f4f4f5;
}

.supportai-header-btn:focus-visible {
  outline: 2px solid #10b981;
}

/* Messages Area */
.supportai-messages-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}

.supportai-messages-wrap::-webkit-scrollbar {
  width: 5px;
}

.supportai-messages-wrap::-webkit-scrollbar-track {
  background: transparent;
}

.supportai-messages-wrap::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.supportai-messages-wrap::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Welcome Greeting Card */
.supportai-greeting-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 4px;
  text-align: left;
}

.supportai-greeting-title {
  font-size: 13px;
  font-weight: 600;
  color: #e4e4e7;
  margin-bottom: 4px;
}

.supportai-greeting-text {
  font-size: 12px;
  color: #a1a1aa;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Message Rows & Bubbles */
.supportai-message-row {
  display: flex;
  flex-direction: column;
  max-width: 82%;
}

.supportai-message-row.is-user {
  align-self: flex-end;
  align-items: flex-end;
}

.supportai-message-row.is-assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.supportai-bubble {
  padding: 10px 14px;
  font-size: 12.5px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.supportai-message-row.is-user .supportai-bubble {
  font-family: 'Lexend';
  background: #059669;
  color: #ffffff;
  border-radius: 14px 14px 4px 14px;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
}

.supportai-message-row.is-assistant .supportai-bubble {
  font-family: 'Lexend';
  background: #171822;
  color: #e4e4e7;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px 14px 14px 4px;
}

.supportai-message-time {
  font-size: 10px;
  color: #52525b;
  margin-top: 3px;
  padding: 0 4px;
}

/* Thinking Indicator */
.supportai-typing {
  align-self: flex-start;
  display: none;
  background: #171822;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px 14px 14px 4px;
  padding: 10px 14px;
}

.supportai-typing.is-visible {
  display: flex;
  align-items: center;
  gap: 4px;
}

.supportai-typing-dot {
  width: 5px;
  height: 5px;
  background: #10b981;
  border-radius: 50%;
  opacity: 0.4;
  animation: supportai-pulse 1.2s infinite ease-in-out;
}

.supportai-typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.supportai-typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes supportai-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

/* Status Banners */
.supportai-banner {
  padding: 8px 12px;
  font-size: 11px;
  line-height: 1.4;
  display: none;
  margin: 0 16px 8px;
  border-radius: 8px;
}

.supportai-banner.is-visible {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.supportai-banner.is-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.supportai-banner.is-rate-limit {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.supportai-banner-retry {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 11px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

/* Composer Area */
.supportai-composer-wrap {
  padding: 10px 14px;
  background: #12131c;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.supportai-textarea {
  flex: 1;
  min-height: 38px;
  max-height: 110px;
  padding: 8px 10px;
  background: #171822;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #f4f4f5;
  font-family: 'Lexend';
  font-size: 12.5px;
  line-height: 1.45;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.supportai-textarea:focus {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.supportai-textarea::placeholder {
  color: #52525b;
}

.supportai-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.supportai-send-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #059669;
  border: none;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
  outline: none;
}

.supportai-send-btn:hover:not(:disabled) {
  background: #10b981;
  transform: scale(1.03);
}

.supportai-send-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.supportai-send-btn:disabled {
  background: #1b1c28;
  color: #52525b;
  cursor: not-allowed;
  opacity: 0.5;
}

.supportai-send-btn:focus-visible {
  outline: 2px solid #10b981;
}

/* Footer / Branding */
.supportai-footer {
  padding: 6px 14px 8px;
  background: #12131c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 10px;
  color: #52525b;
  user-select: none;
}

.supportai-footer-link {
  color: #71717a;
  text-decoration: none;
  font-weight: 500;
}

/* Mobile Responsiveness */
@media (max-width: 480px) {
  .supportai-panel {
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100% !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
  }

  .supportai-launcher.is-open {
    display: none;
  }
}
  `.trim();
}
