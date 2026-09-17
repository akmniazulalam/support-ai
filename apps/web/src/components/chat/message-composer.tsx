import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SendIcon } from './icons';

interface MessageComposerProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_CHARACTERS = 4000;
const WARNING_THRESHOLD = 3500;

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea height
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${Math.max(newHeight, 40)}px`;
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
    if (!trimmed || disabled) return;

    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSend(trimmed);
  };

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  const charCount = content.length;
  const showCounter = charCount >= WARNING_THRESHOLD;
  const isNearLimit = charCount >= MAX_CHARACTERS - 100;
  const canSubmit = content.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#0c0d14]/90 backdrop-blur-md shrink-0"
    >
      <div className="relative flex flex-col rounded-2xl bg-[#141520] border border-white/[0.09] shadow-inner focus-within:border-zinc-500/50 focus-within:ring-1 focus-within:ring-zinc-500/30 transition-all duration-150">
        <div className="flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            maxLength={MAX_CHARACTERS}
            placeholder={disabled ? 'Please wait...' : placeholder}
            aria-label="Message input"
            className="flex-1 max-h-[160px] min-h-[40px] resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed leading-relaxed chat-scrollbar"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Send message"
            title="Send message (Enter)"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-300 text-zinc-950 font-semibold shadow-sm transition-all duration-150 hover:brightness-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Character counter shown when approaching the 4,000 char limit */}
        {showCounter && (
          <div className="flex justify-end px-3 pb-1.5 pt-0.5">
            <span
              className={`text-[10px] font-lexend select-none ${
                isNearLimit ? 'text-amber-400 font-semibold' : 'text-zinc-500'
              }`}
            >
              {charCount} / {MAX_CHARACTERS}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-2 px-1 text-[11px] text-zinc-500">
        <span>Press <kbd className="font-lexend text-[10px] px-1 py-0.5 rounded bg-white/[0.06] text-zinc-400">Enter</kbd> to send, <kbd className="font-lexend text-[10px] px-1 py-0.5 rounded bg-white/[0.06] text-zinc-400">Shift+Enter</kbd> for new line</span>
        <span className="hidden sm:inline font-medium text-zinc-500">Powered by SupportAI</span>
      </div>
    </form>
  );
}
