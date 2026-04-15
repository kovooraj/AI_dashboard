'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DashboardData } from '@/lib/types';
import { IconNav } from './IconNav';
import { WorkflowSidebar } from './WorkflowSidebar';
import { OverviewPanel } from './OverviewPanel';
import { WorkflowDetailPanel } from './WorkflowDetailPanel';

const REFRESH_SECONDS = 30;

interface Props {
  initialData: DashboardData;
}

export function DashboardShell({ initialData }: Props) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_SECONDS);
  const [refreshing, setRefreshing] = useState(false);
  const countdownRef = useRef(REFRESH_SECONDS);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard');
      const json: DashboardData = await res.json();
      setData(json);
    } catch {
      // Keep stale data
    } finally {
      setRefreshing(false);
      countdownRef.current = REFRESH_SECONDS;
      setCountdown(REFRESH_SECONDS);
    }
  }, []);

  useEffect(() => {
    const ticker = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current <= 0) refresh();
    }, 1000);
    return () => clearInterval(ticker);
  }, [refresh]);

  // If currently selected workflow is no longer in the data (e.g. deactivated), reset
  const selectedWorkflow = selectedId
    ? (data.workflows.find((w) => w.workflow.id === selectedId) ?? null)
    : null;

  const failingCount = data.workflows.filter((w) => w.health === 'failing').length;
  const degradedCount = data.workflows.filter((w) => w.health === 'degraded').length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--dash-bg)' }}>
      {/* Col 1: Icon strip */}
      <IconNav />

      {/* Col 2: Workflow list */}
      <WorkflowSidebar
        workflows={data.workflows}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Col 3: Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ background: 'var(--dash-bg)' }}>
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--dash-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--dash-text)' }}>
                n8n Monitor
              </span>
              {refreshing && (
                <span className="text-xs animate-pulse" style={{ color: 'var(--dash-blue)' }}>
                  refreshing…
                </span>
              )}
            </div>
            {/* Status pills */}
            {failingCount > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: 'rgba(252,129,129,0.15)', color: 'var(--dash-red)' }}
              >
                {failingCount} failing
              </span>
            )}
            {degradedCount > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: 'rgba(246,224,94,0.15)', color: 'var(--dash-yellow)' }}
              >
                {degradedCount} degraded
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums" style={{ color: 'var(--dash-muted)' }}>
              {countdown}s
            </span>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="rounded-md px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-40"
              style={{
                background: 'var(--dash-card)',
                border: '1px solid var(--dash-border)',
                color: 'var(--dash-text)',
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Error banner */}
        {data.error && (
          <div
            className="mx-6 mt-4 rounded-lg px-4 py-2.5 text-xs flex-shrink-0"
            style={{
              background: 'rgba(252,129,129,0.08)',
              border: '1px solid rgba(252,129,129,0.25)',
              color: 'var(--dash-red)',
            }}
          >
            <strong>n8n unreachable:</strong> {data.error}
          </div>
        )}

        {/* Panels */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {selectedWorkflow ? (
            <WorkflowDetailPanel
              workflowData={selectedWorkflow}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <OverviewPanel dashboardData={data} />
          )}
        </div>
      </main>
    </div>
  );
}
