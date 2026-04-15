'use client';

import { useCountUp } from '@/hooks/useCountUp';

interface KPICardProps {
  /** The numeric value to animate up to */
  numericValue: number;
  /** Formatted display string (prefix/suffix applied after count) */
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ReactNode;
  color?: string;
  isLast?: boolean;
  animationDelay?: number;
}

export function KPICard({
  numericValue,
  prefix = '',
  suffix = '',
  label,
  sublabel,
  delta,
  deltaPositive = true,
  icon,
  color,
  isLast = false,
  animationDelay = 0,
}: KPICardProps) {
  const count = useCountUp(numericValue, 1200, animationDelay);

  const formatted = numericValue >= 1000
    ? (numericValue >= 1_000_000
        ? (count / 1_000_000).toFixed(1) + 'M'
        : count >= 1000
          ? (count / 1000).toFixed(1) + 'k'
          : count.toLocaleString())
    : count.toString();

  return (
    <div
      className="flex flex-col justify-between px-6 py-7 animate-fade-in-up"
      style={{
        borderRight: isLast ? 'none' : '1px solid var(--dash-border)',
        animationDelay: `${animationDelay}ms`,
        minHeight: 160,
      }}
    >
      {/* Top row: icon + delta */}
      <div className="flex items-start justify-between mb-4">
        <div style={{ color: color ?? 'var(--dash-muted)', opacity: 0.7 }}>
          {icon}
        </div>
        {delta && (
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: deltaPositive ? 'var(--dash-green)' : 'var(--dash-red)' }}
          >
            {delta}
          </span>
        )}
      </div>

      {/* Big number */}
      <div>
        <p
          className="display-number"
          style={{ fontSize: 'clamp(2rem, 3.5vw, 3.25rem)', color: color ?? 'var(--dash-text)' }}
        >
          {prefix}{formatted}{suffix}
        </p>

        {/* Label */}
        <p
          className="mt-2 text-xs font-medium"
          style={{ color: 'var(--dash-muted)', letterSpacing: '0.01em' }}
        >
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--dash-muted)', opacity: 0.55, fontSize: '0.65rem' }}>
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
