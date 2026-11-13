import { getCurrentUser } from '@/lib/auth/current-user';
import { connectToDatabase } from '@/lib/db/connect';
import { Task } from '@/lib/db/models/Task';
import { toTaskDto, parseTaskInput } from '@/lib/tasks/service';
import { serverError } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

// GET /api/tasks: open tasks plus anything completed in the last 24 hours.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  try {
    await connectToDatabase();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tasks = await Task.find({
      userId: user.id,
      $or: [{ status: 'open' }, { completedAt: { $gte: since } }],
    })
      .sort({ dueAt: 1, createdAt: 1 })
      .lean();
    return Response.json({ tasks: tasks.map(toTaskDto) });
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/tasks: create a quest, side quest or note.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const { value, error } = parseTaskInput(body);
  if (error) return Response.json({ error }, { status: 400 });
  try {
    await connectToDatabase();
    const task = await Task.create({ ...value, userId: user.id, status: 'open', completedAt: null });
    return Response.json({ task: toTaskDto(task) }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
