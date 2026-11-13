import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/connect';
import { XpEvent } from '@/lib/db/models/XpEvent';
import { getRubric } from '@/lib/rubric/service';
import { progressFor, titleFor } from '@/lib/levels/curve';

// Builds the stats page data: overall level, XP per parameter and each parameter's own level.
export async function computeStats(userId) {
  await connectToDatabase();
  const [rubric, totals, completed] = await Promise.all([
    getRubric(userId),
    XpEvent.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(String(userId)) } },
      { $group: { _id: '$parameterKey', xp: { $sum: '$amount' }, label: { $last: '$parameterLabel' }, events: { $sum: 1 } } },
    ]),
    XpEvent.distinct('taskId', { userId }),
  ]);

  const xpByKey = new Map(totals.map((t) => [t._id, t]));
  const parameters = (rubric?.parameters || []).map((p) => {
    const xp = xpByKey.get(p.key)?.xp || 0;
    const prog = progressFor(xp);
    return { key: p.key, label: p.label, weight: p.weight, xp, level: prog.level, title: titleFor(prog.level), into: prog.into, span: prog.span, ratio: prog.ratio, next: prog.next };
  });

  const totalXp = totals.reduce((n, t) => n + t.xp, 0);
  const overall = progressFor(totalXp);

  return {
    totalXp,
    level: overall.level,
    title: titleFor(overall.level),
    into: overall.into,
    span: overall.span,
    ratio: overall.ratio,
    next: overall.next,
    completedQuests: completed.length,
    parameters,
  };
}
