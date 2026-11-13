import { getCurrentUser } from '@/lib/auth/current-user';
import { serverError } from '@/lib/auth/service';
import { getPlayer } from '@/lib/player/service';
import { designRubric } from '@/lib/ai/rubric-design';
import { PROVIDER_IDS } from '@/lib/ai/providers';
import { saveRubric, toRubricDto } from '@/lib/rubric/service';

export const dynamic = 'force-dynamic';

// POST /api/rubric/design: ask the AI (or the local design) for XP parameters from the goals.
// The API key arrives in this request only. It is used once and not stored.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  try {
    const player = await getPlayer(user.id);
    const goals = player?.goals || '';
    const provider = PROVIDER_IDS.includes(body.provider) ? body.provider : player?.provider || 'gemini';
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim().slice(0, 300) : '';

    const design = await designRubric({ goals, provider, apiKey });
    const saved = await saveRubric(user.id, design.parameters, design.source);
    return Response.json({ rubric: toRubricDto(saved), note: design.note || '' });
  } catch (err) {
    return serverError(err);
  }
}
