import { auth } from '@clerk/nextjs/server';
import { GET as readPlan } from '../app/api/credit-plan/route';
import { GET as readProgress, PUT as updateProgress } from '../app/api/credit-progress/route';
import { getServerSupabase } from '../lib/serverSupabase';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));
const eq = jest.fn();
const upsert = jest.fn();
const fixtures: Record<string, Record<string, unknown>> = {
  personal: { credit_plans: { plan_type: 'free', account_goal: 'personal', credit_plan: ['Personal step'] },
    credit_plan_progress: { completed_steps: ['Personal step'], focus_mode: true, session_minutes: 5 } },
  business: { credit_plans: { plan_type: 'free', account_goal: 'business', credit_plan: ['Business step'] },
    credit_plan_progress: { completed_steps: [], focus_mode: false, session_minutes: 20 } },
};
beforeEach(() => {
  jest.clearAllMocks();
  (getServerSupabase as jest.Mock).mockReturnValue({ from: (table: string) => ({
    select: () => ({ eq: (column: string, value: string) => {
      eq(column, value);
      return { maybeSingle: async () => ({ data: column === 'user_id' ? fixtures[value]?.[table] : null, error: null }) };
    } }), upsert,
  }) });
});
it.each(['personal', 'business'])('reads only the signed-in %s account plan and preferences', async (userId) => {
  (auth as unknown as jest.Mock).mockResolvedValue({ userId });
  const plan = await (await readPlan()).json();
  const progress = await (await readProgress()).json();
  expect(plan.plan).toEqual(fixtures[userId].credit_plans);
  expect(plan.savedPlans).toEqual([]);
  expect(progress).toEqual(userId === 'personal'
    ? { completedSteps: ['Personal step'], focusMode: true, sessionMinutes: 5 }
    : { completedSteps: [], focusMode: false, sessionMinutes: 20 });
  expect(eq.mock.calls).toEqual([['user_id', userId], ['user_id', userId]]);
});
it('rejects another account’s step even when the request spoofs its user ID', async () => {
  (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'business' });
  const response = await updateProgress(new Request('https://example.com/api/credit-progress', {
    method: 'PUT', body: JSON.stringify({ step: 'Personal step', completed: true, userId: 'personal' }),
  }));
  expect(response.status).toBe(400);
  expect(upsert).not.toHaveBeenCalled();
  expect(eq).toHaveBeenCalledWith('user_id', 'business');
});
it('rejects unsigned plan and progress reads before accessing the database', async () => {
  (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });
  expect((await readPlan()).status).toBe(401);
  expect((await readProgress()).status).toBe(401);
  expect(getServerSupabase).not.toHaveBeenCalled();
});
