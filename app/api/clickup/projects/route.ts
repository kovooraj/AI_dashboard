import { NextResponse } from 'next/server';
import type { ClickUpTask, TaskPlatform } from '@/lib/types';

const LIST_ID = '901112680070';

// Map ClickUp tag names → platform buckets
const TAG_PLATFORM_MAP: Record<string, TaskPlatform> = {
  'n8n': 'n8n',
  '11labs': 'elevenlabs',
  'elevenlabs': 'elevenlabs',
  'fin': 'fin',
};

function detectPlatformFromTags(tags: string[]): TaskPlatform | null {
  for (const tag of tags) {
    const mapped = TAG_PLATFORM_MAP[tag.toLowerCase().trim()];
    if (mapped) return mapped;
  }
  return null;
}

function detectPlatformFromName(name: string): TaskPlatform {
  const n = name.toLowerCase().trim();
  if (
    n.startsWith('fin ') || n.startsWith('fin-') || n.startsWith('fin\t') ||
    n.includes('fin tool') || n.includes('fin -') || n.includes('fin co') ||
    n.includes('refund') || n.includes('resend proof') || n.includes('change spec') ||
    n.includes('order cancel') || n.includes('intercom') ||
    n === 'fin'
  ) return 'fin';
  if (
    n.includes('elevenlabs') || n.includes('eleven labs') || n.includes('11labs') ||
    n.includes('call agent') || n.includes('outbound call') || n.includes('call rubric') ||
    n.includes('voice agent') || n.includes('rippit') || n.includes('onboarding call') ||
    n.includes('call ai agent') || n.includes('voice call') ||
    n.includes('reporting for voice') || n.includes('english voice') || n.includes('engish voice')
  ) return 'elevenlabs';
  if (
    n.includes('n8n') || n.includes('workflow') || n.includes('supabase') ||
    n.includes('powerbi') || n.includes('power bi') || n.includes('tier agent') ||
    n.includes('notion') || n.includes('rag') || n.includes('brain') ||
    n.includes('customer tier') || n.includes('salesforce') || n.includes('automat') ||
    n.includes('email report') || n.includes('icp report') ||
    n.includes('approval agent') || n.includes('apollo') || n.includes('tier classifier') ||
    n.includes('tier report') || n.includes('tiering') || n.includes('account approver') ||
    n.includes('deal strategist') || n.includes('company auditor') || n.includes('ads report') ||
    n.includes('forecasting') || n.includes('zapier') || n.includes('weekly report') ||
    n.includes('ai report') || n.includes('ai agent') || n.includes('classifier') ||
    n.includes('margin analyzer') || n.includes('retro') || n.includes('retroactive')
  ) return 'n8n';
  return 'general';
}

export async function GET() {
  const key = process.env.CLICKUP_API_KEY;
  if (!key) {
    return NextResponse.json({ tasks: [], mock: true, error: 'CLICKUP_API_KEY not set' });
  }

  try {
    const { getListTasks } = await import('@/lib/clickup');
    const raw = await getListTasks(LIST_ID);

    const tasks: ClickUpTask[] = raw.map((t) => {
      const status = t.status as { status?: string; color?: string } | undefined;
      const assignees = (t.assignees as Array<{ username?: string; email?: string }> | undefined) ?? [];
      const name = (t.name as string) ?? '';
      const tagNames = ((t.tags as Array<{ name: string }>) ?? []).map((tag) => tag.name);
      const platform = detectPlatformFromTags(tagNames) ?? detectPlatformFromName(name);
      return {
        id: (t.id as string) ?? '',
        name,
        status: status?.status ?? 'unknown',
        statusColor: status?.color ?? '#6a8870',
        url: (t.url as string) ?? '#',
        assignees: assignees.map((a) => a.username ?? a.email ?? 'Unknown'),
        updatedAt: new Date((t.date_updated as number) ?? 0).toISOString(),
        platform,
      };
    });

    return NextResponse.json({ tasks, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { tasks: [], mock: false, error: message },
      { status: 200 }
    );
  }
}
