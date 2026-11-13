import { isValidObjectId } from 'mongoose';
import { getCurrentUser } from '@/lib/auth/current-user';
import { connectToDatabase } from '@/lib/db/connect';
import { Target } from '@/lib/db/models/Target';
import { Task } from '@/lib/db/models/Task';
import { parseTargetInput, targetViews, balanceFor } from '@/lib/targets/service';
import { serverError } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

// PATCH /api/targets/:id
// Body: any of { title, cost, deadline, taskIds } to edit, or { claim: true } to spend XP on it.
export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ error: 'Target not found.' }, { status: 404 });
  const body = await request.json().catch(() => null);

  try {
    await connectToDatabase();
    const target = await Target.findOne({ _id: id, userId: user.id });
    if (!target) return Response.json({ error: 'Target not found.' }, { status: 404 });

    if (body?.claim === true) {
      if (target.claimedAt) return Response.json({ error: 'Already claimed.' }, { status: 400 });
      const { balance } = await balanceFor(user.id);
      if (balance < target.cost) return Response.json({ error: `Not enough XP. You need ${target.cost} and have ${balance}.` }, { status: 400 });
      target.claimedAt = new Date();
      await target.save();
      return Response.json(await targetViews(user.id));
    }

    const { value, error } = parseTargetInput(body, { partial: true });
    if (error) return Response.json({ error }, { status: 400 });
    if (value.taskIds) {
      const owned = await Task.countDocuments({ userId: user.id, _id: { $in: value.taskIds } });
      if (owned !== new Set(value.taskIds).size) return Response.json({ error: 'Some linked quests were not found.' }, { status: 400 });
    }
    if (target.claimedAt && (value.cost || value.deadline || value.title)) {
      return Response.json({ error: 'A claimed target can only change its quest links.' }, { status: 400 });
    }
    Object.assign(target, value);
    await target.save();
    return Response.json(await targetViews(user.id));
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ error: 'Target not found.' }, { status: 404 });
  try {
    await connectToDatabase();
    const res = await Target.deleteOne({ _id: id, userId: user.id });
    if (!res.deletedCount) return Response.json({ error: 'Target not found.' }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
