'use client';

import { useEffect, useRef, useState } from 'react';
import type { DashboardData } from '@/lib/types';
import { StatsBar } from './StatsBar';
import { WorkflowCard } from './WorkflowCard';

const REFRESH_INTERVAL = 30;

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString();
}

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [refreshing, setRefreshing] = useState(false);
  const countdownRef = useRef(REFRESH_INTERVAL);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard');
      const json: DashboardData = await res.json();
      setData(json);
    } catch {
      // keep stale data on network error
    } finally {
      setRefreshing(false);
      countdownRef.current = REFRESH_INTERVAL;
      setCountdown(REFRESH_INTERVAL);
    }
  }

  useEffect(() => {
    // Countdown ticker
    const ticker = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current <= 0) {
        refresh();
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  const { workflows, fetchedAt, error } = data;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">n8n Workflow Monitor</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Last updated: {formatTime(fetchedAt)}
              {refreshing && (
                <span className="ml-2 text-blue-500 animate-pulse">Refreshing…</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              Next refresh in <span className="tabular-nums font-medium text-zinc-600">{countdown}s</span>
            </span>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="rounded-md bg-white border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              Refresh now
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>Could not reach n8n:</strong> {error}
          </div>
        )}

        {/* Stats summary */}
        {workflows.length > 0 && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white px-6 py-4 shadow-sm">
            <StatsBar workflows={workflows} />
          </div>
        )}

        {/* Empty state */}
        {!error && workflows.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-zinc-500">No active workflows found.</p>
            <p className="mt-1 text-sm text-zinc-400">
              Activate a workflow in n8n and it will appear here.
            </p>
          </div>
        )}

        {/* Workflow grid */}
        {workflows.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workflows.map((wf) => (
              <WorkflowCard key={wf.workflow.id} data={wf} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
