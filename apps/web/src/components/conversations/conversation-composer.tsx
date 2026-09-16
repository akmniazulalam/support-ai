'use client';

import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AlertCircleIcon, SendIcon } from '@/components/ui/icons';

interface ConversationComposerProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
  errorMessage?: string | null;
  onClearError?: () => void;
}

const MAX_CHARACTERS = 4000;
const WARNING_THRESHOLD = 3500;

export function ConversationComposer({
  onSendMessage,
  disabled = false,
  isSending = false,
  placeholder = 'Type a message as the customer or reply...',
  errorMessage,
  onClearError,
}: ConversationComposerProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea height
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 140);
    textarea.style.height = `${Math.max(newHeight, 38)}px`;
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (errorMessage && onClearError) {
      onClearError();
    }
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setContent(value);
      adjustHeight();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || disabled || isSending) return;

    try {
      await onSendMessage(trimmed);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      // Error handled by parent; content is preserved in textarea
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  const charCount = content.length;
  const showCounter = charCount >= WARNING_THRESHOLD;
  const isNearLimit = charCount >= MAX_CHARACTERS - 100;
  const canSubmit = content.trim().length > 0 && !disabled && !isSending;

  return (
    <div className="border-t border-white/[0.08] bg-[#0c0d14]/95 p-3 sm:p-4 shrink-0">
      {/* Inline Error Banner */}
      {errorMessage && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 animate-message-entrance">
          <AlertCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-medium">Failed to send message:</span> {errorMessage}
          </div>
          {onClearError && (
            <button
              type="button"
              onClick={onClearError}
              className="text-red-400/80 hover:text-red-300 transition-colors underline text-[11px]"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative flex items-end gap-2 rounded-xl bg-[#141520] border border-white/[0.08] p-2 focus-within:border-zinc-500/60 focus-within:ring-1 focus-within:ring-zinc-500/30 transition-all duration-150">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            rows={1}
            maxLength={MAX_CHARACTERS}
            placeholder={isSending ? 'Sending message...' : placeholder}
            aria-label="Message text"
            className="flex-1 max-h-[140px] min-h-[38px] resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed leading-relaxed chat-scrollbar"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            aria-label={isSending ? 'Sending message' : 'Send message'}
            title="Send message (Enter)"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 font-semibold shadow-xs transition-all duration-150 hover:bg-white active:scale-95 disabled:opacity-20 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
          >
            {isSending ? (
              <div className="h-4 w-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Counter and Helper notes */}
        <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500 select-none">
          <div className="flex items-center gap-2">
            <span>
              <kbd className="font-lexend text-[10px] px-1 py-0.2 rounded bg-white/[0.06] text-zinc-400">Enter</kbd> to send
            </span>
            <span className="text-zinc-600">·</span>
            <span>
              <kbd className="font-lexend text-[10px] px-1 py-0.2 rounded bg-white/[0.06] text-zinc-400">Shift+Enter</kbd> newline
            </span>
          </div>

          {showCounter && (
            <span
              className={`font-lexend text-[10px] ${
                isNearLimit ? 'text-amber-400 font-semibold' : 'text-zinc-500'
              }`}
            >
              {charCount} / {MAX_CHARACTERS}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
