import { DashboardClient } from '@/components/DashboardClient';
import type { DashboardData, WorkflowHealthData } from '@/lib/types';

async function getDashboardData(): Promise<DashboardData> {
  try {
    const { fetchAllWorkflows, fetchExecutionsBatch } = await import('@/lib/n8n');
    const { deriveHealth, calcSuccessRate } = await import('@/lib/health');

    const allWorkflows = await fetchAllWorkflows();
    const activeWorkflows = allWorkflows.filter((w) => w.active);

    const executionMap = await fetchExecutionsBatch(
      activeWorkflows.map((w) => w.id),
      20
    );

    const workflows: WorkflowHealthData[] = activeWorkflows.map((wf) => {
      const executions = executionMap.get(wf.id) ?? [];
      const health = deriveHealth(executions);
      const successRate = calcSuccessRate(executions);
      const lastRunAt = executions[0]?.startedAt ?? null;
      const failureCount = executions.filter(
        (e) => e.status === 'error' || e.status === 'crashed'
      ).length;
      const runningCount = executions.filter(
        (e) => e.status === 'running' || e.status === 'waiting'
      ).length;

      return {
        workflow: wf,
        executions: executions.slice(0, 10),
        health,
        successRate,
        lastRunAt,
        totalFetched: executions.length,
        failureCount,
        runningCount,
      };
    });

    const order = { failing: 0, degraded: 1, healthy: 2, unknown: 3 } as const;
    workflows.sort((a, b) => order[a.health] - order[b.health]);

    return { workflows, fetchedAt: new Date().toISOString() };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { workflows: [], fetchedAt: new Date().toISOString(), error: message };
  }
}

export default async function Page() {
  const data = await getDashboardData();
  return <DashboardClient initialData={data} />;
}
