import type { N8nExecution, HealthStatus } from './types';

const WINDOW_SIZE = 10;
const DEGRADED_THRESHOLD = 0.40;

export function deriveHealth(executions: N8nExecution[]): HealthStatus {
  // Only count completed executions for health (exclude running/waiting)
  const completed = executions.filter(
    (e) => e.status === 'success' || e.status === 'error' || e.status === 'crashed'
  );

  const window = completed.slice(0, WINDOW_SIZE);

  if (window.length === 0) return 'unknown';

  const errorCount = window.filter(
    (e) => e.status === 'error' || e.status === 'crashed'
  ).length;
  const failureRate = errorCount / window.length;

  let health: HealthStatus;
  if (failureRate === 0) {
    health = 'healthy';
  } else if (failureRate <= DEGRADED_THRESHOLD) {
    health = 'degraded';
  } else {
    health = 'failing';
  }

  // Recency escalation: if the most recent completed execution failed, bump up one level
  const mostRecent = window[0];
  if (mostRecent.status === 'error' || mostRecent.status === 'crashed') {
    if (health === 'healthy') health = 'degraded';
    else if (health === 'degraded') health = 'failing';
  }

  return health;
}

export function calcSuccessRate(executions: N8nExecution[]): number | null {
  const completed = executions.filter(
    (e) => e.status === 'success' || e.status === 'error' || e.status === 'crashed'
  );
  if (completed.length === 0) return null;
  const successes = completed.filter((e) => e.status === 'success').length;
  return Math.round((successes / completed.length) * 1000) / 10;
}
