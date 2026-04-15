'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { KPICard } from './KPICard';
import type { WorkflowHealthData, HistoryData, HistoryPeriod, HealthStatus } from '@/lib/types';

const ExecutionChart = dynamic(
  () => import('./ExecutionChart').then((m) => m.ExecutionChart),
  { ssr: false, loading: () => <div style={{ height: 200 }} /> }
);

const PERIODS: { key: HistoryPeriod; label: string }[] = [
  { key: 'week',    label: 'WEEK' },
  { key: 'month',   label: 'MONTH' },
  { key: 'quarter', label: 'QUARTER' },
  { key: 'year',    label: 'YEAR' },
];

const HEALTH_COLOR: Record<HealthStatus, string> = {
  healthy:  'var(--dash-green)',
  degraded: 'var(--dash-yellow)',
  failing:  'var(--dash-red)',
  unknown:  'var(--dash-muted)',
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  success: { bg: 'rgba(104,211,145,0.12)', color: 'var(--dash-green)' },
  error:   { bg: 'rgba(252,129,129,0.12)', color: 'var(--dash-red)' },
  crashed: { bg: 'rgba(252,129,129,0.12)', color: 'var(--dash-red)' },
  running: { bg: 'rgba(99,179,237,0.12)',  color: 'var(--dash-blue)' },
  waiting: { bg: 'rgba(246,224,94,0.12)',  color: 'var(--dash-yellow)' },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  workflowData: WorkflowHealthData;
  onBack: () => void;
}

export function WorkflowDetailPanel({ workflowData, onBack }: Props) {
  const { workflow, executions, health, successRate, lastRunAt, failureCount, runningCount } = workflowData;
  const [period, setPeriod] = useState<HistoryPeriod>('week');
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/history?period=${period}&workflowId=${workflow.id}`)
      .then((r) => r.json())
      .then((data: HistoryData) => { if (!cancelled) { setHistory(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [period, workflow.id]);

  const healthColor = HEALTH_COLOR[health];
  const periodRuns = history?.totalRuns ?? 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scroll">
      {/* Header */}
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--dash-border)' }}>
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-xs transition-colors hover:opacity-100"
          style={{ color: 'var(--dash-muted)', opacity: 0.7 }}
        >
          <span>←</span>
          <span>All Workflows</span>
        </button>

        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ background: healthColor }}
          />
          <div>
            <h2 className="text-base font-semibold leading-tight" style={{ color: 'var(--dash-text)' }}>
              {workflow.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
                style={{ background: `${healthColor}18`, color: healthColor }}
              >
                {health}
              </span>
              {runningCount > 0 && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--dash-blue)' }}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--dash-blue)' }} />
                  {runningCount} running
                </span>
              )}
              <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
                {workflow.active ? '● Active' : '○ Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-6 flex flex-col gap-5">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          <KPICard
            value={successRate !== null ? `${successRate}%` : '—'}
            label="Success Rate"
            sublabel="last 20 runs"
            color={healthColor}
          />
          <KPICard
            value={String(periodRuns)}
            label="Runs"
            sublabel={`This ${period}`}
            color="var(--dash-text)"
          />
          <KPICard
            value={lastRunAt ? relativeTime(lastRunAt) : '—'}
            label="Last Run"
            color="var(--dash-text)"
          />
        </div>

        {/* Failure/success quick summary */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-lg px-3 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)' }}
          >
            <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--dash-red)' }}>
              {failureCount}
            </span>
            <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
              recent failures
            </span>
          </div>
          <div
            className="rounded-lg px-3 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(104,211,145,0.08)', border: '1px solid rgba(104,211,145,0.2)' }}
          >
            <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--dash-green)' }}>
              {executions.filter(e => e.status === 'success').length}
            </span>
            <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
              recent successes
            </span>
          </div>
        </div>

        {/* Execution trend */}
        <div>
          <p className="section-label mb-3">Execution Trend</p>

          <div className="flex gap-0 mb-1" style={{ borderBottom: '1px solid var(--dash-border)' }}>
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className="px-3 py-2 text-xs font-bold tracking-wider transition-colors"
                style={{
                  color: period === key ? 'var(--dash-blue)' : 'var(--dash-muted)',
                  borderBottom: period === key ? '2px solid var(--dash-blue)' : '2px solid transparent',
                  marginBottom: '-1px',
                  background: 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="pt-3" style={{ opacity: loading ? 0.4 : 1, transition: 'opacity 0.25s' }}>
            {history?.buckets ? (
              <ExecutionChart buckets={history.buckets} height={180} />
            ) : (
              <div style={{ height: 180 }} />
            )}
          </div>
        </div>

        {/* Recent executions */}
        <div>
          <p className="section-label mb-3">Recent Executions</p>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--dash-border)' }}>
            {executions.length === 0 ? (
              <p className="px-4 py-5 text-xs text-center" style={{ color: 'var(--dash-muted)' }}>
                No executions found
              </p>
            ) : (
              executions.map((exec, i) => {
                const s = STATUS_STYLE[exec.status] ?? { bg: 'transparent', color: 'var(--dash-muted)' };
                return (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      borderBottom: i < executions.length - 1 ? '1px solid var(--dash-border)' : 'none',
                      background: i % 2 === 0 ? 'var(--dash-card)' : 'transparent',
                    }}
                  >
                    <span
                      className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {exec.status}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
                      {exec.startedAt ? relativeTime(exec.startedAt) : '—'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
