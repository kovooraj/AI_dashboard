'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PeriodTabs } from '@/components/PeriodTabs';
import { ProgressMetric } from '@/components/ProgressMetric';
import { BenchKPICard } from '@/components/BenchKPICard';
import type { DashboardPeriod, FINSnapshot, ClickUpTask } from '@/lib/types';
import { buildVolumeChartData, formatCurrency, formatHours } from '@/lib/chartUtils';
import type { VolumePoint } from '@/lib/types';

const VolumeChart = dynamic(
  () => import('@/components/charts/VolumeChart').then((m) => m.VolumeChart),
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

const STATUS_COLORS: Record<string, string> = {
  complete: '#3dba62',
  'in progress': '#d4912a',
  'on hold': '#e05858',
  'to do': '#6a8870',
};

export function FINPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('weekly');
  const [snapshots, setSnapshots] = useState<FINSnapshot[]>([]);
  const [projects, setProjects] = useState<ClickUpTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/notion/fin?period=${period}`).then((r) => r.json()),
      fetch('/api/clickup/projects').then((r) => r.json()),
    ]).then(([finData, cuData]) => {
      setSnapshots(finData.snapshots ?? []);
      setProjects(cuData.tasks ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [period]);

  const latest = snapshots[0];
  const chartData: VolumePoint[] = buildVolumeChartData(
    snapshots.map((s) => ({
      total: s.finInvolvement,
      resolved: s.finResolved,
      weekLabel: s.weekLabel,
    }))
  );

  const resolutionRate = latest?.finAutomationRate ?? 28;

  // Filter FIN-related projects
  const finProjects = projects.filter(
    (p) => p.name.toLowerCase().includes('fin') || p.name.toLowerCase().includes('chat') || p.name.toLowerCase().includes('resolution')
  );
  const displayProjects = finProjects.length > 0 ? finProjects : projects.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Period tabs */}
      <div style={{ padding: '0 24px', flexShrink: 0, paddingTop: 16 }}>
        <PeriodTabs active={period} onChange={setPeriod} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="custom-scroll">
        {/* Section 1 */}
        <SectionHeader eyebrow="1. OVERALL PERFORMANCE" title="FIN Performance Overview" />

        {/* Progress */}
        <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <ProgressMetric
            label="OVERALL RESOLUTION RATE"
            value={loading ? 28 : resolutionRate}
          />
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <BenchKPICard
            label="Conversations"
            value={loading ? '—' : (latest?.finInvolvement ?? 1589).toLocaleString()}
            showInfo
          />
          <BenchKPICard
            label="Estimated Hours Saved"
            value={loading ? '—' : formatHours(latest?.hoursSaved ?? 74)}
            showInfo
          />
          <BenchKPICard
            label="Estimated Revenue Impact"
            value={loading ? '—' : formatCurrency(latest?.revenueImpact ?? 370)}
            showInfo
          />
          <BenchKPICard
            label="CSAT Score"
            value={loading ? '—' : `${latest?.csat ?? 78.1}%`}
            showInfo
          />
        </div>

        {/* Area chart */}
        <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6a8870', marginBottom: 12 }}>
            Volume of Resolved vs Overall Volume
          </p>
          <VolumeChart data={chartData} />
        </div>

        {/* Section 2 */}
        <SectionHeader eyebrow="2. KEY METRICS" title="Information" />
        <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e4ede6', marginBottom: 8 }}>Key Improvement Areas</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Increase FIN resolution rate from 28% toward 40%+ target through enhanced knowledge base curation.',
              'Reduce escalation rate by improving FIN\'s handling of common billing and account queries.',
              'Improve CSAT from 78.1% by reducing response latency on high-volume topic clusters.',
              'Expand FIN coverage to handle new product category queries arriving via live chat.',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: '#6a8870', lineHeight: 1.5 }}>
                <span style={{ color: '#3dba62', flexShrink: 0, marginTop: 2 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3 */}
        <SectionHeader eyebrow="3. AUTOMATIONS" title="Fin Related Projects" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(loading ? [] : displayProjects).map((project) => {
            const statusColor = STATUS_COLORS[project.status] ?? '#6a8870';
            return (
              <div
                key={project.id}
                style={{
                  background: '#0d1810',
                  border: '1px solid #1a2c1d',
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e4ede6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.name}
                  </p>
                  {project.assignees.length > 0 && (
                    <p style={{ fontSize: '0.65rem', color: '#6a8870', marginTop: 2 }}>
                      {project.assignees.join(', ')}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: `${statusColor}18`,
                      border: `1px solid ${statusColor}`,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: statusColor,
                    }}
                  >
                    {project.status}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#6a8870' }}>
                    Updated {new Date(project.updatedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: '#6a8870' }}>Loading projects...</p>
            </div>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
