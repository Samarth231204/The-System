import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { SESSION_COOKIE, readSessionToken } from './session';

// Returns { id, email } for the logged-in player, or null.
// The database is only touched when a valid session cookie is present.
export async function getCurrentUser() {
  const store = await cookies();
  const uid = readSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!uid) return null;

  await connectToDatabase();
  const user = await User.findById(uid).lean();
  if (!user) return null;
  return { id: String(user._id), email: user.email };
}
