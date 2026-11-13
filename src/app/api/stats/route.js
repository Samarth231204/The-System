import { getCurrentUser } from '@/lib/auth/current-user';
import { serverError } from '@/lib/auth/service';
import { computeStats } from '@/lib/stats/service';

export const dynamic = 'force-dynamic';

// GET /api/stats: overall level, total XP and per-parameter levels.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  try {
    return Response.json(await computeStats(user.id));
  } catch (err) {
    return serverError(err);
  }
}
