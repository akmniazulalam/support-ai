import type { ComponentType, SVGProps } from 'react';

interface AdminStatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
  accent?: 'emerald' | 'sky' | 'amber' | 'zinc';
}

export function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  badge,
  accent = 'zinc',
}: AdminStatCardProps) {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  const iconAccentClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    zinc: 'text-zinc-400 bg-zinc-800/80 border-white/[0.08]',
  }[accent];

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#111218] p-5 shadow-xs transition-colors hover:border-white/[0.14]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {title}
          </p>
          <div className="mt-2 text-2xl font-bold tracking-tight text-white tabular-nums">
            {formattedValue}
          </div>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconAccentClasses}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(description || badge) && (
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3 text-xs text-zinc-500">
          {description && <span className="truncate">{description}</span>}
          {badge && (
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
