import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { hashPassword } from '@/lib/auth/password';
import { validateSignup, startSession, serverError } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

// POST /api/auth/signup  { email, password }
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const problem = validateSignup(body);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  const email = body.email.trim().toLowerCase();
  try {
    await connectToDatabase();
    if (await User.exists({ email })) {
      return Response.json({ error: 'An account with this email already exists. Try logging in.' }, { status: 409 });
    }
    const user = await User.create({ email, passwordHash: await hashPassword(body.password) });
    await startSession(user._id);
    return Response.json({ ok: true, user: { id: String(user._id), email } }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
