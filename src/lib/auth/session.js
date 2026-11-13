import { createHmac, timingSafeEqual } from 'node:crypto';

// Sessions are signed tokens stored in an httpOnly cookie: payload.signature.
// The payload holds the user id and an expiry time. The signature uses AUTH_SECRET,
// so a token cannot be forged or edited without the secret.

export const SESSION_COOKIE = 'ts_session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // seconds

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error('AUTH_SECRET is missing or too short. Set it in .env.local (see .env.example).');
  }
  return value;
}

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(userId) {
  const payload = Buffer.from(
    JSON.stringify({ uid: String(userId), exp: Date.now() + SESSION_MAX_AGE * 1000 })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

// Returns the user id if the token is genuine and unexpired, otherwise null.
export function readSessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.uid || !(data.exp > Date.now())) return null;
    return data.uid;
  } catch {
    return null;
  }
}
