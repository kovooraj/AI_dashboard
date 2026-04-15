'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { KPICard } from './KPICard';
import type { DashboardData, HistoryData, HistoryPeriod, WorkflowHealthData, HealthStatus } from '@/lib/types';

const ExecutionChart = dynamic(
  () => import('./ExecutionChart').then((m) => m.ExecutionChart),
  { ssr: false, loading: () => <div style={{ height: 220 }} /> }
);

const PERIODS: { key: HistoryPeriod; label: string }[] = [
  { key: 'week',    label: 'Week' },
  { key: 'month',   label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year',    label: 'Year' },
];

const ROI_MIN_PER_RUN = 5;
const ROI_HOURLY_RATE = 50;

const HEALTH_COLOR: Record<HealthStatus, string> = {
  healthy:  'var(--dash-green)',
  degraded: 'var(--dash-yellow)',
  failing:  'var(--dash-red)',
  unknown:  'var(--dash-muted)',
};

/* ── SVG icons ────────────────────────────────────────── */
const ChartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <polyline points="1,11 4,7 7,9 10,4 13,6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.4"/>
    <polyline points="7.5,4 7.5,7.5 10,9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const DollarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 1v13M10.5 4.5c0-1-1.5-2-3-2s-3 .8-3 2.5 1.5 2.5 3 2.5 3 1 3 2.5-1.2 2.5-3 2.5-3-1-3-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
    <rect x="9" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
    <rect x="1" y="9" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
    <rect x="9" y="9" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);

/* ── Automation mini-card ─────────────────────────────── */
function AutomationRow({ data, index }: { data: WorkflowHealthData; index: number }) {
  const hc = HEALTH_COLOR[data.health];
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 animate-fade-in-up cursor-default group"
      style={{
        background: 'var(--dash-card)',
        border: '1px solid var(--dash-border)',
        animationDelay: `${300 + index * 40}ms`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--dash-subtle)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--dash-border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: hc }} />
        <span className="truncate text-xs font-medium" style={{ color: 'var(--dash-text)', maxWidth: 220 }}>
          {data.workflow.name}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <span className="text-xs font-semibold tabular-nums" style={{ color: hc }}>
          {data.successRate !== null ? `${data.successRate}%` : '—'}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider"
          style={{ fontSize: '0.6rem', background: `${hc}18`, color: hc }}
        >
          {data.health}
        </span>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export function OverviewPanel({ dashboardData }: { dashboardData: DashboardData }) {
  const [period, setPeriod] = useState<HistoryPeriod>('week');
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/history?period=${period}`)
      .then(r => r.json())
      .then((d: HistoryData) => { if (!cancelled) { setHistory(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  const totalRuns   = history?.totalRuns ?? 0;
  const hoursSaved  = Math.round((totalRuns * ROI_MIN_PER_RUN) / 60);
  const dollarsSaved = hoursSaved * ROI_HOURLY_RATE;
  const activeCount = dashboardData.workflows.length;
  const failingCount = dashboardData.workflows.filter(w => w.health === 'failing').length;

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scroll">

      {/* ── Section 01 header ──────────────────────── */}
      <div className="px-8 pt-8 pb-0 animate-fade-in-up">
        <p className="section-eyebrow mb-2">01 — Key Metrics</p>
        <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--dash-text)', lineHeight: 1.2 }}>
          Performance Overview
        </h2>
      </div>

      {/* ── KPI row ────────────────────────────────── */}
      <div
        className="mx-8 mt-6 rounded-xl overflow-hidden animate-scale-in delay-100"
        style={{ border: '1px solid var(--dash-border)', background: 'var(--dash-card)' }}
      >
        <div className="grid grid-cols-4">
          <KPICard
            numericValue={loading ? 0 : totalRuns}
            label="Total Runs"
            sublabel={`This ${period}`}
            icon={<ChartIcon />}
            animationDelay={120}
          />
          <KPICard
            numericValue={loading ? 0 : hoursSaved}
            suffix="h"
            label="Hours Saved"
            sublabel="@ 5 min / run"
            icon={<ClockIcon />}
            color="var(--dash-green)"
            animationDelay={180}
          />
          <KPICard
            numericValue={loading ? 0 : dollarsSaved}
            prefix="$"
            label="Est. Value"
            sublabel={`@ $${ROI_HOURLY_RATE} / hr`}
            icon={<DollarIcon />}
            color="var(--dash-blue)"
            animationDelay={240}
          />
          <KPICard
            numericValue={activeCount}
            label="Active Workflows"
            sublabel={failingCount > 0 ? `${failingCount} failing` : 'all healthy'}
            icon={<GridIcon />}
            color={failingCount > 0 ? 'var(--dash-red)' : 'var(--dash-text)'}
            isLast
            animationDelay={300}
          />
        </div>
      </div>

      {/* ── Period tabs + chart ─────────────────────── */}
      <div className="px-8 mt-8 animate-fade-in-up delay-200">
        {/* Tabs */}
        <div className="flex items-center gap-0 mb-5" style={{ borderBottom: '1px solid var(--dash-border)' }}>
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className="px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150"
              style={{
                color: period === key ? 'var(--dash-text)' : 'var(--dash-muted)',
                borderBottom: period === key ? '2px solid var(--dash-blue)' : '2px solid transparent',
                marginBottom: '-1px',
                background: 'transparent',
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </button>
          ))}
          {/* Legend */}
          <div className="ml-auto flex items-center gap-4 pb-2">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--dash-muted)' }}>
              <span className="h-1.5 w-3 rounded-full" style={{ background: 'var(--dash-green)' }} />
              Success
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--dash-muted)' }}>
              <span className="h-1.5 w-3 rounded-full" style={{ background: 'var(--dash-red)' }} />
              Errors
            </span>
          </div>
        </div>

        {/* Chart */}
        <div
          className="animate-fade-in delay-300"
          style={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s ease' }}
        >
          {history?.buckets
            ? <ExecutionChart buckets={history.buckets} height={220} />
            : <div style={{ height: 220 }} />
          }
        </div>
      </div>

      {/* ── Section 02 automations ─────────────────── */}
      <div className="px-8 mt-8 pb-8">
        <div className="flex items-end justify-between mb-4 animate-fade-in-up delay-250">
          <div>
            <p className="section-eyebrow mb-1">02 — Automations</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--dash-text)' }}>
              Active Workflows
            </h3>
          </div>
          <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
            {activeCount} active
          </span>
        </div>

        {dashboardData.workflows.length === 0 ? (
          <div className="rounded-xl px-6 py-10 text-center" style={{ border: '1px solid var(--dash-border)' }}>
            <p className="text-sm" style={{ color: 'var(--dash-muted)' }}>No active workflows</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
            {dashboardData.workflows.map((wf, i) => (
              <AutomationRow key={wf.workflow.id} data={wf} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
