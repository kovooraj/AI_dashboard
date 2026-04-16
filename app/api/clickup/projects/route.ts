import { NextResponse } from 'next/server';
import type { ClickUpTask } from '@/lib/types';

const LIST_ID = '901112680070';

const MOCK_TASKS: ClickUpTask[] = [
  {
    id: 'mock-cu-1',
    name: 'FIN AI Automation — Resolution Rate Improvement',
    status: 'in progress',
    statusColor: '#d4912a',
    url: '#',
    assignees: ['Alex Kovoor'],
    updatedAt: '2026-04-15T10:30:00Z',
  },
  {
    id: 'mock-cu-2',
    name: 'ElevenLabs Voice Agent — Call Deflection Optimisation',
    status: 'in progress',
    statusColor: '#d4912a',
    url: '#',
    assignees: ['Alex Kovoor'],
    updatedAt: '2026-04-14T14:20:00Z',
  },
  {
    id: 'mock-cu-3',
    name: 'N8N PowerBI Integration — Automated Reporting',
    status: 'complete',
    statusColor: '#3dba62',
    url: '#',
    assignees: ['Alex Kovoor'],
    updatedAt: '2026-04-12T09:15:00Z',
  },
  {
    id: 'mock-cu-4',
    name: 'Salesforce Automation — Quote Update Workflow',
    status: 'complete',
    statusColor: '#3dba62',
    url: '#',
    assignees: ['Alex Kovoor'],
    updatedAt: '2026-04-10T11:00:00Z',
  },
  {
    id: 'mock-cu-5',
    name: 'Claude Email Assistant — Inbox Triage',
    status: 'to do',
    statusColor: '#6a8870',
    url: '#',
    assignees: ['Alex Kovoor'],
    updatedAt: '2026-04-08T16:45:00Z',
  },
  {
    id: 'mock-cu-6',
    name: 'Notion Sync Agent — Weekly Report Automation',
    status: 'on hold',
    statusColor: '#e05858',
    url: '#',
    assignees: ['Alex Kovoor'],
    updatedAt: '2026-04-05T08:00:00Z',
  },
];

export async function GET() {
  const key = process.env.CLICKUP_API_KEY;
  if (!key) {
    return NextResponse.json({ tasks: MOCK_TASKS, mock: true });
  }

  try {
    const { getListTasks } = await import('@/lib/clickup');
    const raw = await getListTasks(LIST_ID);

    const tasks: ClickUpTask[] = raw.map((t) => {
      const status = t.status as { status?: string; color?: string } | undefined;
      const assignees = (t.assignees as Array<{ username?: string; email?: string }> | undefined) ?? [];
      return {
        id: (t.id as string) ?? '',
        name: (t.name as string) ?? '',
        status: status?.status ?? 'unknown',
        statusColor: status?.color ?? '#6a8870',
        url: (t.url as string) ?? '#',
        assignees: assignees.map((a) => a.username ?? a.email ?? 'Unknown'),
        updatedAt: new Date((t.date_updated as number) ?? 0).toISOString(),
      };
    });

    return NextResponse.json({ tasks, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { tasks: MOCK_TASKS, mock: true, error: message },
      { status: 200 }
    );
  }
}
