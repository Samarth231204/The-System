import { getCurrentUser } from '@/lib/auth/current-user';
import { connectToDatabase } from '@/lib/db/connect';
import { Player } from '@/lib/db/models/Player';
import { getPlayer, toPlayerDto, parseProfileUpdate } from '@/lib/player/service';
import { serverError } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

// GET /api/player: the logged-in player's profile (or null before onboarding starts).
export async function GET() {
  const user = await requireUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });
  try {
    return Response.json({ player: toPlayerDto(await getPlayer(user.id)) });
  } catch (err) {
    return serverError(err);
  }
}

// PUT /api/player: create or update the profile. Only the fields sent are changed.
export async function PUT(request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: 'Log in first.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { value, error } = parseProfileUpdate(body);
  if (error) return Response.json({ error }, { status: 400 });

  try {
    await connectToDatabase();
    const player = await Player.findOneAndUpdate(
      { userId: user.id },
      { $set: value, $setOnInsert: { userId: user.id } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    return Response.json({ player: toPlayerDto(player) });
  } catch (err) {
    return serverError(err);
  }
}
