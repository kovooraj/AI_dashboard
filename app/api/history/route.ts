export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { fetchAllWorkflows, fetchExecutionsForPeriod } from '@/lib/n8n';
import type { DailyBucket, HistoryData, HistoryPeriod } from '@/lib/types';

const PERIOD_DAYS: Record<HistoryPeriod, number> = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

const PERIOD_LIMIT: Record<HistoryPeriod, number> = {
  week: 100,
  month: 250,
  quarter: 250,
  year: 250,
};

function periodStart(period: HistoryPeriod): Date {
  const d = new Date();
  d.setDate(d.getDate() - PERIOD_DAYS[period]);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildDateBuckets(since: Date): Map<string, DailyBucket> {
  const map = new Map<string, DailyBucket>();
  const cursor = new Date(since);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    map.set(key, { date: key, total: 0, success: 0, error: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return map;
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = request.nextUrl;
    const rawPeriod = searchParams.get('period') ?? 'week';
    const workflowId = searchParams.get('workflowId') ?? null;

    const period: HistoryPeriod = (['week', 'month', 'quarter', 'year'] as const).includes(
      rawPeriod as HistoryPeriod
    )
      ? (rawPeriod as HistoryPeriod)
      : 'week';

    const since = periodStart(period);
    const limit = PERIOD_LIMIT[period];

    let workflowIds: string[];
    if (workflowId) {
      workflowIds = [workflowId];
    } else {
      const allWorkflows = await fetchAllWorkflows();
      workflowIds = allWorkflows.filter((w) => w.active).map((w) => w.id);
    }

    const BATCH_SIZE = 5;
    const allExecutions: import('@/lib/types').N8nExecution[] = [];

    for (let i = 0; i < workflowIds.length; i += BATCH_SIZE) {
      const batch = workflowIds.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (id) => {
          try {
            return await fetchExecutionsForPeriod(id, since, limit);
          } catch {
            return [];
          }
        })
      );
      for (const execs of results) allExecutions.push(...execs);
    }

    const bucketMap = buildDateBuckets(since);
    let totalRuns = 0;
    let successRuns = 0;
    let errorRuns = 0;

    for (const exec of allExecutions) {
      if (!exec.startedAt) continue;
      const dateKey = new Date(exec.startedAt).toISOString().slice(0, 10);
      const bucket = bucketMap.get(dateKey);
      if (!bucket) continue;

      bucket.total += 1;
      totalRuns += 1;

      if (exec.status === 'success') {
        bucket.success += 1;
        successRuns += 1;
      } else if (exec.status === 'error' || exec.status === 'crashed') {
        bucket.error += 1;
        errorRuns += 1;
      }
    }

    const payload: HistoryData = {
      period,
      workflowId,
      buckets: Array.from(bucketMap.values()),
      totalRuns,
      successRuns,
      errorRuns,
      fetchedAt: new Date().toISOString(),
    };

    return Response.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json(
      {
        period: 'week',
        workflowId: null,
        buckets: [],
        totalRuns: 0,
        successRuns: 0,
        errorRuns: 0,
        fetchedAt: new Date().toISOString(),
        error: message,
      } satisfies HistoryData,
      { status: 200 }
    );
  }
}
