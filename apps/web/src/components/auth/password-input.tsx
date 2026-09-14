import { useState, type InputHTMLAttributes } from 'react';
import { EyeIcon, EyeOffIcon, LockIcon } from '@/components/ui/icons';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
}

export function PasswordInput({ id, className = '', disabled, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-center">
      <div
        className="pointer-events-none absolute left-3 flex items-center text-zinc-500"
        aria-hidden="true"
      >
        <LockIcon className="h-4 w-4" />
      </div>

      <input
        {...props}
        id={id}
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        className={`w-full rounded-xl bg-[#141520] border border-white/[0.09] py-2.5 pl-9 pr-10 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-150 focus:border-zinc-400/50 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      />

      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        title={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-3 flex items-center text-zinc-500 hover:text-zinc-300 focus:outline-none focus-visible:text-zinc-200 transition-colors disabled:opacity-40"
      >
        {showPassword ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
