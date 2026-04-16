const KEY = process.env.CLICKUP_API_KEY;
const BASE = 'https://api.clickup.com/api/v2';

function clickupHeaders(): HeadersInit {
  return {
    Authorization: KEY ?? '',
    'Content-Type': 'application/json',
  };
}

export async function getListTasks(listId: string): Promise<Record<string, unknown>[]> {
  if (!KEY) {
    throw new Error('CLICKUP_API_KEY not set');
  }

  const url = `${BASE}/list/${listId}/task?include_closed=true&subtasks=false&page=0`;

  const res = await fetch(url, {
    headers: clickupHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`ClickUp API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return (data.tasks ?? []) as Record<string, unknown>[];
}
