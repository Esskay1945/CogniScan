import { Pool } from 'pg';
import { PostgresDialect } from 'kysely';
import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';

export function createDatabase(env = process.env) {
  const { DATABASE_URL, BETTER_AUTH_SECRET } = env;
  const BETTER_AUTH_URL = env.BETTER_AUTH_URL || env.RENDER_EXTERNAL_URL;
  if (!DATABASE_URL || !BETTER_AUTH_URL || !BETTER_AUTH_SECRET || BETTER_AUTH_SECRET.length < 32) {
    throw new Error('Configure DATABASE_URL, BETTER_AUTH_URL and a BETTER_AUTH_SECRET of at least 32 characters.');
  }
  const url = new URL(BETTER_AUTH_URL);
  if (env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('BETTER_AUTH_URL must use HTTPS in production.');
  }
  const trustedOrigins = (env.COGNISCAN_WEB_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  const pool = new Pool({
    connectionString: DATABASE_URL,
    enableChannelBinding: true,
    max: 5,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 20000,
  });
  pool.on('error', () => console.error('An idle database connection closed.'));
  const auth = betterAuth({
    database: { dialect: new PostgresDialect({ pool }), type: 'postgres', schemaName: 'cogniscan' },
    baseURL: BETTER_AUTH_URL,
    secret: BETTER_AUTH_SECRET,
    trustedOrigins,
    advanced: { ipAddress: { ipAddressHeaders: ['x-cogniscan-client-ip'] } },
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    plugins: [bearer({ requireSignature: true })],
    rateLimit: { enabled: true, storage: 'database' },
  });
  return { pool, auth, trustedOrigins };
}
