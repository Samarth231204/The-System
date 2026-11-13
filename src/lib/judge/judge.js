// Scores a completed quest on each XP parameter, from 0 to 10.
// XP per parameter = score x weight x 2, so a perfect 10 on a weight-5 parameter is 100 XP.
export const XP_MULTIPLIER = 2;

export function xpFor(score, weight) {
  return Math.round(score * weight * XP_MULTIPLIER);
}

export const JUDGE_SYSTEM = `You judge one completed task for a personal XP game.
You receive the task and a list of XP parameters with their descriptions.
For each parameter, give a whole-number score from 0 (no contribution) to 10 (excellent contribution),
and one short reason (under 200 characters) that names what in the task earned or missed the score.
Be fair and specific. Reply with JSON only, in this exact shape:
{"scores":[{"key":"parameter-key","score":0-10,"reason":"..."}]}`;

export function buildJudgePrompt(task, parameters) {
  const list = parameters.map((p) => `- key: ${p.key} | ${p.label} (weight ${p.weight}): ${p.description}`).join('\n');
  return `Task type: ${task.kind}\nTask title: ${task.title}\nTask details: ${task.details || '(none)'}\n\nParameters:\n${list}`;
}

// Parses and checks the AI reply. Every parameter must be scored exactly once.
export function parseJudgeReply(text, parameters) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The judge reply had no JSON.');
  const obj = JSON.parse(text.slice(start, end + 1));
  if (!Array.isArray(obj.scores)) throw new Error('The judge reply had no scores.');

  const byKey = new Map();
  for (const s of obj.scores) {
    const score = Number(s?.score);
    if (!Number.isInteger(score) || score < 0 || score > 10) throw new Error('A judge score was outside 0 to 10.');
    byKey.set(String(s.key), { score, reason: String(s.reason || '').trim().slice(0, 200) });
  }
  return parameters.map((p) => {
    const hit = byKey.get(p.key);
    if (!hit) throw new Error(`The judge skipped "${p.label}".`);
    return { key: p.key, label: p.label, weight: p.weight, score: hit.score, reason: hit.reason || 'No reason given.' };
  });
}

// On-device judge: rewards detail, and matches parameter words against the title and details.
export function localJudge(task, parameters) {
  const text = `${task.title} ${task.details || ''}`.toLowerCase();
  const words = (task.details || '').trim().split(/\s+/).filter(Boolean).length;
  const base = task.details ? Math.min(6, 3 + Math.floor(words / 8)) : 4;

  return parameters.map((p) => {
    const keywords = `${p.label} ${p.description}`
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 4 && !['earns', 'work', 'what', 'here', 'your', 'brings', 'protects', 'outside', 'daily', 'showing', 'finishing'].includes(w));
    const hits = keywords.filter((w) => text.includes(w)).length;
    const score = Math.min(10, base + Math.min(3, hits) * 2);
    const reason = hits
      ? `Matched ${hits} keyword${hits > 1 ? 's' : ''} for ${p.label.toLowerCase()} on this device.`
      : `Scored on detail alone on this device. Add words that connect to ${p.label.toLowerCase()} to earn more.`;
    return { key: p.key, label: p.label, weight: p.weight, score, reason };
  });
}
