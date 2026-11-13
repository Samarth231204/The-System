import { callProvider } from './providers';
import { validateParameters, slugify } from '@/lib/rubric/validate';

const SYSTEM = `You design the XP system for a personal productivity game.
Given a player's goals, return JSON only, in this exact shape:
{"parameters":[{"label":"Short name","weight":1-5,"description":"One sentence on what earns XP here"}]}
Rules: 3 to 6 parameters. Each parameter must come from the goals. Always keep a discipline parameter.
Weights are whole numbers from 1 (minor) to 5 (major). No other keys.`;

// Asks the chosen provider to design parameters from the goals. Falls back to local design on any problem.
export async function designRubric({ goals, provider, apiKey }) {
  if (!apiKey) return { parameters: localRubric(goals).parameters, source: 'local', note: 'No API key. Built from your goals on this device.' };

  try {
    const text = await callProvider({ provider, apiKey, system: SYSTEM, user: `Goals:\n${goals || '(none given)'}` });
    const parsed = parseDesign(text);
    const check = validateParameters(parsed);
    if (check.error) throw new Error(check.error);
    return { parameters: check.value, source: 'ai' };
  } catch (err) {
    const fallback = localRubric(goals);
    return { parameters: fallback.parameters, source: 'local', note: `${err.message} Used the on-device design instead.` };
  }
}

// Pulls the first JSON object out of a model reply and returns its parameters list.
export function parseDesign(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The AI reply had no JSON.');
  const obj = JSON.parse(text.slice(start, end + 1));
  if (!Array.isArray(obj.parameters)) throw new Error('The AI reply had no parameters.');
  return obj.parameters.map((p) => ({ ...p, key: slugify(p.label) }));
}

// Keyword-based design used when no key is present or the AI call fails.
const THEMES = [
  { label: 'Money', words: ['money', 'income', 'earn', 'freelance', 'salary', 'finance', 'savings', 'client', 'revenue'], desc: 'Work that brings in income or protects your finances.' },
  { label: 'Knowledge', words: ['learn', 'study', 'course', 'prep', 'dsa', 'skill', 'read', 'exam', 'certificate', 'research'], desc: 'Study, practice and building understanding.' },
  { label: 'Health', words: ['health', 'fit', 'gym', 'run', 'sleep', 'diet', 'exercise', 'workout', 'body', 'walk'], desc: 'Training, rest and looking after your body.' },
  { label: 'Career', words: ['job', 'intern', 'interview', 'resume', 'career', 'application', 'hire', 'offer'], desc: 'Applications, interviews and professional growth.' },
  { label: 'Creativity', words: ['art', 'music', 'write', 'video', 'design', 'create', 'draw', 'content'], desc: 'Making things: writing, art, video and design.' },
  { label: 'Discipline', words: ['habit', 'consistent', 'routine', 'focus', 'discipline', 'daily', 'streak', 'procrastinat'], desc: 'Showing up, finishing what you start and keeping routines.' },
];

export function localRubric(goals = '') {
  const text = goals.toLowerCase();
  const scored = THEMES.map((t) => ({ ...t, hits: t.words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0) }));
  const chosen = scored.filter((t) => t.hits > 0 || t.label === 'Discipline' || t.label === 'Money' || t.label === 'Knowledge');
  const ranked = chosen.sort((a, b) => b.hits - a.hits).slice(0, 5);
  if (!ranked.some((t) => t.label === 'Discipline')) ranked.push(scored.find((t) => t.label === 'Discipline'));
  const parameters = ranked.map((t) => ({
    key: slugify(t.label),
    label: t.label,
    weight: Math.min(5, Math.max(2, 2 + t.hits)),
    description: t.desc,
  }));
  return { parameters, source: 'local' };
}
