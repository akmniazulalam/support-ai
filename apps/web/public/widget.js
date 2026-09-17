(function(){var e=class extends Error{constructor(e,t=500,n=!1){super(e),this.name=`WidgetApiError`,this.status=t,this.isNotFound=t===404,this.isRateLimited=t===429,this.isNetworkError=n}};function t(e,t){return`${e.replace(/\/+$/,``)}${t.startsWith(`/`)?t:`/${t}`}`}async function n(e){try{let t=await e.json();return typeof t.message==`string`?t.message:Array.isArray(t.message)&&t.message.length>0?t.message[0]:e.statusText||`An unexpected error occurred.`}catch{return e.statusText||`An unexpected error occurred.`}}async function r(t,r){let i;try{i=await fetch(t,{...r,headers:{Accept:`application/json`,...r?.headers??{}}})}catch(t){throw new e(t instanceof Error?t.message:`Network connection failed. Please verify your internet connection.`,0,!0)}if(!i.ok)throw new e(await n(i),i.status,!1);return await i.json()}async function i(e,n){return(await r(t(e,`/public/agents/${encodeURIComponent(n)}`),{method:`GET`})).agent}async function a(e,n){return r(t(e,`/public/agents/${encodeURIComponent(n)}/conversations`),{method:`POST`})}async function o(e,n,i){return(await r(t(e,`/public/conversations/${encodeURIComponent(n)}`),{method:`GET`,headers:{Authorization:`Bearer ${i}`}})).conversation}async function s(e,n,i,a){return(await r(t(e,`/public/conversations/${encodeURIComponent(n)}/messages`),{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({sessionToken:i,message:a})})).message}function c(e){return`supportai_chat_${e}`}function l(e){if(typeof window>`u`)return null;try{let t=window.localStorage.getItem(c(e));if(!t)return null;let n=JSON.parse(t);return typeof n==`object`&&n&&`conversationId`in n&&`sessionToken`in n&&typeof n.conversationId==`string`&&typeof n.sessionToken==`string`&&n.conversationId.trim().length>0&&n.sessionToken.trim().length>0?{conversationId:n.conversationId.trim(),sessionToken:n.sessionToken.trim()}:(d(e),null)}catch{return null}}function u(e,t){if(typeof window<`u`)try{if(t.conversationId&&t.sessionToken&&typeof t.conversationId==`string`&&typeof t.sessionToken==`string`){let n={conversationId:t.conversationId.trim(),sessionToken:t.sessionToken.trim()};window.localStorage.setItem(c(e),JSON.stringify(n))}}catch{}}function d(e){if(typeof window<`u`)try{window.localStorage.removeItem(c(e))}catch{}}function f(e=`bottom-right`){let t=e===`bottom-left`;return`
:host {
  all: initial;
  position: fixed;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
  ${t?`left: 20px;`:`right: 20px;`}
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
  ${t?`left: 20px;`:`right: 20px;`}
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
  background: #059669;
  color: #ffffff;
  border-radius: 14px 14px 4px 14px;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
  font-family: 'Lexend';
}

.supportai-message-row.is-assistant .supportai-bubble {
  background: #171822;
  color: #e4e4e7;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px 14px 14px 4px;
  font-family: 'Lexend';
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
  font-family: inherit;
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
  `.trim()}var p=class{constructor(e,t){this.isOpen=!1,this.currentStatus=`initializing`,this.shadow=e,this.callbacks=t,this.buildDOM(),this.attachEventListeners()}buildDOM(){this.launcherBtn=document.createElement(`button`),this.launcherBtn.className=`supportai-launcher`,this.launcherBtn.type=`button`,this.launcherBtn.setAttribute(`aria-label`,`Open support chat`),this.launcherBtn.setAttribute(`aria-expanded`,`false`),this.launcherBtn.setAttribute(`aria-haspopup`,`dialog`),this.launcherBtn.innerHTML=`
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
    `,this.unreadBadge=this.launcherBtn.querySelector(`.supportai-unread-badge`),this.panel=document.createElement(`div`),this.panel.className=`supportai-panel`,this.panel.setAttribute(`role`,`dialog`),this.panel.setAttribute(`aria-label`,`Customer Support Chat`),this.panel.setAttribute(`aria-modal`,`false`),this.panel.innerHTML=`
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
    `,this.agentNameEl=this.panel.querySelector(`.supportai-agent-name`),this.agentStatusEl=this.panel.querySelector(`.supportai-agent-status`),this.messagesContainer=this.panel.querySelector(`.supportai-messages-wrap`),this.greetingCard=this.panel.querySelector(`.supportai-greeting-card`),this.greetingTitle=this.panel.querySelector(`.supportai-greeting-title`),this.greetingText=this.panel.querySelector(`.supportai-greeting-text`),this.typingIndicator=this.panel.querySelector(`.supportai-typing`),this.errorBanner=this.panel.querySelector(`.supportai-banner`),this.errorMessageText=this.panel.querySelector(`.supportai-banner-text`),this.retryBtn=this.panel.querySelector(`.supportai-banner-retry`),this.textarea=this.panel.querySelector(`.supportai-textarea`),this.sendBtn=this.panel.querySelector(`.supportai-send-btn`),this.shadow.appendChild(this.launcherBtn),this.shadow.appendChild(this.panel)}attachEventListeners(){this.launcherBtn.addEventListener(`click`,()=>{this.callbacks.onToggle()}),this.panel.querySelector(`.supportai-close-btn`)?.addEventListener(`click`,()=>{this.callbacks.onToggle()}),this.textarea.addEventListener(`input`,()=>{this.autoResizeTextarea(),this.updateSendButtonState()}),this.textarea.addEventListener(`keydown`,e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),this.handleSend())}),this.sendBtn.addEventListener(`click`,()=>{this.handleSend()}),this.retryBtn.addEventListener(`click`,()=>{this.callbacks.onRetry()}),window.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.isOpen&&(this.callbacks.onToggle(),this.launcherBtn.focus())})}autoResizeTextarea(){this.textarea.style.height=`auto`;let e=Math.min(Math.max(this.textarea.scrollHeight,38),110);this.textarea.style.height=`${e}px`}updateSendButtonState(){let e=this.textarea.value.trim().length>0&&this.currentStatus!==`sending`&&this.currentStatus!==`rate_limited`;this.sendBtn.disabled=!e}async handleSend(){let e=this.textarea.value.trim();e&&this.currentStatus!==`sending`&&this.currentStatus!==`rate_limited`&&(this.textarea.value=``,this.autoResizeTextarea(),this.updateSendButtonState(),await this.callbacks.onSendMessage(e))}setOpen(e){this.isOpen=e,this.launcherBtn.classList.toggle(`is-open`,e),this.launcherBtn.setAttribute(`aria-expanded`,e?`true`:`false`),this.panel.classList.toggle(`is-open`,e),e&&(this.unreadBadge.classList.remove(`is-visible`),setTimeout(()=>{this.textarea.focus(),this.scrollToBottom()},100))}showUnreadDot(){this.isOpen||this.unreadBadge.classList.add(`is-visible`)}setAgent(e){if(!e){this.agentNameEl.textContent=`Support AI`,this.greetingCard.style.display=`none`;return}this.agentNameEl.textContent=e.name,this.greetingTitle.textContent=`Welcome to ${e.name}`,e.greeting&&e.greeting.trim().length>0?(this.greetingText.textContent=e.greeting.trim(),this.greetingCard.style.display=`block`):(this.greetingText.textContent=`How can we help you today?`,this.greetingCard.style.display=`block`)}setStatus(e,t=null,n=0){this.currentStatus=e,this.updateSendButtonState(),e===`sending`?(this.typingIndicator.classList.add(`is-visible`),this.scrollToBottom()):this.typingIndicator.classList.remove(`is-visible`),e===`error`&&t?(this.errorBanner.className=`supportai-banner is-visible is-error`,this.errorMessageText.textContent=t,this.retryBtn.style.display=`inline-block`):e===`rate_limited`?(this.errorBanner.className=`supportai-banner is-visible is-rate-limit`,this.errorMessageText.textContent=`Too many messages. Please wait ${n}s.`,this.retryBtn.style.display=`none`):e===`not_found`?(this.errorBanner.className=`supportai-banner is-visible is-error`,this.errorMessageText.textContent=t||`Support agent is currently inactive or not found.`,this.retryBtn.style.display=`none`,this.textarea.disabled=!0,this.sendBtn.disabled=!0):(this.errorBanner.className=`supportai-banner`,this.errorBanner.style.display=`none`)}renderMessages(e){this.messagesContainer.querySelectorAll(`.supportai-message-row`).forEach(e=>e.remove()),e.length>0&&(this.greetingCard.style.display=`none`),e.forEach(e=>{let t=this.createMessageElement(e);this.messagesContainer.insertBefore(t,this.typingIndicator)}),this.scrollToBottom()}appendMessage(e){this.greetingCard.style.display=`none`;let t=this.createMessageElement(e);this.messagesContainer.insertBefore(t,this.typingIndicator),this.scrollToBottom()}createMessageElement(e){let t=e.role===`USER`,n=document.createElement(`div`);n.className=`supportai-message-row ${t?`is-user`:`is-assistant`}`;let r=document.createElement(`div`);r.className=`supportai-bubble`,r.textContent=e.content;let i=document.createElement(`div`);return i.className=`supportai-message-time`,i.textContent=this.formatTime(e.createdAt),n.appendChild(r),n.appendChild(i),n}formatTime(e){try{return new Date(e).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}catch{return``}}scrollToBottom(){requestAnimationFrame(()=>{this.messagesContainer.scrollTop=this.messagesContainer.scrollHeight})}};function m(){if(typeof document>`u`)return null;if(document.currentScript instanceof HTMLScriptElement)return document.currentScript;let e=document.querySelector(`script[data-agent-id]`);if(e)return e;let t=document.querySelectorAll(`script[src*="widget.js"]`);return t[t.length-1]??null}function h(e){if(e){let t=e.getAttribute(`data-api-url`);if(t&&t.trim().length>0)return t.trim().replace(/\/+$/,``)}if(e?.src)try{let t=new URL(e.src);return t.hostname===`localhost`||t.hostname===`127.0.0.1`?`http://localhost:3001`:`${t.origin}/api/backend`}catch{}return`http://localhost:3001`}var g=class{constructor(e,t){this.agent=null,this.activeSession=null,this.messages=[],this.isExpanded=!1,this.lastFailedMessage=null,this.rateLimitTimer=null,this.config=e,this.shadow=t;let n=document.createElement(`style`);n.textContent=f(e.position),this.shadow.appendChild(n),this.ui=new p(this.shadow,{onToggle:()=>this.togglePanel(),onSendMessage:e=>this.sendMessage(e),onRetry:()=>this.retryLastMessage()}),this.initialize()}togglePanel(){this.isExpanded=!this.isExpanded,this.ui.setOpen(this.isExpanded)}startRateLimitCooldown(e=60){let t=e;this.ui.setStatus(`rate_limited`,null,t),this.rateLimitTimer&&clearInterval(this.rateLimitTimer),this.rateLimitTimer=setInterval(()=>{--t,t<=0?(this.rateLimitTimer&&=(clearInterval(this.rateLimitTimer),null),this.ui.setStatus(`ready`)):this.ui.setStatus(`rate_limited`,null,t)},1e3)}async initialize(){this.ui.setStatus(`initializing`);try{let e=await i(this.config.apiUrl,this.config.agentId);this.agent=e,this.ui.setAgent(e);let t=l(this.config.agentId);if(t)try{let e=await o(this.config.apiUrl,t.conversationId,t.sessionToken);this.activeSession=t,this.messages=e.messages,this.ui.renderMessages(this.messages)}catch{d(this.config.agentId),this.activeSession=null,this.messages=[],this.ui.renderMessages([])}this.ui.setStatus(`ready`)}catch(t){t instanceof e?t.isNotFound?this.ui.setStatus(`not_found`,`Support agent not found or currently inactive.`):t.isRateLimited?this.startRateLimitCooldown():this.ui.setStatus(`error`,t.message):this.ui.setStatus(`error`,`Unable to connect to support services.`)}}async sendMessage(t){let n=t.trim();if(!n)return;this.lastFailedMessage=null,this.ui.setStatus(`sending`);let r=this.activeSession;if(!r)try{let e=await a(this.config.apiUrl,this.config.agentId);r={conversationId:e.conversation.id,sessionToken:e.sessionToken},this.activeSession=r,u(this.config.agentId,r)}catch(t){if(t instanceof e&&t.isRateLimited){this.startRateLimitCooldown();return}this.lastFailedMessage=n,this.ui.setStatus(`error`,`Could not initialize conversation. Please try again.`);return}let i={id:`local-${Date.now()}`,role:`USER`,content:n,createdAt:(/* @__PURE__ */ new Date()).toISOString()};this.messages.push(i),this.ui.appendMessage(i);try{let e=await s(this.config.apiUrl,r.conversationId,r.sessionToken,n);this.messages.push(e),this.ui.appendMessage(e),this.ui.setStatus(`ready`),this.isExpanded||this.ui.showUnreadDot()}catch(t){this.lastFailedMessage=n,t instanceof e?t.isRateLimited?this.startRateLimitCooldown():t.isNotFound?(d(this.config.agentId),this.activeSession=null,this.ui.setStatus(`error`,`Your session expired. Please send a message to start a new chat.`)):this.ui.setStatus(`error`,t.message):this.ui.setStatus(`error`,`Failed to send message. Please check your connection.`)}}async retryLastMessage(){if(this.lastFailedMessage){let e=this.lastFailedMessage;this.lastFailedMessage=null,await this.sendMessage(e)}}};function _(){if(typeof window>`u`||typeof document>`u`)return;let e=`supportai-widget-root`;if(document.getElementById(e))return;let t=m(),n=t?.getAttribute(`data-agent-id`)?.trim();if(!n){console.error(`[SupportAI Widget] Failed to initialize: missing required "data-agent-id" attribute on script element.`);return}let r={agentId:n,position:t?.getAttribute(`data-position`)?.trim().toLowerCase()===`bottom-left`?`bottom-left`:`bottom-right`,apiUrl:h(t)};function i(){if(document.getElementById(e))return;let t=document.createElement(`div`);t.id=e,t.setAttribute(`aria-live`,`polite`);let n=t.attachShadow({mode:`open`});document.body.appendChild(t),new g(r,n)}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,i,{once:!0}):i()}_()})();