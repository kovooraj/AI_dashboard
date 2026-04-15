'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { KPICard } from './KPICard';
import type { DashboardData, HistoryData, HistoryPeriod, WorkflowHealthData, HealthStatus } from '@/lib/types';

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

const ROI_MIN_PER_RUN = 5;
const ROI_HOURLY_RATE = 50;

function calcROI(runs: number) {
  const hours = (runs * ROI_MIN_PER_RUN) / 60;
  const dollars = hours * ROI_HOURLY_RATE;
  return { hours, dollars };
}

function fmt(n: number, type: 'hours' | 'dollars' | 'number'): string {
  if (type === 'hours') {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k h`;
    return `${n.toFixed(0)}h`;
  }
  if (type === 'dollars') {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
    return `$${n.toFixed(0)}`;
  }
  return n.toLocaleString();
}

const HEALTH_COLOR: Record<HealthStatus, string> = {
  healthy:  'var(--dash-green)',
  degraded: 'var(--dash-yellow)',
  failing:  'var(--dash-red)',
  unknown:  'var(--dash-muted)',
};

function MiniWorkflowCard({ data }: { data: WorkflowHealthData }) {
  const successRate = data.successRate;
  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-1.5"
      style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)' }}
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
          style={{ background: HEALTH_COLOR[data.health] }}
        />
        <p
          className="text-xs font-medium leading-tight line-clamp-2"
          style={{ color: 'var(--dash-text)' }}
        >
          {data.workflow.name}
        </p>
      </div>
      <div className="flex items-center justify-between pl-4">
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color: HEALTH_COLOR[data.health] }}
        >
          {successRate !== null ? `${successRate}%` : '—'}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
          style={{
            fontSize: '0.6rem',
            background: `${HEALTH_COLOR[data.health]}18`,
            color: HEALTH_COLOR[data.health],
          }}
        >
          {data.health}
        </span>
      </div>
      {data.failureCount > 0 && (
        <p className="pl-4 text-xs" style={{ color: 'var(--dash-red)', fontSize: '0.6875rem' }}>
          {data.failureCount} failure{data.failureCount > 1 ? 's' : ''} recent
        </p>
      )}
    </div>
  );
}

interface Props {
  dashboardData: DashboardData;
}

export function OverviewPanel({ dashboardData }: Props) {
  const [period, setPeriod] = useState<HistoryPeriod>('week');
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/history?period=${period}`)
      .then((r) => r.json())
      .then((data: HistoryData) => { if (!cancelled) { setHistory(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [period]);

  const totalRuns = history?.totalRuns ?? 0;
  const { hours, dollars } = calcROI(totalRuns);
  const successPct = totalRuns > 0 && history
    ? Math.round((history.successRuns / totalRuns) * 100)
    : null;

  const activeCount = dashboardData.workflows.length;
  const failingCount = dashboardData.workflows.filter(w => w.health === 'failing').length;

  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto custom-scroll">
      <div className="px-6 pt-6 pb-4">
        {/* Section 01 */}
        <p className="section-label mb-1">01 — Key Metrics</p>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--dash-text)' }}>
          Performance Overview
        </h2>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
          <KPICard
            value={loading ? '…' : fmt(totalRuns, 'number')}
            label="Total Runs"
            sublabel={`This ${period}`}
            color="var(--dash-text)"
          />
          <KPICard
            value={loading ? '…' : fmt(hours, 'hours')}
            label="Hours Saved"
            sublabel={`@ 5 min/run`}
            color="var(--dash-green)"
          />
          <KPICard
            value={loading ? '…' : fmt(dollars, 'dollars')}
            label="Est. Value"
            sublabel={`@ $${ROI_HOURLY_RATE}/hr`}
            color="var(--dash-blue)"
          />
          <KPICard
            value={String(activeCount)}
            label="Active"
            sublabel={failingCount > 0 ? `${failingCount} failing` : 'all running'}
            color={failingCount > 0 ? 'var(--dash-red)' : 'var(--dash-text)'}
          />
        </div>

        {/* Success rate bar */}
        {successPct !== null && !loading && (
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--dash-muted)' }}>
              <span>Overall success rate</span>
              <span className="font-bold" style={{ color: successPct >= 80 ? 'var(--dash-green)' : successPct >= 50 ? 'var(--dash-yellow)' : 'var(--dash-red)' }}>
                {successPct}%
              </span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'var(--dash-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${successPct}%`,
                  background: successPct >= 80 ? 'var(--dash-green)' : successPct >= 50 ? 'var(--dash-yellow)' : 'var(--dash-red)',
                }}
              />
            </div>
          </div>
        )}

        {/* Period tabs */}
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
      </div>

      {/* Chart */}
      <div className="px-6 pb-2" style={{ opacity: loading ? 0.4 : 1, transition: 'opacity 0.25s' }}>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--dash-green)' }} />
            <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>Success</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--dash-red)' }} />
            <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>Errors</span>
          </div>
        </div>
        {history?.buckets ? (
          <ExecutionChart buckets={history.buckets} height={200} />
        ) : (
          <div style={{ height: 200 }} />
        )}
      </div>

      {/* Section 02 — Automations grid */}
      <div className="px-6 pb-6 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">02 — Automations</p>
          <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
            {activeCount} active
          </span>
        </div>
        <div className="grid gap-2 grid-cols-2 xl:grid-cols-3">
          {dashboardData.workflows.map((wf) => (
            <MiniWorkflowCard key={wf.workflow.id} data={wf} />
          ))}
        </div>

        {dashboardData.workflows.length === 0 && (
          <div
            className="rounded-lg px-4 py-8 text-center"
            style={{ border: '1px solid var(--dash-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--dash-muted)' }}>
              No active workflows found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
