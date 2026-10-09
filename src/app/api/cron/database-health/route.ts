import { timingSafeEqual } from 'node:crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;
const headers = { 'Cache-Control': 'no-store' };
type Check = { project: string; ok: boolean; reason?: string };

async function check(project: string, url: string | undefined, key: string | undefined, ref: string): Promise<Check> {
  // Pin checks to their intended databases, never request-supplied URLs.
  if (url !== `https://${ref}.supabase.co` || !key)
    return { project, ok: false, reason: 'configuration_missing_or_mismatched' };
  try {
    // A few tiny daily database queries. No customer tables, writes, or AI calls.
    const results = await Promise.all(Array.from({ length: 3 }, async () => {
      const response = await fetch(`${url}/rest/v1/rpc/creditlab_health_check`, {
        method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
        body: '{}', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return `database_http_${response.status}`;
      return await response.json() === true ? null : 'unexpected_database_response';
    }));
    const reason = results.find(result => result !== null);
    return reason ? { project, ok: false, reason } : { project, ok: true };
  } catch { return { project, ok: false, reason: 'database_unreachable_or_timeout' }; }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret ?? ''}`);
  if (!secret || supplied.length !== expected.length || !timingSafeEqual(supplied, expected))
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  const checks = await Promise.all([
    check('production', process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_HEALTH_ANON_KEY, 'wsnnriiqkcvazkvhrwdm'),
    check('testing', process.env.SUPABASE_TEST_URL,
      process.env.SUPABASE_TEST_ANON_KEY, 'aqriexmnarkkuhplylzw'),
  ]);
  const ok = checks.every(result => result.ok);
  const result = { ok, checkedAt: new Date().toISOString(), checks };
  if (ok) console.info('Database health check passed', result);
  else console.error('Database health check failed', result);
  return Response.json(result, { status: ok ? 200 : 503, headers });
}
