import { connectToDatabase } from '@/lib/db/connect';
import { Target } from '@/lib/db/models/Target';
import { Task } from '@/lib/db/models/Task';
import { computeStats } from '@/lib/stats/service';

const DAY = 24 * 60 * 60 * 1000;

// Validates a new target or a partial update. Returns { value } or { error }.
export function parseTargetInput(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object') return { error: 'Send the target as JSON.' };
  const out = {};
  if ('title' in body || !partial) {
    const title = String(body.title ?? '').trim();
    if (!title) return { error: 'Name the boss target.' };
    if (title.length > 140) return { error: 'Title must be 140 characters or fewer.' };
    out.title = title;
  }
  if ('cost' in body || !partial) {
    const cost = Number(body.cost);
    if (!Number.isInteger(cost) || cost < 1 || cost > 100000) return { error: 'XP cost must be a whole number from 1 to 100000.' };
    out.cost = cost;
  }
  if ('deadline' in body || !partial) {
    const d = new Date(body.deadline);
    if (Number.isNaN(d.getTime())) return { error: 'Pick a valid deadline.' };
    if (!partial && d.getTime() < Date.now() - DAY) return { error: 'The deadline is already in the past.' };
    out.deadline = d;
  }
  if ('taskIds' in body) {
    if (!Array.isArray(body.taskIds) || body.taskIds.length > 100) return { error: 'Link up to 100 quests.' };
    out.taskIds = body.taskIds.map(String);
  }
  return { value: out };
}

// XP the player can still spend: total earned minus the cost of every claimed target.
export async function balanceFor(userId) {
  await connectToDatabase();
  const [stats, claimed] = await Promise.all([
    computeStats(userId),
    Target.find({ userId, claimedAt: { $ne: null } }).select('cost').lean(),
  ]);
  const spent = claimed.reduce((n, t) => n + t.cost, 0);
  return { totalXp: stats.totalXp, spent, balance: stats.totalXp - spent };
}

// Builds the browser view of a list of targets, including progress and timeline.
export async function targetViews(userId) {
  await connectToDatabase();
  const [targets, balance] = await Promise.all([Target.find({ userId }).sort({ deadline: 1 }).lean(), balanceFor(userId)]);
  const linkedIds = targets.flatMap((t) => t.taskIds);
  const tasks = await Task.find({ userId, _id: { $in: linkedIds } }).select('title status kind').lean();
  const taskById = new Map(tasks.map((t) => [String(t._id), t]));
  const now = Date.now();

  const views = targets.map((t) => {
    const linked = t.taskIds.map((id) => taskById.get(String(id))).filter(Boolean);
    const doneCount = linked.filter((x) => x.status === 'done').length;
    const created = new Date(t.createdAt).getTime();
    const deadline = new Date(t.deadline).getTime();
    const span = Math.max(DAY, deadline - created);
    return {
      id: String(t._id),
      title: t.title,
      cost: t.cost,
      deadline: new Date(t.deadline).toISOString(),
      claimedAt: t.claimedAt ? new Date(t.claimedAt).toISOString() : null,
      taskIds: t.taskIds.map(String),
      linked: linked.map((x) => ({ id: String(x._id), title: x.title, status: x.status, kind: x.kind })),
      progress: linked.length ? doneCount / linked.length : 0,
      daysLeft: Math.ceil((deadline - now) / DAY),
      timeline: Math.min(1, Math.max(0, (now - created) / span)),
      canClaim: !t.claimedAt && balance.balance >= t.cost,
    };
  });

  return { targets: views, balance };
}
