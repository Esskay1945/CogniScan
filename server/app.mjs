import { timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { sendReminders } from './reminders.mjs';

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const isObject = value => !!value && typeof value === 'object' && !Array.isArray(value);

function matchesSecret(provided, secret) {
  if (!secret || typeof provided !== 'string') return false;
  const actual = Buffer.from(provided);
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createApp({ pool, auth, trustedOrigins }, env = process.env) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const origin = req.get('Origin');
    if (origin && trustedOrigins.includes(origin)) {
      res.vary('Origin');
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Expose-Headers': 'set-auth-token',
      });
      if (req.method === 'OPTIONS') return res.sendStatus(204);
    }
    next();
  });

  app.all('/api/auth/*splat', (req, _res, next) => {
    req.headers['x-cogniscan-client-ip'] = req.ip;
    next();
  }, toNodeHandler(auth));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', async (_req, res) => {
    await pool.query('select 1 from cogniscan.progress limit 1');
    res.json({ ready: true });
  });

  app.post('/internal/training-reminders', async (req, res) => {
    if (!matchesSecret(req.get('Authorization'), env.TRAINING_CRON_SECRET)) return res.sendStatus(401);
    res.json(await sendReminders(pool, env.FCM_SERVICE_ACCOUNT_JSON));
  });

  app.use('/api', async (req, res, next) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user?.id) return res.status(401).json({ message: 'Sign in to continue.' });
    res.locals.uid = session.user.id;
    next();
  });

  app.get('/api/progress', async (_req, res) => {
    const { rows } = await pool.query('select state, revision from cogniscan.progress where user_id = $1', [res.locals.uid]);
    res.json(rows[0] ?? { state: null, revision: 0 });
  });

  app.put('/api/progress', async (req, res) => {
    const { state, revision } = req.body ?? {};
    if (!isObject(state) || !Number.isInteger(revision) || revision < 0 || revision >= 2147483647) {
      return res.status(400).json({ message: 'Invalid progress update.' });
    }
    const values = [res.locals.uid, JSON.stringify(state)];
    const { rows } = revision === 0
      ? await pool.query(`insert into cogniscan.progress (user_id, state, revision) values ($1, $2, 1)
          on conflict (user_id) do nothing returning revision`, values)
      : await pool.query(`update cogniscan.progress set state = $2, revision = revision + 1
          where user_id = $1 and revision = $3 returning revision`, [...values, revision]);
    if (!rows.length) return res.status(409).json({ message: 'Your progress changed on another device. This device kept its local copy.' });
    res.json(rows[0]);
  });

  app.delete('/api/progress', async (_req, res) => {
    await pool.query(`with removed_devices as (delete from cogniscan.reminder_device where user_id = $1)
      delete from cogniscan.progress where user_id = $1`, [res.locals.uid]);
    res.sendStatus(204);
  });

  app.put('/api/reminders/:installation', async (req, res) => {
    const { installation } = req.params;
    const { token, timeZone } = req.body ?? {};
    if (!uuid.test(installation) || typeof token !== 'string' || token.length < 1 || token.length > 2048
      || typeof timeZone !== 'string' || timeZone.length > 100) {
      return res.status(400).json({ message: 'Invalid reminder registration.' });
    }
    try { new Intl.DateTimeFormat('en', { timeZone }); }
    catch { return res.status(400).json({ message: 'Invalid reminder time zone.' }); }
    await pool.query(`insert into cogniscan.reminder_device (user_id, installation, token, time_zone)
      values ($1, $2, $3, $4) on conflict (user_id, installation)
      do update set token = excluded.token, time_zone = excluded.time_zone`, [res.locals.uid, installation, token, timeZone]);
    res.sendStatus(204);
  });

  app.delete('/api/reminders/:installation', async (req, res) => {
    if (!uuid.test(req.params.installation)) return res.sendStatus(400);
    await pool.query('delete from cogniscan.reminder_device where user_id = $1 and installation = $2', [res.locals.uid, req.params.installation]);
    res.sendStatus(204);
  });

  if (env.COGNISCAN_SERVE_WEB === '1') {
    app.use(express.static(fileURLToPath(new URL('../dist/', import.meta.url))));
  }

  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Progress is too large to sync.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid request body.' });
    console.error('CogniScan API request failed.', error.code || error.name);
    res.status(503).json({ message: 'CogniScan is temporarily unavailable.' });
  });
  return app;
}
