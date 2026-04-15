export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'error' | 'waiting' | 'running' | 'crashed';
  startedAt: string;
  stoppedAt: string | null;
  mode: string;
}

export type HealthStatus = 'healthy' | 'degraded' | 'failing' | 'unknown';

export interface WorkflowHealthData {
  workflow: N8nWorkflow;
  executions: N8nExecution[];
  health: HealthStatus;
  successRate: number | null;
  lastRunAt: string | null;
  totalFetched: number;
  failureCount: number;
  runningCount: number;
}

export interface DashboardData {
  workflows: WorkflowHealthData[];
  fetchedAt: string;
  error?: string;
}

export type HistoryPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface DailyBucket {
  date: string;
  total: number;
  success: number;
  error: number;
}

export interface HistoryData {
  period: HistoryPeriod;
  workflowId: string | null;
  buckets: DailyBucket[];
  totalRuns: number;
  successRuns: number;
  errorRuns: number;
  fetchedAt: string;
  error?: string;
}
