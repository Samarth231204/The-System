import { isValidObjectId } from 'mongoose';
import { getCurrentUser } from '@/lib/auth/current-user';
import { connectToDatabase } from '@/lib/db/connect';
import { Task } from '@/lib/db/models/Task';
import { toTaskDto } from '@/lib/tasks/service';
import { judgeCompletedTask } from '@/lib/judge/service';
import { PROVIDER_IDS } from '@/lib/ai/providers';
import { serverError } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

// POST /api/tasks/:id/complete: mark done and judge the work for XP.
// The API key, if any, is used for this request only and never stored.
export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ error: 'Task not found.' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim().slice(0, 300) : '';
  const provider = PROVIDER_IDS.includes(body.provider) ? body.provider : undefined;

  try {
    await connectToDatabase();
    const task = await Task.findOne({ _id: id, userId: user.id });
    if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });
    if (task.kind === 'note') return Response.json({ error: 'Quick notes do not earn XP.' }, { status: 400 });

    task.status = 'done';
    task.completedAt = new Date();
    await task.save();

    const { task: judged, note } = await judgeCompletedTask(user.id, task, { apiKey, provider });
    return Response.json({ task: toTaskDto(judged), note });
  } catch (err) {
    return serverError(err);
  }
}
