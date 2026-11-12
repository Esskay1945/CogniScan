import { createClient } from 'npm:@supabase/supabase-js@2.119.0';
import { GoogleAuth } from 'npm:google-auth-library@10.6.2';

const table = 'cogniscan_reminder_devices';
const message = { title: 'CogniScan', body: 'Your daily training is ready.' };

function isDue(timeZone: string, now: Date) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return values.hour === '19' ? `${values.year}-${values.month}-${values.day}` : null;
  } catch {
    return null;
  }
}

Deno.serve(async request => {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  const secret = Deno.env.get('TRAINING_CRON_SECRET');
  if (!secret || request.headers.get('Authorization') !== `Bearer ${secret}`) {
    return new Response(null, { status: 401 });
  }

  try {
    const service = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_JSON') ?? '');
    const auth = new GoogleAuth({
      credentials: service,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    const token = await auth.getAccessToken();
    if (!token) throw new Error('FCM access token unavailable');
    const endpoint = `https://fcm.googleapis.com/v1/projects/${service.project_id}/messages:send`;
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const now = new Date();
    let sent = 0;
    let failed = 0;
    // Read every page before sending because invalid registrations may be removed below.
    const devices = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db.from(table)
        .select('user_id,installation,token,time_zone,last_reminder_day')
        .order('user_id').order('installation').range(offset, offset + 499);
      if (error) throw error;
      devices.push(...data);
      if (data.length < 500) break;
    }

    for (const device of devices) {
      const day = isDue(device.time_zone, now);
      if (!day || device.last_reminder_day === day) continue;
      const claim = db.from(table).update({ last_reminder_day: day })
        .eq('user_id', device.user_id).eq('installation', device.installation).eq('token', device.token);
      const { data, error } = await (device.last_reminder_day
        ? claim.eq('last_reminder_day', device.last_reminder_day)
        : claim.is('last_reminder_day', null)).select('installation').maybeSingle();
      if (error) { failed++; continue; }
      if (!data) continue;

      const result = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { token: device.token, notification: message, android: { notification: { channel_id: 'training' } } } }),
      }).catch(() => null);
      if (result?.ok) { sent++; continue; }
      failed++;
      const details = result && await result.json().catch(() => null);
      if (details?.error?.details?.some((detail: { errorCode?: string }) => detail.errorCode === 'UNREGISTERED')) {
        await db.from(table).delete().eq('user_id', device.user_id)
          .eq('installation', device.installation).eq('token', device.token);
      } else if (result) {
        await db.from(table).update({ last_reminder_day: device.last_reminder_day })
          .eq('user_id', device.user_id).eq('installation', device.installation).eq('last_reminder_day', day);
      }
    }
    return Response.json({ sent, failed });
  } catch {
    return Response.json({ error: 'Reminder delivery failed' }, { status: 500 });
  }
});
