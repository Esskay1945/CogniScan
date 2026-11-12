import { GoogleAuth } from 'google-auth-library';

export async function sendReminders(pool, serviceJson, now = new Date()) {
  if (!serviceJson) throw new Error('FCM is not configured.');
  const credentials = JSON.parse(serviceJson);
  const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/firebase.messaging'] });
  const bearer = await auth.getAccessToken();
  if (!bearer) throw new Error('FCM access token unavailable.');
  const endpoint = `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(credentials.project_id)}/messages:send`;
  let sent = 0;
  let failed = 0;
  // Compare the time-zone names with PostgreSQL's list before applying them.
  const { rows } = await pool.query(`select d.user_id, d.installation, d.token, d.last_reminder_day::text,
    ($1::timestamptz at time zone tz.name)::date::text as day
    from cogniscan.reminder_device d join pg_timezone_names tz on tz.name = d.time_zone
    where extract(hour from $1::timestamptz at time zone tz.name) = 19
    and d.last_reminder_day is distinct from ($1::timestamptz at time zone tz.name)::date`, [now.toISOString()]);
  for (const device of rows) {
    const scope = [device.user_id, device.installation, device.token];
    const claim = await pool.query(`update cogniscan.reminder_device set last_reminder_day = $4
      where user_id = $1 and installation = $2 and token = $3
      and last_reminder_day is not distinct from $5::date`, [...scope, device.day, device.last_reminder_day]);
    if (!claim.rowCount) continue;
    const result = await fetch(endpoint, {
      method: 'POST',
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: {
        token: device.token,
        notification: { title: 'CogniScan', body: 'Your daily training is ready.' },
        android: { notification: { channel_id: 'training' } },
      } }),
    }).catch(() => null);
    if (result?.ok) { sent++; continue; }
    failed++;
    const response = result && await result.json().catch(() => null);
    if (response?.error?.details?.some(detail => detail.errorCode === 'UNREGISTERED')) {
      await pool.query('delete from cogniscan.reminder_device where user_id=$1 and installation=$2 and token=$3', scope);
    } else if (result) {
      await pool.query(`update cogniscan.reminder_device set last_reminder_day=$4
        where user_id=$1 and installation=$2 and token=$3 and last_reminder_day=$5`,
      [...scope, device.last_reminder_day, device.day]);
    }
  }
  return { sent, failed };
}
