import { connectToDatabase } from '@/lib/db/connect';
import { Player } from '@/lib/db/models/Player';
import { AVATAR_IDS } from '@/lib/avatars';

// Returns the player profile for a user, or null if none exists yet.
export async function getPlayer(userId) {
  await connectToDatabase();
  return Player.findOne({ userId }).lean();
}

// Public shape sent to the browser. Never includes secrets.
export function toPlayerDto(p) {
  if (!p) return null;
  return {
    playerName: p.playerName,
    purpose: p.purpose,
    avatarId: p.avatarId,
    provider: p.provider,
    goals: p.goals,
    onboarded: Boolean(p.onboardedAt),
    settings: p.settings,
  };
}

const PROVIDERS = ['gemini', 'claude', 'openai'];

// Validates a partial profile update. Returns { value } or { error }.
export function parseProfileUpdate(body) {
  if (!body || typeof body !== 'object') return { error: 'Send the profile as JSON.' };
  const out = {};
  if ('playerName' in body) {
    const name = String(body.playerName ?? '').trim();
    if (!name || name.length > 24) return { error: 'Player name must be 1 to 24 characters.' };
    out.playerName = name;
  }
  if ('purpose' in body) {
    const purpose = String(body.purpose ?? '').trim();
    if (purpose.length > 160) return { error: 'Purpose must be 160 characters or fewer.' };
    out.purpose = purpose;
  }
  if ('avatarId' in body) {
    if (!AVATAR_IDS.includes(body.avatarId)) return { error: 'Choose one of the listed avatars.' };
    out.avatarId = body.avatarId;
  }
  if ('provider' in body) {
    if (!PROVIDERS.includes(body.provider)) return { error: 'Choose Gemini, Claude or OpenAI.' };
    out.provider = body.provider;
  }
  if ('goals' in body) {
    const goals = String(body.goals ?? '').trim();
    if (goals.length > 1000) return { error: 'Goals must be 1000 characters or fewer.' };
    out.goals = goals;
  }
  if (body.onboarded === true) out.onboardedAt = new Date();
  if (body.onboarded === false) out.onboardedAt = null;
  return { value: out };
}
