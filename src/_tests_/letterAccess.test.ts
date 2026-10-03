import { auth } from '@clerk/nextjs/server';
import { getServerSupabase } from '../lib/serverSupabase';
import { reserveSlot, finishSlot, releaseSlot } from '../lib/letterQuota';
import { POST as download } from '../app/api/letter-download/route';
import { POST as generatePaid } from '../app/api/paid-letter/route';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));
jest.mock('../lib/letterQuota', () => ({ reserveSlot: jest.fn(), finishSlot: jest.fn(), releaseSlot: jest.fn() }));

const details = { fullName: 'Alex Example', address: '123 Main St', agency: 'Equifax',
  creditor: 'Example Bank', accountReference: '1234', errorDescription: 'The balance is wrong.',
  requestedCorrection: 'correct the balance', templateId: 'wrong-balance' };
const makeRequest = (body: unknown) => new Request('http://localhost/api/letter-download', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const dbWithPlan = (plan_type: string, account_goal = 'personal') => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { plan_type, account_goal }, error: null }) }) }) }) });

beforeEach(() => {
  jest.clearAllMocks();
  (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_test' });
});

it('issues a free template download only after completing its reserved quota slot', async () => {
  (getServerSupabase as jest.Mock).mockReturnValue(dbWithPlan('free'));
  (reserveSlot as jest.Mock).mockResolvedValue('free_slot');
  (finishSlot as jest.Mock).mockResolvedValue(undefined);
  const response = await download(makeRequest(details));
  expect(response.status).toBe(200);
  expect(response.headers.get('content-disposition')).toContain('attachment');
  expect(await response.text()).toContain('Alex Example');
  expect(reserveSlot).toHaveBeenCalledWith('user_test', 'free_download');
  expect(finishSlot).toHaveBeenCalledWith('user_test', 'free_slot');
  expect(releaseSlot).not.toHaveBeenCalled();
});

it('locks a free account at three downloads without issuing another file', async () => {
  (getServerSupabase as jest.Mock).mockReturnValue(dbWithPlan('free'));
  (reserveSlot as jest.Mock).mockResolvedValue(null);
  const response = await download(makeRequest(details));
  expect(response.status).toBe(429);
  expect(await response.json()).toHaveProperty('error');
  expect(finishSlot).not.toHaveBeenCalled();
});

it('allows a paid account to download templates without consuming a free slot', async () => {
  (getServerSupabase as jest.Mock).mockReturnValue(dbWithPlan('paid'));
  const response = await download(makeRequest(details));
  expect(response.status).toBe(200);
  expect(response.headers.get('content-disposition')).toContain('attachment');
  expect(reserveSlot).not.toHaveBeenCalled();
});

it('rejects AI generation for a free account before contacting OpenAI', async () => {
  (getServerSupabase as jest.Mock).mockReturnValue(dbWithPlan('free'));
  const response = await generatePaid(makeRequest({ ...details, consent: true }));
  expect(response.status).toBe(403);
  expect(reserveSlot).not.toHaveBeenCalled();
});

it('does not consume a slot for invalid letter details', async () => {
  const response = await download(makeRequest({ ...details, templateId: 'not-real' }));
  expect(response.status).toBe(400);
  expect(reserveSlot).not.toHaveBeenCalled();
});

it('caps paid AI drafts at five successful generations per month', async () => {
  (getServerSupabase as jest.Mock).mockReturnValue(dbWithPlan('paid'));
  (reserveSlot as jest.Mock).mockResolvedValue(null);
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'test-key';
  try {
    const response = await generatePaid(makeRequest({ ...details, consent: true }));
    expect(response.status).toBe(429);
    expect(finishSlot).not.toHaveBeenCalled();
  } finally { if (previous) process.env.OPENAI_API_KEY = previous; else delete process.env.OPENAI_API_KEY; }
});

it('releases an AI slot when the provider fails', async () => {
  (getServerSupabase as jest.Mock).mockReturnValue(dbWithPlan('paid'));
  (reserveSlot as jest.Mock).mockResolvedValue('reservation-id');
  const previous = process.env.OPENAI_API_KEY;
  const previousFetch = global.fetch;
  process.env.OPENAI_API_KEY = 'test-key';
  global.fetch = jest.fn().mockResolvedValue({ ok: false });
  try {
    const response = await generatePaid(makeRequest({ ...details, consent: true }));
    expect(response.status).toBe(502);
    expect(releaseSlot).toHaveBeenCalledWith('user_test', 'reservation-id');
    expect(finishSlot).not.toHaveBeenCalled();
  } finally {
    global.fetch = previousFetch;
    if (previous) process.env.OPENAI_API_KEY = previous; else delete process.env.OPENAI_API_KEY;
  }
});


it('keeps consumer letter tools out of a business plan', async () => {
  (getServerSupabase as jest.Mock).mockReturnValue(dbWithPlan('paid', 'business'));
  const template = await download(makeRequest(details));
  const generated = await generatePaid(makeRequest({ ...details, consent: true }));
  expect(template.status).toBe(403);
  expect(generated.status).toBe(403);
  expect(reserveSlot).not.toHaveBeenCalled();
});
