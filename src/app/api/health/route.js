import { getDatabaseStatus } from '@/lib/db/connect';

export const dynamic = 'force-dynamic';

// GET /api/health: reports whether the app and the database are reachable.
export async function GET() {
  const db = await getDatabaseStatus();
  return Response.json({ app: 'ok', phase: 1, database: db });
}
