'use client';

import { useState } from 'react';
import type { WorkflowHealthData, HealthStatus } from '@/lib/types';

const DOT_COLOR: Record<HealthStatus, string> = {
  healthy:  'var(--dash-green)',
  degraded: 'var(--dash-yellow)',
  failing:  'var(--dash-red)',
  unknown:  'var(--dash-muted)',
};

const HEALTH_LABEL: Record<HealthStatus, string> = {
  healthy:  'Healthy',
  degraded: 'Degraded',
  failing:  'Failing',
  unknown:  'No Runs',
};

interface Props {
  workflows: WorkflowHealthData[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function WorkflowSidebar({ workflows, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? workflows.filter((w) =>
        w.workflow.name.toLowerCase().includes(query.toLowerCase())
      )
    : workflows;

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        width: 232,
        height: '100vh',
        background: 'var(--dash-sidebar)',
        borderRight: '1px solid var(--dash-border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <p className="section-label mb-3">n8n Automations</p>
        <input
          type="search"
          placeholder="Filter workflows…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none placeholder-opacity-50 transition-colors"
          style={{
            background: 'var(--dash-border)',
            color: 'var(--dash-text)',
            border: '1px solid transparent',
          }}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        <SidebarItem
          name="Overview"
          sub={`${workflows.length} active workflows`}
          dot="var(--dash-blue)"
          selected={selectedId === null}
          onClick={() => onSelect(null)}
        />

        <div className="mx-4 my-1" style={{ height: 1, background: 'var(--dash-border)' }} />

        {filtered.map((wf) => (
          <SidebarItem
            key={wf.workflow.id}
            name={wf.workflow.name}
            sub={`${wf.successRate !== null ? `${wf.successRate}%` : '—'} · ${HEALTH_LABEL[wf.health]}`}
            dot={DOT_COLOR[wf.health]}
            selected={selectedId === wf.workflow.id}
            active={wf.workflow.active}
            onClick={() => onSelect(wf.workflow.id)}
          />
        ))}

        {filtered.length === 0 && (
          <p className="px-4 py-3 text-xs" style={{ color: 'var(--dash-muted)' }}>
            No workflows match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function SidebarItem({
  name,
  sub,
  dot,
  selected,
  active = true,
  onClick,
}: {
  name: string;
  sub: string;
  dot: string;
  selected: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-all"
      style={{
        background: selected ? 'rgba(99,179,237,0.07)' : 'transparent',
        borderLeft: selected ? '2px solid var(--dash-green)' : '2px solid transparent',
      }}
    >
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full mt-0.5"
        style={{ background: dot }}
      />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-xs font-medium leading-tight"
          style={{ color: selected ? 'var(--dash-text)' : '#94a3b8' }}
        >
          {name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p
            className="truncate text-xs leading-none"
            style={{ color: 'var(--dash-muted)', fontSize: '0.6875rem' }}
          >
            {sub}
          </p>
          {!active && (
            <span
              className="flex-shrink-0 rounded px-1 text-xs leading-none"
              style={{
                fontSize: '0.6rem',
                background: 'rgba(252,129,129,0.15)',
                color: 'var(--dash-red)',
                padding: '1px 4px',
              }}
            >
              OFF
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
