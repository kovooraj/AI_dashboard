'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthBadge } from './HealthBadge';
import { ExecutionRow } from './ExecutionRow';
import type { WorkflowHealthData } from '@/lib/types';

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function WorkflowCard({ data }: { data: WorkflowHealthData }) {
  const [expanded, setExpanded] = useState(false);
  const { workflow, executions, health, successRate, lastRunAt, failureCount, runningCount } = data;

  return (
    <Card className="flex flex-col gap-0 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight text-zinc-900 line-clamp-2">
            {workflow.name}
          </CardTitle>
          <HealthBadge status={health} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-0">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-zinc-50 px-2 py-1.5">
            <p className="text-xs text-zinc-500">Success</p>
            <p className="text-sm font-bold text-zinc-800">
              {successRate !== null ? `${successRate}%` : '—'}
            </p>
          </div>
          <div className="rounded-md bg-zinc-50 px-2 py-1.5">
            <p className="text-xs text-zinc-500">Failures</p>
            <p className={`text-sm font-bold ${failureCount > 0 ? 'text-red-600' : 'text-zinc-800'}`}>
              {failureCount}
            </p>
          </div>
          <div className="rounded-md bg-zinc-50 px-2 py-1.5">
            <p className="text-xs text-zinc-500">Last Run</p>
            <p className="text-sm font-bold text-zinc-800 truncate">
              {lastRunAt ? formatRelativeTime(lastRunAt) : '—'}
            </p>
          </div>
        </div>

        {/* Running indicator */}
        {runningCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            {runningCount} execution{runningCount > 1 ? 's' : ''} in progress
          </div>
        )}

        {/* Execution history toggle */}
        {executions.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              <span>Recent executions ({executions.length})</span>
              <span>{expanded ? '▲' : '▼'}</span>
            </button>

            {expanded && (
              <div className="mt-2">
                {executions.map((exec) => (
                  <ExecutionRow key={exec.id} execution={exec} />
                ))}
              </div>
            )}
          </div>
        )}

        {executions.length === 0 && (
          <p className="text-xs text-zinc-400 text-center">No executions yet</p>
        )}
      </CardContent>
    </Card>
  );
}
