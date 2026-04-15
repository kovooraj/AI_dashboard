import type { WorkflowHealthData } from '@/lib/types';

export function StatsBar({ workflows }: { workflows: WorkflowHealthData[] }) {
  const total = workflows.length;
  const failing = workflows.filter((w) => w.health === 'failing').length;
  const degraded = workflows.filter((w) => w.health === 'degraded').length;
  const healthy = workflows.filter((w) => w.health === 'healthy').length;

  return (
    <div className="flex flex-wrap gap-4">
      <Stat label="Active Workflows" value={total} color="text-zinc-800" />
      <Stat label="Healthy" value={healthy} color="text-emerald-600" />
      <Stat label="Degraded" value={degraded} color="text-amber-600" />
      <Stat label="Failing" value={failing} color="text-red-600" />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}
