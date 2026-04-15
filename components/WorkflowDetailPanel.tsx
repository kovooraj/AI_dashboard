'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCountUp } from '@/hooks/useCountUp';
import type { WorkflowHealthData, HistoryData, HistoryPeriod, HealthStatus } from '@/lib/types';

const ExecutionChart = dynamic(
  () => import('./ExecutionChart').then((m) => m.ExecutionChart),
  { ssr: false, loading: () => <div style={{ height: 200 }} /> }
);

const PERIODS: { key: HistoryPeriod; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

const HC: Record<HealthStatus, string> = {
  healthy:  'var(--dash-green)',
  degraded: 'var(--dash-yellow)',
  failing:  'var(--dash-red)',
  unknown:  'var(--dash-muted)',
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  success: { bg: 'rgba(74,222,128,0.1)',  color: 'var(--dash-green)'  },
  error:   { bg: 'rgba(255,92,92,0.1)',   color: 'var(--dash-red)'    },
  crashed: { bg: 'rgba(255,92,92,0.1)',   color: 'var(--dash-red)'    },
  running: { bg: 'rgba(74,158,255,0.1)',  color: 'var(--dash-blue)'   },
  waiting: { bg: 'rgba(251,191,36,0.1)',  color: 'var(--dash-yellow)' },
};

function rel(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const s = Math.floor(d / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function BigStat({ value, label, color, delay = 0 }: { value: number; label: string; color?: string; delay?: number }) {
  const count = useCountUp(value, 1000, delay);
  return (
    <div
      className="flex flex-col justify-between px-6 py-6 animate-fade-in-up"
      style={{ borderRight: '1px solid var(--dash-border)', animationDelay: `${delay}ms` }}
    >
      <p
        className="display-number"
        style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: color ?? 'var(--dash-text)' }}
      >
        {count}
      </p>
      <p className="mt-2 text-xs font-medium" style={{ color: 'var(--dash-muted)' }}>{label}</p>
    </div>
  );
}

export function WorkflowDetailPanel({ workflowData, onBack }: { workflowData: WorkflowHealthData; onBack: () => void }) {
  const { workflow, executions, health, successRate, lastRunAt, failureCount, runningCount } = workflowData;
  const [period, setPeriod] = useState<HistoryPeriod>('week');
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const hc = HC[health];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/history?period=${period}&workflowId=${workflow.id}`)
      .then(r => r.json())
      .then((d: HistoryData) => { if (!cancelled) { setHistory(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, workflow.id]);

  const successCount = useCountUp(executions.filter(e => e.status === 'success').length, 800, 200);
  const periodRuns = history?.totalRuns ?? 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scroll">

      {/* Header */}
      <div className="px-8 pt-7 pb-5 animate-fade-in-up" style={{ borderBottom: '1px solid var(--dash-border)' }}>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs transition-all duration-150 hover:opacity-100"
          style={{ color: 'var(--dash-muted)', opacity: 0.6 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          All Workflows
        </button>

        <div className="flex items-start gap-3">
          <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: hc }} />
          <div>
            <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--dash-text)', lineHeight: 1.2 }}>
              {workflow.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
                style={{ background: `${hc}18`, color: hc, fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                {health}
              </span>
              <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
                {workflow.active ? '● Active' : '○ Inactive'}
              </span>
              {runningCount > 0 && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--dash-blue)' }}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--dash-blue)' }} />
                  {runningCount} running
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-7">
        {/* KPI row */}
        <div className="rounded-xl overflow-hidden animate-scale-in delay-100"
          style={{ border: '1px solid var(--dash-border)', background: 'var(--dash-card)' }}>
          <div className="grid grid-cols-4">
            {/* Success rate cell — no count-up hook needed, use static */}
            <div className="flex flex-col justify-between px-6 py-6 animate-fade-in-up"
              style={{ borderRight: '1px solid var(--dash-border)' }}>
              <div />
              <p className="display-number"
                style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: hc }}>
                {successRate !== null ? `${successRate}%` : '—'}
              </p>
              <p className="mt-2 text-xs font-medium" style={{ color: 'var(--dash-muted)' }}>Success Rate</p>
            </div>
            <BigStat value={successCount} label="Successes" color="var(--dash-green)" delay={120} />
            <BigStat value={failureCount} label="Failures" color={failureCount > 0 ? 'var(--dash-red)' : 'var(--dash-muted)'} delay={180} />
            <div className="flex flex-col justify-between px-6 py-6 animate-fade-in-up delay-250">
              <div />
              <p className="display-number" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: 'var(--dash-text)' }}>
                {lastRunAt ? rel(lastRunAt) : '—'}
              </p>
              <p className="mt-2 text-xs font-medium" style={{ color: 'var(--dash-muted)' }}>Last Run</p>
            </div>
          </div>
        </div>

        {/* Chart section */}
        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center gap-0 mb-5" style={{ borderBottom: '1px solid var(--dash-border)' }}>
            {PERIODS.map(({ key, label }) => (
              <button key={key} onClick={() => setPeriod(key)}
                className="px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150"
                style={{
                  color: period === key ? 'var(--dash-text)' : 'var(--dash-muted)',
                  borderBottom: period === key ? '2px solid var(--dash-blue)' : '2px solid transparent',
                  marginBottom: '-1px', background: 'transparent', letterSpacing: '0.04em',
                }}>
                {label}
              </button>
            ))}
            <span className="ml-auto pb-2 text-xs tabular-nums" style={{ color: 'var(--dash-muted)' }}>
              {loading ? '…' : `${periodRuns} runs`}
            </span>
          </div>

          <div style={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
            {history?.buckets
              ? <ExecutionChart buckets={history.buckets} height={200} />
              : <div style={{ height: 200 }} />}
          </div>
        </div>

        {/* Executions table */}
        <div className="animate-fade-in-up delay-300">
          <p className="section-eyebrow mb-4">Recent Executions</p>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--dash-border)' }}>
            {executions.length === 0 ? (
              <p className="px-6 py-8 text-center text-xs" style={{ color: 'var(--dash-muted)' }}>No executions found</p>
            ) : (
              executions.map((exec, i) => {
                const s = STATUS_STYLE[exec.status] ?? { bg: 'transparent', color: 'var(--dash-muted)' };
                return (
                  <div key={exec.id}
                    className="flex items-center justify-between px-5 py-3 transition-colors duration-150"
                    style={{
                      borderBottom: i < executions.length - 1 ? '1px solid var(--dash-border)' : 'none',
                      background: i % 2 === 0 ? 'var(--dash-card)' : 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--dash-muted)18'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = i % 2 === 0 ? 'var(--dash-card)' : 'transparent'}
                  >
                    <span className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
                      style={{ background: s.bg, color: s.color, fontSize: '0.65rem', letterSpacing: '0.08em' }}>
                      {exec.status}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--dash-muted)' }}>
                      {exec.startedAt ? rel(exec.startedAt) : '—'}
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
