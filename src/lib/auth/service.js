import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from './session';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns an error message for bad sign-up input, or null if it is valid.
export function validateSignup(body) {
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return 'Enter an email and a password.';
  }
  if (!EMAIL_PATTERN.test(body.email.trim())) return 'Enter a valid email address.';
  if (body.password.length < 8) return 'Password must be at least 8 characters.';
  if (body.password.length > 200) return 'Password is too long.';
  return null;
}

// Returns an error message for bad login input, or null if it is present.
export function validateLogin(body) {
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || !body.email.trim() || !body.password) {
    return 'Enter your email and password.';
  }
  return null;
}

export async function startSession(userId) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// Turns an unexpected error into a safe JSON response that says what to fix.
export function serverError(err) {
  console.error('[auth]', err);
  if (err?.code === 11000) {
    return Response.json({ error: 'An account with this email already exists. Try logging in.' }, { status: 409 });
  }
  const msg = String(err?.message || '');
  let error = 'Something went wrong. Check the server log and try again.';
  if (/AUTH_SECRET/.test(msg)) error = 'The server is missing AUTH_SECRET. Add it to .env.local and restart.';
  else if (/MONGODB_URI/.test(msg)) error = 'The database is not configured. Add MONGODB_URI to .env.local and restart.';
  else if (/Server selection|ENOTFOUND|authentication failed|timed out/i.test(msg)) {
    error = 'Could not reach the database. Check MONGODB_URI and Atlas Network Access.';
  }
  return Response.json({ error }, { status: 500 });
}
