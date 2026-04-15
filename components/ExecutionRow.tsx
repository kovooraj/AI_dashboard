import type { N8nExecution } from '@/lib/types';

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusConfig = {
  success: { label: 'Success', classes: 'text-emerald-600 bg-emerald-50' },
  error: { label: 'Error', classes: 'text-red-600 bg-red-50' },
  crashed: { label: 'Crashed', classes: 'text-red-600 bg-red-50' },
  running: { label: 'Running', classes: 'text-blue-600 bg-blue-50' },
  waiting: { label: 'Waiting', classes: 'text-amber-600 bg-amber-50' },
};

export function ExecutionRow({ execution }: { execution: N8nExecution }) {
  const cfg = statusConfig[execution.status] ?? { label: execution.status, classes: 'text-zinc-600 bg-zinc-50' };

  return (
    <div className="flex items-center justify-between py-1.5 text-xs border-b border-zinc-100 last:border-0">
      <span
        className={`inline-block rounded px-1.5 py-0.5 font-medium ${cfg.classes}`}
      >
        {cfg.label}
      </span>
      <span className="text-zinc-400">
        {execution.startedAt ? formatRelativeTime(execution.startedAt) : '—'}
      </span>
    </div>
  );
}
