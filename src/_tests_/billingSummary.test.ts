import { auth } from '@clerk/nextjs/server';
import { GET } from '../app/api/billing/route';
import { billingAccount, stripeClient } from '../lib/billing';
import { getServerSupabase } from '../lib/serverSupabase';
jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('../lib/billing', () => ({ billingAccount: jest.fn(), stripeClient: jest.fn() }));
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));
beforeEach(() => {
  jest.clearAllMocks(); delete process.env.BILLING_CHECKOUT_ENABLED;
  (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_test' });
  (getServerSupabase as jest.Mock).mockReturnValue({ from: () => ({ select: () => ({ eq: () => ({
    maybeSingle: async () => ({ data: { account_goal: 'personal', plan_type: 'free' }, error: null }),
  }) }) }) });
});
it('returns the free plan without accessing Stripe or the billing table when checkout is disabled', async () => {
  const response = await GET();
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ accountGoal: 'personal', paid: false,
    status: null, hasBillingAccount: false, checkoutEnabled: false, price: null });
  expect(stripeClient).not.toHaveBeenCalled();
  expect(billingAccount).not.toHaveBeenCalled();
});
it('keeps an existing paid subscription manageable while new checkout is disabled', async () => {
  (getServerSupabase as jest.Mock).mockReturnValue({ from: () => ({ select: () => ({ eq: () => ({
    maybeSingle: async () => ({ data: { account_goal: 'business', plan_type: 'paid' }, error: null }),
  }) }) }) });
  (billingAccount as jest.Mock).mockResolvedValue({ stripe_subscription_id: 'sub_test', status: 'active' });
  const response = await GET();
  expect(await response.json()).toEqual(expect.objectContaining({ paid: true, hasBillingAccount: true, status: 'active' }));
  expect(stripeClient).not.toHaveBeenCalled();
});
it('rejects anonymous requests', async () => {
  (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });
  expect((await GET()).status).toBe(401);
});
