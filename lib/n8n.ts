import 'server-only';
import type { N8nWorkflow, N8nExecution } from './types';

const BASE_URL = process.env.N8N_BASE_URL?.replace(/\/$/, '');
const API_KEY = process.env.N8N_API_KEY;

function headers(): HeadersInit {
  return {
    'X-N8N-API-KEY': API_KEY ?? '',
    'Content-Type': 'application/json',
  };
}

export async function fetchAllWorkflows(): Promise<N8nWorkflow[]> {
  if (!BASE_URL || !API_KEY) {
    throw new Error('N8N_BASE_URL and N8N_API_KEY environment variables are required');
  }

  const workflows: N8nWorkflow[] = [];
  let cursor: string | null = null;

  do {
    const url = new URL(`${BASE_URL}/api/v1/workflows`);
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url.toString(), {
      headers: headers(),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`n8n workflows API returned ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    workflows.push(...(data.data ?? []));
    cursor = data.nextCursor ?? null;
  } while (cursor);

  return workflows;
}

export async function fetchRecentExecutions(
  workflowId: string,
  limit = 20
): Promise<N8nExecution[]> {
  if (!BASE_URL || !API_KEY) {
    throw new Error('N8N_BASE_URL and N8N_API_KEY environment variables are required');
  }

  const url = new URL(`${BASE_URL}/api/v1/executions`);
  url.searchParams.set('workflowId', workflowId);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    headers: headers(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`n8n executions API returned ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.data ?? [];
}

// Fetches executions for multiple workflows with a concurrency limit of 5
// to avoid hitting n8n's default rate limit of 5 req/s
export async function fetchExecutionsBatch(
  workflowIds: string[],
  limit = 20
): Promise<Map<string, N8nExecution[]>> {
  const results = new Map<string, N8nExecution[]>();
  const BATCH_SIZE = 5;

  for (let i = 0; i < workflowIds.length; i += BATCH_SIZE) {
    const batch = workflowIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (id) => {
        try {
          const execs = await fetchRecentExecutions(id, limit);
          return { id, execs };
        } catch {
          return { id, execs: [] };
        }
      })
    );
    for (const { id, execs } of batchResults) {
      results.set(id, execs);
    }
  }

  return results;
}
