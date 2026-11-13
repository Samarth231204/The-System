import { isValidObjectId } from 'mongoose';
import { getCurrentUser } from '@/lib/auth/current-user';
import { connectToDatabase } from '@/lib/db/connect';
import { Task } from '@/lib/db/models/Task';
import { toTaskDto } from '@/lib/tasks/service';
import { overrideJudgement } from '@/lib/judge/service';
import { serverError } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

// PUT /api/tasks/:id/judgement: override scores by hand. Body: { scores: [{ key, score, reason }] }
export async function PUT(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ error: 'Task not found.' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.scores) || body.scores.length === 0) return Response.json({ error: 'Send at least one score.' }, { status: 400 });
  const scores = [];
  for (const s of body.scores) {
    const score = Number(s?.score);
    if (!Number.isInteger(score) || score < 0 || score > 10) return Response.json({ error: 'Scores must be whole numbers from 0 to 10.' }, { status: 400 });
    const reason = String(s?.reason ?? '').trim().slice(0, 240);
    scores.push({ key: String(s.key), score, reason });
  }

  try {
    await connectToDatabase();
    const task = await Task.findOne({ _id: id, userId: user.id });
    if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });
    if (task.status !== 'done') return Response.json({ error: 'Complete the quest before judging it.' }, { status: 400 });
    const updated = await overrideJudgement(user.id, task, scores);
    return Response.json({ task: toTaskDto(updated) });
  } catch (err) {
    return serverError(err);
  }
}
