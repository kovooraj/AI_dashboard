'use client';

import { Info } from 'lucide-react';

interface BenchKPICardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  showInfo?: boolean;
  subBadge?: React.ReactNode;
  className?: string;
}

export function BenchKPICard({
  label,
  value,
  subLabel,
  showInfo = false,
  subBadge,
  className = '',
}: BenchKPICardProps) {
  return (
    <div
      className={`relative flex flex-col gap-2 rounded-lg p-4 ${className}`}
      style={{
        background: '#0d1810',
        border: '1px solid #1a2c1d',
        minWidth: 0,
      }}
    >
      {showInfo && (
        <button
          className="absolute top-3 right-3 opacity-40 hover:opacity-70 transition-opacity"
          aria-label="More information"
        >
          <Info size={13} color="#6a8870" />
        </button>
      )}

      <p
        style={{
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#6a8870',
          lineHeight: 1.4,
        }}
      >
        {label}
      </p>

      <p
        style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: '#e4ede6',
          fontFamily: 'var(--font-space), ui-sans-serif, sans-serif',
        }}
      >
        {value}
      </p>

      {subLabel && (
        <p style={{ fontSize: '0.7rem', color: '#6a8870', marginTop: 2 }}>{subLabel}</p>
      )}

      {subBadge && <div style={{ marginTop: 4 }}>{subBadge}</div>}
    </div>
  );
}
