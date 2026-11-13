import mongoose from 'mongoose';

// Reuses one MongoDB connection across hot reloads in development and across
// requests in production. Nothing connects until connectToDatabase() is called.

const globalCache = globalThis.__theSystemMongo ?? { conn: null, promise: null };
globalThis.__theSystemMongo = globalCache;

export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local (see .env.example).');
  }
  if (globalCache.conn) return globalCache.conn;
  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 })
      .then((m) => m)
      .catch((err) => {
        globalCache.promise = null; // allow a retry on the next call
        throw err;
      });
  }
  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

// Status for the health check: 'not_configured' | 'connected' | 'error'.
export async function getDatabaseStatus() {
  if (!isDatabaseConfigured()) {
    return { status: 'not_configured', message: 'No MONGODB_URI set yet. Needed from Phase 2.' };
  }
  try {
    const m = await connectToDatabase();
    await m.connection.db.admin().ping();
    return { status: 'connected', message: `Connected to database "${m.connection.name}".` };
  } catch (err) {
    return { status: 'error', message: friendlyError(err) };
  }
}

function friendlyError(err) {
  const msg = String(err?.message || err);
  if (/auth|authentication failed/i.test(msg)) return 'MongoDB rejected the username or password in MONGODB_URI.';
  if (/ENOTFOUND|querySrv/i.test(msg)) return 'Could not find the cluster address. Check the host in MONGODB_URI.';
  if (/timed out|Server selection/i.test(msg)) {
    return 'Timed out reaching MongoDB. In Atlas, check Network Access allows your IP address.';
  }
  return 'Could not connect to MongoDB. Check MONGODB_URI.';
}
