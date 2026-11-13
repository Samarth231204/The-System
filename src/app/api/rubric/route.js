import { getCurrentUser } from '@/lib/auth/current-user';
import { serverError } from '@/lib/auth/service';
import { validateParameters } from '@/lib/rubric/validate';
import { getRubric, saveRubric, toRubricDto } from '@/lib/rubric/service';

export const dynamic = 'force-dynamic';

// GET /api/rubric: the player's current XP design.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  try {
    return Response.json({ rubric: toRubricDto(await getRubric(user.id)) });
  } catch (err) {
    return serverError(err);
  }
}

// PUT /api/rubric: save edits made by hand. Source becomes "manual".
export async function PUT(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const { value, error } = validateParameters(body?.parameters);
  if (error) return Response.json({ error }, { status: 400 });
  try {
    const saved = await saveRubric(user.id, value, 'manual');
    return Response.json({ rubric: toRubricDto(saved) });
  } catch (err) {
    return serverError(err);
  }
}
