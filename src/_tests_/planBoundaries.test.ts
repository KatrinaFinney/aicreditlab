import { auth } from '@clerk/nextjs/server';
import { GET as disputes, POST as createDispute, PATCH as updateDispute } from '../app/api/disputes/route';
import { PUT as savePlan, PATCH as activatePlan } from '../app/api/credit-plan/route';
import { getServerSupabase } from '../lib/serverSupabase';
jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));
const rpc = jest.fn(); const upsert = jest.fn(); const from = jest.fn(); const eq = jest.fn();
const request = (body: unknown) => new Request('https://example.com/api', { method: 'POST', body: JSON.stringify(body) });
beforeEach(() => {
  jest.clearAllMocks(); (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_current' });
  eq.mockReturnValue({ maybeSingle: async () => ({ data: { plan_type: 'free', account_goal: 'business' }, error: null }) });
  from.mockReturnValue({ select: () => ({ eq }), upsert });
  (getServerSupabase as jest.Mock).mockReturnValue({ from, rpc });
});
it('rejects consumer dispute reads and writes on business plans', async () => {
  expect((await disputes()).status).toBe(403);
  expect((await createDispute(request({ creditor: 'Example', agency: 'Equifax' }))).status).toBe(403);
  expect((await updateDispute(request({ id: '123', status: 'Sent' }))).status).toBe(403);
  expect(from).not.toHaveBeenCalledWith('disputes');
  expect(eq).toHaveBeenCalledWith('user_id', 'user_current');
});
it('does not let free users create an additional saved plan', async () => {
  const answers = { 1: ['Registered, no business bank account'], 2: ['Build a business credit history'], 3: ['Understanding personal guarantees'] };
  expect((await savePlan(request({ goal: 'business', answers, newPlan: true }))).status).toBe(403);
  expect(upsert).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled();
});
it('uses the signed-in identity when switching a saved plan and preserves ownership denial', async () => {
  rpc.mockResolvedValue({ error: new Error('Plan not found') });
  expect((await activatePlan(request({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', userId: 'other_user' }))).status).toBe(403);
  expect(rpc).toHaveBeenCalledWith('activate_paid_credit_plan', { p_user_id: 'user_current', p_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
});
