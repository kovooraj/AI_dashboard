'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PeriodTabs } from '@/components/PeriodTabs';
import { ProgressMetric } from '@/components/ProgressMetric';
import { BenchKPICard } from '@/components/BenchKPICard';
import { AutomationWorkflowSidebar } from '@/components/AutomationWorkflowSidebar';
import type { DashboardPeriod, N8NSnapshot, SidebarWorkflow } from '@/lib/types';
import { buildSuccessChartData, formatCurrency, formatHours } from '@/lib/chartUtils';
import type { ChartPoint } from '@/lib/types';

const SuccessChart = dynamic(
  () => import('@/components/charts/SuccessChart').then((m) => m.SuccessChart),
  { ssr: false, loading: () => <div style={{ height: 200, background: '#0d1810', borderRadius: 8 }} /> }
);

const MOCK_SIDEBAR_WORKFLOWS: SidebarWorkflow[] = [
  { id: '1', name: 'PowerBI Report - Insert Data Into Sup...', health: 'failing' },
  { id: '2', name: 'Claude send Emails', health: 'failing' },
  { id: '3', name: "Update Alex's Notion", health: 'degraded' },
  { id: '4', name: 'Salesforce - OLP - Willowpack Quote Upda...', health: 'healthy' },
  { id: '5', name: 'PowerBI Report - Insert Data Into Sup...', health: 'healthy' },
  { id: '6', name: 'PowerBI Report - Insert Data Into Sup...', health: 'healthy' },
];

const MOCK_FAILURES = [
  { id: 'f1', name: 'PowerBI Report - Insert Data Into SuperMetrics', failingPercent: 40, failedAgo: '4H ago' },
  { id: 'f2', name: 'Claude send Emails', failingPercent: 60, failedAgo: '2H ago' },
  { id: 'f3', name: "Update Alex's Notion (Degraded)", failingPercent: 25, failedAgo: '6H ago' },
  { id: 'f4', name: 'Email Sync Workflow', failingPercent: 50, failedAgo: '1H ago' },
];

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p className="section-eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</p>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#e4ede6', margin: 0 }}>{title}</h2>
    </div>
  );
}

interface N8NPageProps {
  /** Pass workflows from outside if available (e.g. from n8n API), else uses mock */
  sidebarWorkflows?: SidebarWorkflow[];
}

export function N8NPage({ sidebarWorkflows }: N8NPageProps) {
  const [period, setPeriod] = useState<DashboardPeriod>('weekly');
  const [snapshots, setSnapshots] = useState<N8NSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>('1');

  const workflows = sidebarWorkflows ?? MOCK_SIDEBAR_WORKFLOWS;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/notion/n8n?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setSnapshots(data.snapshots ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const latest = snapshots[0];
  const chartData: ChartPoint[] = buildSuccessChartData(
    snapshots.map((s) => ({
      totalTriggers: s.totalTriggers,
      failedTriggers: s.failedTriggers,
      weekLabel: s.weekLabel,
    }))
  );

  const successRate = latest
    ? Math.round(((latest.totalTriggers - latest.failedTriggers) / Math.max(1, latest.totalTriggers)) * 100)
    : 94;

  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId);
  const healthBadgeColor =
    selectedWorkflow?.health === 'healthy' ? '#3dba62'
    : selectedWorkflow?.health === 'failing' ? '#e05858'
    : '#d4912a';

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Period tabs */}
        <div style={{ padding: '0 24px', flexShrink: 0, paddingTop: 16 }}>
          <PeriodTabs active={period} onChange={setPeriod} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="custom-scroll">
          {/* Workflow selection header */}
          {selectedWorkflow && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e4ede6', margin: 0 }}>
                Automation: {selectedWorkflow.name}
              </h1>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: `${healthBadgeColor}20`,
                  border: `1px solid ${healthBadgeColor}`,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: healthBadgeColor,
                }}
              >
                {selectedWorkflow.health}
              </span>
            </div>
          )}

          {/* Section 1 */}
          <SectionHeader eyebrow="1. OVERALL PERFORMANCE" title="N8N Performance Overview" />

          {/* Progress */}
          <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
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
                <span style={{ fontSize: '0.65rem', color: '#6a8870' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3dba62', display: 'inline-block', marginRight: 4 }} />
                  {latest ? latest.activeWorkflows - 3 : 19} Working
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e05858', display: 'inline-block', marginLeft: 8, marginRight: 4 }} />
                  3 Failing
                </span>
              }
            />
          </div>

          {/* Chart */}
          <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6a8870', marginBottom: 12 }}>
              Success vs Errors
            </p>
            <SuccessChart data={chartData} />
          </div>

          {/* Section 2: Automations */}
          <SectionHeader eyebrow="2. AUTOMATIONS" title="Recent Automation Failure" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            {MOCK_FAILURES.map((failure) => (
              <div
                key={failure.id}
                style={{
                  background: '#0d1810',
                  border: '1px solid #1a2c1d',
                  borderLeft: '3px solid #e05858',
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#e4ede6',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 6,
                    }}
                  >
                    {failure.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e05858', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.65rem', color: '#6a8870' }}>Failed {failure.failedAgo}</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#e05858',
                    flexShrink: 0,
                  }}
                >
                  {failure.failingPercent}% Failing
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: 24 }} />
        </div>
      </div>

      {/* Right sidebar */}
      <AutomationWorkflowSidebar
        workflows={workflows}
        selectedId={selectedWorkflowId}
        onSelect={setSelectedWorkflowId}
      />
    </div>
  );
}
