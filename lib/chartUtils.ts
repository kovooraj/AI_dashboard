import type { ChartPoint, VolumePoint } from './types';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Given an array of (success, error) snapshots ordered newest→oldest,
 * returns ChartPoints for rendering newest-first or oldest-first.
 * If only 1 snapshot, generates 7 synthetic daily points ending at snapshot value.
 */
export function buildSuccessChartData(
  snapshots: Array<{ totalTriggers: number; failedTriggers: number; weekLabel: string }>,
  maxPoints = 7
): ChartPoint[] {
  const sliced = snapshots.slice(0, maxPoints).reverse();

  if (sliced.length === 1) {
    const snap = sliced[0];
    const base = Math.max(1, snap.totalTriggers);
    const errBase = snap.failedTriggers;
    // Generate 7 synthetic points ending at the snapshot value
    return Array.from({ length: 7 }, (_, i) => {
      const dayIdx = (new Date().getDay() - (6 - i) + 7) % 7;
      const ratio = (i + 1) / 7;
      return {
        label: SHORT_DAYS[dayIdx],
        success: Math.round(base * ratio * (0.85 + Math.random() * 0.3)),
        error: i === 6 ? errBase : Math.round(errBase * ratio * (0.5 + Math.random() * 1)),
      };
    });
  }

  return sliced.map((s, i) => {
    const shortLabel = s.weekLabel.match(/W(\d+)/i)?.[0] ?? `W${i + 1}`;
    return {
      label: shortLabel,
      success: s.totalTriggers,
      error: s.failedTriggers,
    };
  });
}

/**
 * Similar for volume (total + resolved) charts.
 */
export function buildVolumeChartData(
  snapshots: Array<{ total: number; resolved: number; weekLabel: string }>,
  maxPoints = 7
): VolumePoint[] {
  const sliced = snapshots.slice(0, maxPoints).reverse();

  if (sliced.length === 1) {
    const snap = sliced[0];
    return Array.from({ length: 7 }, (_, i) => {
      const dayIdx = (new Date().getDay() - (6 - i) + 7) % 7;
      const ratio = (i + 1) / 7;
      return {
        label: SHORT_DAYS[dayIdx],
        total: Math.round(snap.total * ratio * (0.88 + Math.random() * 0.24)),
        resolved: Math.round(snap.resolved * ratio * (0.85 + Math.random() * 0.3)),
      };
    });
  }

  return sliced.map((s, i) => {
    const shortLabel = s.weekLabel.match(/W(\d+)/i)?.[0] ?? `W${i + 1}`;
    return {
      label: shortLabel,
      total: s.total,
      resolved: s.resolved,
    };
  });
}

export function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
}

export function formatHours(value: number): string {
  return `${value}h`;
}
