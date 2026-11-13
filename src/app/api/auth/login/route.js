import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { verifyPassword } from '@/lib/auth/password';
import { validateLogin, startSession, serverError } from '@/lib/auth/service';

export const dynamic = 'force-dynamic';

// POST /api/auth/login  { email, password }
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const problem = validateLogin(body);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  const email = body.email.trim().toLowerCase();
  try {
    await connectToDatabase();
    const user = await User.findOne({ email }).select('+passwordHash').lean();
    const ok = user && (await verifyPassword(body.password, user.passwordHash));
    // The same message for unknown email and wrong password, so the form can't be used to find accounts.
    if (!ok) return Response.json({ error: 'Email or password is incorrect.' }, { status: 401 });

    await startSession(user._id);
    return Response.json({ ok: true, user: { id: String(user._id), email: user.email } });
  } catch (err) {
    return serverError(err);
  }
}
