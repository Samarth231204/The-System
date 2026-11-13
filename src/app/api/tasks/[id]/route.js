import { isValidObjectId } from 'mongoose';
import { getCurrentUser } from '@/lib/auth/current-user';
import { connectToDatabase } from '@/lib/db/connect';
import { Task } from '@/lib/db/models/Task';
import { toTaskDto, parseTaskInput } from '@/lib/tasks/service';
import { serverError } from '@/lib/auth/service';
import { clearJudgement } from '@/lib/judge/service';

export const dynamic = 'force-dynamic';

// PATCH /api/tasks/:id: edit fields or mark done / reopen. Only the owner can change a task.
export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ error: 'Task not found.' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const { value, error } = parseTaskInput(body, { partial: true });
  if (error) return Response.json({ error }, { status: 400 });

  try {
    await connectToDatabase();
    const doc = await Task.findOneAndUpdate({ _id: id, userId: user.id }, { $set: value }, { new: true, runValidators: true });
    if (!doc) return Response.json({ error: 'Task not found.' }, { status: 404 });
    // Reopening a quest takes its XP back.
    if (value.status === 'open') await clearJudgement(user.id, doc);
    return Response.json({ task: toTaskDto(doc) });
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/tasks/:id
export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ error: 'Task not found.' }, { status: 404 });
  try {
    await connectToDatabase();
    const res = await Task.deleteOne({ _id: id, userId: user.id });
    if (!res.deletedCount) return Response.json({ error: 'Task not found.' }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
