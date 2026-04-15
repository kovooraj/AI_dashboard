'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { DailyBucket } from '@/lib/types';

interface Props {
  buckets: DailyBucket[];
  height?: number;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{
        background: '#1a1d26',
        border: '1px solid var(--dash-border)',
        color: 'var(--dash-text)',
        minWidth: 120,
      }}
    >
      <p className="mb-1.5 font-semibold" style={{ color: 'var(--dash-muted)' }}>
        {label ? formatDateLabel(label) : ''}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold tabular-nums">{p.value}</span>
        </div>
      ))}
      <div
        className="mt-1.5 flex items-center justify-between gap-4 border-t pt-1"
        style={{ borderColor: 'var(--dash-border)' }}
      >
        <span style={{ color: 'var(--dash-muted)' }}>Total</span>
        <span className="font-bold tabular-nums">{total}</span>
      </div>
    </div>
  );
}

export function ExecutionChart({ buckets, height = 180 }: Props) {
  const data = buckets.map((b) => ({
    date: b.date,
    Success: b.success,
    Errors: b.error,
  }));

  const maxVal = Math.max(...buckets.map((b) => b.total), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#68d391" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#68d391" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradError" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fc8181" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#fc8181" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          tick={{ fill: '#718096', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#718096', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          domain={[0, maxVal + Math.ceil(maxVal * 0.15)]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2d3748', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="Errors"
          stroke="#fc8181"
          strokeWidth={1.5}
          fill="url(#gradError)"
          stackId="1"
          dot={false}
          activeDot={{ r: 4, fill: '#fc8181', stroke: '#0a0b0f', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="Success"
          stroke="#68d391"
          strokeWidth={2}
          fill="url(#gradSuccess)"
          stackId="1"
          dot={false}
          activeDot={{ r: 4, fill: '#68d391', stroke: '#0a0b0f', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
