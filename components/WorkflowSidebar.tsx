'use client';

import { useState } from 'react';
import type { WorkflowHealthData, HealthStatus } from '@/lib/types';

const DOT: Record<HealthStatus, string> = {
  healthy:  'var(--dash-green)',
  degraded: 'var(--dash-yellow)',
  failing:  'var(--dash-red)',
  unknown:  'var(--dash-muted)',
};

const LABEL: Record<HealthStatus, string> = {
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
    ? workflows.filter(w => w.workflow.name.toLowerCase().includes(query.toLowerCase()))
    : workflows;

  return (
    <div
      className="flex flex-col flex-shrink-0 animate-slide-in-left"
      style={{
        width: 236,
        height: '100vh',
        background: 'var(--dash-sidebar)',
        borderRight: '1px solid var(--dash-border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <p className="section-eyebrow mb-3">N8N Automations</p>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="var(--dash-muted)" strokeWidth="1.2"/>
            <path d="M8 8L11 11" stroke="var(--dash-muted)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            placeholder="Filter workflows…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-md pl-7 pr-3 py-1.5 text-xs outline-none transition-all"
            style={{
              background: 'var(--dash-border)',
              color: 'var(--dash-text)',
              border: '1px solid transparent',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--dash-subtle)')}
            onBlur={e => (e.target.style.borderColor = 'transparent')}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scroll pt-1">
        {/* Overview */}
        <Item
          name="Overview"
          sub={`${workflows.length} active`}
          dot="var(--dash-blue)"
          selected={selectedId === null}
          onClick={() => onSelect(null)}
          index={0}
        />

        <div className="mx-4 my-1.5" style={{ height: '1px', background: 'var(--dash-border)' }} />

        {filtered.map((wf, i) => (
          <Item
            key={wf.workflow.id}
            name={wf.workflow.name}
            sub={`${wf.successRate !== null ? `${wf.successRate}%` : '—'} · ${LABEL[wf.health]}`}
            dot={DOT[wf.health]}
            selected={selectedId === wf.workflow.id}
            active={wf.workflow.active}
            onClick={() => onSelect(wf.workflow.id)}
            index={i + 1}
          />
        ))}

        {filtered.length === 0 && (
          <p className="px-4 py-3 text-xs" style={{ color: 'var(--dash-muted)' }}>
            No match for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function Item({
  name, sub, dot, selected, active = true, onClick, index,
}: {
  name: string; sub: string; dot: string; selected: boolean;
  active?: boolean; onClick: () => void; index: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-all duration-150 animate-fade-in"
      style={{
        background: selected ? 'rgba(74,158,255,0.07)' : 'transparent',
        borderLeft: selected ? '2px solid var(--dash-green)' : '2px solid transparent',
        animationDelay: `${index * 25}ms`,
      }}
      onMouseEnter={e => {
        if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={e => {
        if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full mt-px" style={{ background: dot }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium leading-tight"
          style={{ color: selected ? 'var(--dash-text)' : '#8888a8' }}>
          {name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="truncate text-xs" style={{ color: 'var(--dash-muted)', fontSize: '0.65rem' }}>
            {sub}
          </p>
          {!active && (
            <span className="flex-shrink-0 rounded px-1 text-xs font-bold"
              style={{ fontSize: '0.55rem', background: 'rgba(255,92,92,0.15)', color: 'var(--dash-red)', padding: '1px 4px' }}>
              OFF
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
