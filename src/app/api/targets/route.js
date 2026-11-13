import { getCurrentUser } from '@/lib/auth/current-user';
import { connectToDatabase } from '@/lib/db/connect';
import { Target } from '@/lib/db/models/Target';
import { parseTargetInput, targetViews } from '@/lib/targets/service';
import { serverError } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  try {
    return Response.json(await targetViews(user.id));
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const { value, error } = parseTargetInput(body);
  if (error) return Response.json({ error }, { status: 400 });
  try {
    await connectToDatabase();
    await Target.create({ ...value, userId: user.id, taskIds: [] });
    return Response.json(await targetViews(user.id), { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
