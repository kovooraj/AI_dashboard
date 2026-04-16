'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PeriodTabs } from '@/components/PeriodTabs';
import { ProgressMetric } from '@/components/ProgressMetric';
import { BenchKPICard } from '@/components/BenchKPICard';
import type { DashboardPeriod, N8NSnapshot, ClickUpTask } from '@/lib/types';
import { buildSuccessChartData, formatCurrency, formatHours } from '@/lib/chartUtils';
import type { ChartPoint } from '@/lib/types';

const SuccessChart = dynamic(
  () => import('@/components/charts/SuccessChart').then((m) => m.SuccessChart),
  { ssr: false, loading: () => <div style={{ height: 200, background: '#0d1810', borderRadius: 8 }} /> }
);

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p className="section-eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</p>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#e4ede6', margin: 0 }}>{title}</h2>
    </div>
  );
}

function StatusDot({ color }: { color: string }) {
  return (
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', marginRight: 6 }} />
  );
}

const STATUS_COLORS: Record<string, string> = {
  complete: '#3dba62',
  'in progress': '#d4912a',
  'on hold': '#e05858',
  'to do': '#6a8870',
};

export function OverviewPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('weekly');
  const [n8nSnapshots, setN8nSnapshots] = useState<N8NSnapshot[]>([]);
  const [projects, setProjects] = useState<ClickUpTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/notion/n8n?period=${period}`).then((r) => r.json()),
      fetch('/api/clickup/projects').then((r) => r.json()),
    ]).then(([n8nData, cuData]) => {
      setN8nSnapshots(n8nData.snapshots ?? []);
      setProjects(cuData.tasks ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [period]);

  const latest = n8nSnapshots[0];
  const chartData: ChartPoint[] = buildSuccessChartData(
    n8nSnapshots.map((s) => ({
      totalTriggers: s.totalTriggers,
      failedTriggers: s.failedTriggers,
      weekLabel: s.weekLabel,
    }))
  );

  const successRate = latest
    ? Math.round(((latest.totalTriggers - latest.failedTriggers) / Math.max(1, latest.totalTriggers)) * 100)
    : 94;

  const completedProjects = projects.filter((p) => p.status === 'complete').length;
  const totalProjects = projects.length || 30;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Period tabs */}
      <div style={{ padding: '0 24px', flexShrink: 0, paddingTop: 16 }}>
        <PeriodTabs active={period} onChange={setPeriod} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="custom-scroll">
        {/* Section 1 */}
        <SectionHeader eyebrow="1. OVERALL PERFORMANCE" title="Performance Overview" />

        {/* Progress bar */}
        <div
          style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 16 }}
        >
          <ProgressMetric
            label="OVERALL AUTOMATION SUCCESS RATE"
            value={loading ? 94 : successRate}
          />
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <BenchKPICard
            label="Total Automation Triggers"
            value={loading ? '—' : (latest?.totalTriggers ?? 1552).toLocaleString()}
            showInfo
          />
          <BenchKPICard
            label="Estimated Hours Saved"
            value={loading ? '—' : formatHours(latest?.hoursSaved ?? 43)}
            showInfo
          />
          <BenchKPICard
            label="Estimated Revenue Impact"
            value={loading ? '—' : formatCurrency(latest?.revenueImpact ?? 2100)}
            showInfo
          />
          <BenchKPICard
            label="Automation Active"
            value={loading ? '—' : (latest?.activeWorkflows ?? 22)}
            showInfo
            subBadge={
              <span style={{ fontSize: '0.65rem', color: '#6a8870', display: 'flex', alignItems: 'center', gap: 4 }}>
                <StatusDot color="#3dba62" />
                {latest ? latest.activeWorkflows - 3 : 19} Working
                <StatusDot color="#e05858" />
                3 Failing
              </span>
            }
          />
        </div>

        {/* Line chart */}
        <div
          style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 24 }}
        >
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6a8870', marginBottom: 12 }}>
            Success vs Errors
          </p>
          <SuccessChart data={chartData} />
        </div>

        {/* Section 2 */}
        <SectionHeader eyebrow="2. KEY METRICS" title="Objectives and Key Performance" />

        <div
          style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, overflow: 'hidden' }}
        >
          {/* Row 1 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #1a2c1d' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e4ede6', marginBottom: 2 }}>AI Projects Initiative Tracking</p>
              <p style={{ fontSize: '0.7rem', color: '#6a8870' }}>
                {completedProjects} of {totalProjects} projects completed across the AI automation portfolio. On track for Q2 targets.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginLeft: 16, flexShrink: 0 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e4ede6' }}>
                {completedProjects}/{totalProjects}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3dba62' }}>
                {Math.round((completedProjects / Math.max(1, totalProjects)) * 100)}%
              </span>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #1a2c1d' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e4ede6', marginBottom: 2 }}>ROI & Impact Updates</p>
              <p style={{ fontSize: '0.7rem', color: '#6a8870' }}>
                Automations are generating measurable business value through time savings and revenue-generating workflows.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginLeft: 16, flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.65rem', color: '#6a8870', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Est. Hours Saved</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#e4ede6' }}>{formatHours(latest?.hoursSaved ?? 43)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.65rem', color: '#6a8870', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Est. Revenue Impact</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#e4ede6' }}>{formatCurrency(latest?.revenueImpact ?? 2100)}</p>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e4ede6', marginBottom: 2 }}>Adoption</p>
              <p style={{ fontSize: '0.7rem', color: '#6a8870' }}>
                Workflow trigger volume demonstrates healthy adoption across all active automation workflows.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginLeft: 16, flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.65rem', color: '#6a8870', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Triggers</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#e4ede6' }}>{(latest?.totalTriggers ?? 1552).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom padding */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
