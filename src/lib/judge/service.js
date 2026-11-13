import { connectToDatabase } from '@/lib/db/connect';
import { Task } from '@/lib/db/models/Task';
import { XpEvent } from '@/lib/db/models/XpEvent';
import { getRubric, saveRubric } from '@/lib/rubric/service';
import { localRubric } from '@/lib/ai/rubric-design';
import { callProvider } from '@/lib/ai/providers';
import { buildJudgePrompt, parseJudgeReply, localJudge, xpFor, XP_MULTIPLIER, JUDGE_SYSTEM } from './judge';
import { getPlayer } from '@/lib/player/service';

// Returns the player's parameters, designing an on-device set first if none exist yet.
async function parametersFor(userId, goals) {
  const existing = await getRubric(userId);
  if (existing?.parameters?.length) return existing.parameters;
  const fallback = localRubric(goals);
  await saveRubric(userId, fallback.parameters, 'local');
  return fallback.parameters;
}

// Writes the judgement onto the task and replaces its ledger lines.
async function applyJudgement(userId, task, rows, source, judgedBy) {
  const judgement = rows.map((r) => ({
    key: r.key,
    label: r.label,
    weight: r.weight,
    score: r.score,
    amount: xpFor(r.score, r.weight),
    reason: r.reason,
  }));
  const xpTotal = judgement.reduce((n, j) => n + j.amount, 0);

  await XpEvent.deleteMany({ taskId: task._id, userId });
  await XpEvent.insertMany(
    judgement.map((j) => ({
      userId,
      taskId: task._id,
      parameterKey: j.key,
      parameterLabel: j.label,
      score: j.score,
      amount: j.amount,
      reason: j.reason,
      source: judgedBy === 'override' ? 'override' : source,
    }))
  );
  task.judgement = judgement;
  task.xpTotal = xpTotal;
  task.judgedBy = judgedBy;
  await task.save();
  return task;
}

// Judges a task the player just completed. Uses the AI when a key is given, otherwise the on-device judge.
export async function judgeCompletedTask(userId, task, { apiKey, provider }) {
  await connectToDatabase();
  const player = await getPlayer(userId);
  const parameters = await parametersFor(userId, player?.goals || '');

  let rows;
  let note = '';
  let source = 'local';

  if (apiKey) {
    try {
      const text = await callProvider({
        provider: provider || player?.provider || 'gemini',
        apiKey,
        system: JUDGE_SYSTEM,
        user: buildJudgePrompt(task, parameters),
      });
      rows = parseJudgeReply(text, parameters);
      source = 'ai';
    } catch (err) {
      note = `${err.message} Judged on this device instead.`;
    }
  }
  if (!rows) rows = localJudge(task, parameters);

  await applyJudgement(userId, task, rows, source, source);
  return { task, note, multiplier: XP_MULTIPLIER };
}

// Player overrides the score for some parameters. Scores and reasons are kept, marked as overrides.
export async function overrideJudgement(userId, task, scores) {
  await connectToDatabase();
  const current = task.judgement || [];
  const rows = current.map((j) => {
    const change = scores.find((s) => s.key === j.key);
    if (!change) return { key: j.key, label: j.label, weight: j.weight, score: j.score, reason: j.reason };
    return { key: j.key, label: j.label, weight: j.weight, score: change.score, reason: change.reason || 'Set by hand.' };
  });
  await applyJudgement(userId, task, rows, 'override', 'override');
  return task;
}

// Removes XP lines when a task is reopened.
export async function clearJudgement(userId, task) {
  await connectToDatabase();
  await XpEvent.deleteMany({ taskId: task._id, userId });
  task.judgement = [];
  task.xpTotal = 0;
  task.judgedBy = null;
  await task.save();
  return task;
}
