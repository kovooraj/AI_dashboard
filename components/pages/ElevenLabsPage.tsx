'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PeriodTabs } from '@/components/PeriodTabs';
import { ProgressMetric } from '@/components/ProgressMetric';
import { BenchKPICard } from '@/components/BenchKPICard';
import type { DashboardPeriod, ElevenLabsSnapshot, ClickUpTask } from '@/lib/types';
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

export function ElevenLabsPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('weekly');
  const [snapshots, setSnapshots] = useState<ElevenLabsSnapshot[]>([]);
  const [projects, setProjects] = useState<ClickUpTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/notion/elevenlabs?period=${period}`).then((r) => r.json()),
      fetch('/api/clickup/projects').then((r) => r.json()),
    ]).then(([elData, cuData]) => {
      setSnapshots(elData.snapshots ?? []);
      setProjects(cuData.tasks ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [period]);

  const latest = snapshots[0];
  const deflectionRate = latest ? Math.round(100 - latest.transferRate) : 50.7;

  const chartData: VolumePoint[] = buildVolumeChartData(
    snapshots.map((s) => ({
      total: s.calls,
      resolved: Math.round(s.calls * (1 - s.transferRate / 100)),
      weekLabel: s.weekLabel,
    }))
  );

  // Filter call-related projects
  const callProjects = projects.filter(
    (p) => p.name.toLowerCase().includes('eleven') || p.name.toLowerCase().includes('call') || p.name.toLowerCase().includes('voice')
  );
  const displayProjects = callProjects.length > 0 ? callProjects : projects.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Period tabs */}
      <div style={{ padding: '0 24px', flexShrink: 0, paddingTop: 16 }}>
        <PeriodTabs active={period} onChange={setPeriod} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="custom-scroll">
        {/* Section 1 */}
        <SectionHeader eyebrow="1. OVERALL PERFORMANCE" title="Call Performance Overview" />

        {/* Progress */}
        <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <ProgressMetric
            label="OVERALL DEFLECTION"
            value={loading ? 50.7 : deflectionRate}
          />
        </div>

        {/* KPI cards — 5 cards for ElevenLabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          <BenchKPICard
            label="Total # of Calls"
            value={loading ? '—' : (latest?.calls ?? 1140).toLocaleString()}
            showInfo
          />
          <BenchKPICard
            label="Transferred to Live Agent"
            value={loading ? '—' : `${latest?.transferRate ?? 49.3}%`}
            showInfo
          />
          <BenchKPICard
            label="Estimated Hours Saved"
            value={loading ? '—' : formatHours(latest?.hoursSaved ?? 95)}
            showInfo
          />
          <BenchKPICard
            label="Estimated Revenue Impact"
            value={loading ? '—' : formatCurrency(latest?.revenueImpact ?? 475)}
            showInfo
          />
          <BenchKPICard
            label="CSAT Score"
            value="N/A"
            showInfo
          />
        </div>

        {/* Area chart */}
        <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6a8870', marginBottom: 12 }}>
            Calls Deflected vs Overall Call Volume
          </p>
          <VolumeChart data={chartData} />
        </div>

        {/* Section 2 */}
        <SectionHeader eyebrow="2. KEY METRICS" title="Information" />
        <div style={{ background: '#0d1810', border: '1px solid #1a2c1d', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e4ede6', marginBottom: 8 }}>Key Improvement Areas</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              `Improve deflection rate beyond ${deflectionRate.toFixed(1)}% by training agents on top transfer reasons.`,
              'Reduce average call duration from 39s through better intent detection in the first turn.',
              'Expand agent coverage to handle after-hours inbound call volume currently going unanswered.',
              'Implement post-call CSAT collection to generate actionable satisfaction data.',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: '#6a8870', lineHeight: 1.5 }}>
                <span style={{ color: '#3dba62', flexShrink: 0, marginTop: 2 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3 */}
        <SectionHeader eyebrow="3. AUTOMATIONS" title="Call Related Projects" />
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
