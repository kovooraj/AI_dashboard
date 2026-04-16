'use client';

interface ProgressMetricProps {
  label: string;
  value: number; // 0-100
  className?: string;
}

export function ProgressMetric({ label, value, className = '' }: ProgressMetricProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#6a8870',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#e4ede6',
            letterSpacing: '0.01em',
          }}
        >
          {clamped}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: '#1a2c1d',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            background: '#3dba62',
            borderRadius: 3,
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
    </div>
  );
}
