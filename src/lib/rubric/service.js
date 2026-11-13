import { connectToDatabase } from '@/lib/db/connect';
import { Rubric } from '@/lib/db/models/Rubric';

export function toRubricDto(r) {
  if (!r) return null;
  return {
    source: r.source,
    parameters: r.parameters.map((p) => ({ key: p.key, label: p.label, weight: p.weight, description: p.description || '' })),
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
  };
}

export async function getRubric(userId) {
  await connectToDatabase();
  return Rubric.findOne({ userId }).lean();
}

export async function saveRubric(userId, parameters, source) {
  await connectToDatabase();
  return Rubric.findOneAndUpdate(
    { userId },
    { $set: { parameters, source }, $setOnInsert: { userId } },
    { new: true, upsert: true, runValidators: true }
  ).lean();
}
