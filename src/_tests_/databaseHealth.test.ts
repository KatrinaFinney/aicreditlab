import { GET } from '../app/api/cron/database-health/route';
const originalEnv = { ...process.env };
const originalFetch = global.fetch;
const mockFetch = jest.fn();
beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://wsnnriiqkcvazkvhrwdm.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'production-key';
  process.env.SUPABASE_TEST_URL = 'https://aqriexmnarkkuhplylzw.supabase.co';
  process.env.SUPABASE_TEST_ANON_KEY = 'testing-key';
  global.fetch = mockFetch;
  mockFetch.mockReset().mockImplementation(async () => Response.json(true));
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { process.env = { ...originalEnv }; global.fetch = originalFetch; jest.restoreAllMocks(); });
const request = (token = 'test-cron-secret') => new Request('https://www.aicreditlab.com/api/cron/database-health', {
  headers: { authorization: `Bearer ${token}` },
});
it('rejects missing and incorrect cron secrets before database calls', async () => {
  expect((await GET(request('wrong'))).status).toBe(401);
  delete process.env.CRON_SECRET;
  expect((await GET(request('undefined'))).status).toBe(401);
  expect(mockFetch).not.toHaveBeenCalled();
});
it('checks both databases without customer queries or returned data', async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(mockFetch).toHaveBeenCalledTimes(6);
  expect((await response.json()).checks).toEqual([{ project: 'production', ok: true }, { project: 'testing', ok: true }]);
  for (const [url, options] of mockFetch.mock.calls) {
    expect(url).toMatch(/\/rest\/v1\/rpc\/creditlab_health_check$/);
    expect(options.body).toBe('{}');
    expect(options.redirect).toBe('error');
    expect(options.headers.apikey).toBe(url.includes('wsnnriiqkcvazkvhrwdm') ? 'production-key' : 'testing-key');
  }
});
it('surfaces one database failure while checking the other', async () => {
  mockFetch.mockImplementation(async (url: string) => url.includes('aqriexmnarkkuhplylzw') ? new Response('', { status: 503 }) : Response.json(true));
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect((await response.json()).checks).toEqual([{ project: 'production', ok: true }, { project: 'testing', ok: false, reason: 'database_http_503' }]);
});
it('never contacts a mismatched project', async () => {
  process.env.SUPABASE_TEST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(mockFetch).toHaveBeenCalledTimes(3);
  expect((await response.json()).checks[1].reason).toBe('configuration_missing_or_mismatched');
});
it('reports network timeouts without exposing credentials', async () => {
  mockFetch.mockRejectedValue(new Error('do not expose key here'));
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain('do not expose');
});
it('rejects an invalid database result', async () => {
  mockFetch.mockImplementation(async () => Response.json({ ok: true }));
  expect((await GET(request())).status).toBe(503);
});
