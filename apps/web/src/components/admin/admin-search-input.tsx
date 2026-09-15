'use client';

import { SearchIcon, XIcon } from '@/components/ui/icons';

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
}: AdminSearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
        <SearchIcon className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-white/[0.1] bg-[#111218] py-2 pl-9 pr-8 text-xs text-zinc-100 placeholder-zinc-500 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={disabled}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
