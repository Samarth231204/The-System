import { endSession } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

// POST /api/auth/logout clears the session cookie.
export async function POST() {
  await endSession();
  return Response.json({ ok: true });
}
