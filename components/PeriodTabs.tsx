'use client';

import type { DashboardPeriod } from '@/lib/types';

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: 'weekly', label: 'WEEKLY' },
  { value: 'monthly', label: 'MONTHLY' },
  { value: 'quarterly', label: 'QUARTERLY' },
  { value: 'annually', label: 'ANNUALLY' },
];

interface PeriodTabsProps {
  active: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

export function PeriodTabs({ active, onChange }: PeriodTabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid #1a2c1d',
      }}
    >
      {PERIODS.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            style={{
              padding: '8px 16px',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isActive ? '#e4ede6' : '#6a8870',
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid #3dba62' : '2px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
