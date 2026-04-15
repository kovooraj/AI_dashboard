import type { HealthStatus } from '@/lib/types';

const config: Record<HealthStatus, { label: string; classes: string; dot: string }> = {
  healthy: {
    label: 'Healthy',
    classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  degraded: {
    label: 'Degraded',
    classes: 'bg-amber-100 text-amber-800 border border-amber-200',
    dot: 'bg-amber-500',
  },
  failing: {
    label: 'Failing',
    classes: 'bg-red-100 text-red-800 border border-red-200',
    dot: 'bg-red-500',
  },
  unknown: {
    label: 'No Runs',
    classes: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
    dot: 'bg-zinc-400',
  },
};

export function HealthBadge({ status }: { status: HealthStatus }) {
  const { label, classes, dot } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
