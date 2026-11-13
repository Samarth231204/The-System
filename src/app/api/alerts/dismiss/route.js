import { getCurrentUser } from '@/lib/auth/current-user';
import { serverError } from '@/lib/auth/service';
import { dismissAlert } from '@/lib/urgency/service';

export const dynamic = 'force-dynamic';

const KEYS = ['stagnation'];

// POST /api/alerts/dismiss  Body: { key }
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!KEYS.includes(body.key)) return Response.json({ error: 'Unknown alert.' }, { status: 400 });
  try {
    await dismissAlert(user.id, body.key);
    return Response.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
