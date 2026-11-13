import { getCurrentUser } from '@/lib/auth/current-user';
import { serverError } from '@/lib/auth/service';
import { urgencyFor } from '@/lib/urgency/service';

export const dynamic = 'force-dynamic';

// GET /api/alerts: current urgency, banner and alerts for the logged-in player.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  try {
    return Response.json(await urgencyFor(user.id));
  } catch (err) {
    return serverError(err);
  }
}
