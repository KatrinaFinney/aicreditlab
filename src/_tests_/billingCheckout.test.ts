import { auth, currentUser } from '@clerk/nextjs/server';
import { POST } from '../app/api/billing/checkout/route';
import { stripeClient, billingAccount, getOrCreateCustomer } from '../lib/billing';
import { getServerSupabase } from '../lib/serverSupabase';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn(), currentUser: jest.fn() }));
jest.mock('../lib/billing', () => ({ stripeClient: jest.fn(), billingAccount: jest.fn(), getOrCreateCustomer: jest.fn(), appUrl: () => 'https://example.com' }));
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));
const create = jest.fn();
const list = jest.fn();
const pending = jest.fn();
const retrieve = jest.fn();
const price = { id: 'price_monthly', active: true, type: 'recurring', currency: 'usd', unit_amount: 999,
  recurring: { interval: 'month', interval_count: 1 } };
let goal: string | null;
beforeEach(() => {
  jest.clearAllMocks(); goal = 'personal';
  process.env.STRIPE_SECRET_KEY = 'sk_test_example'; process.env.STRIPE_PRICE_ID = price.id;
  process.env.STRIPE_WEBHOOK_SECRET = 'test-secret';
  (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_test' });
  (currentUser as jest.Mock).mockResolvedValue({ primaryEmailAddress: { emailAddress: 'test@example.com' } });
  (billingAccount as jest.Mock).mockResolvedValue(null);
  (getOrCreateCustomer as jest.Mock).mockResolvedValue('cus_test');
  retrieve.mockResolvedValue(price); list.mockResolvedValue({ data: [], has_more: false });
  pending.mockResolvedValue({ data: [], has_more: false });
  create.mockResolvedValue({ url: 'https://checkout.stripe.com/test' });
  (stripeClient as jest.Mock).mockReturnValue({ prices: { retrieve }, subscriptions: { list }, checkout: { sessions: { create, list: pending } } });
  (getServerSupabase as jest.Mock).mockReturnValue({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: goal ? { account_goal: goal, questionnaire_completed: true } : null, error: null }) }) }) }) });
});
it('uses the validated monthly Price ID without granting paid access on redirect', async () => {
  expect((await POST()).status).toBe(200);
  expect(create).toHaveBeenCalledWith(expect.objectContaining({ mode: 'subscription', client_reference_id: 'user_test',
    line_items: [{ price: price.id, quantity: 1 }], subscription_data: { metadata: { clerkUserId: 'user_test' } } }), expect.objectContaining({ idempotencyKey: expect.stringContaining('aicreditlab-checkout-cus_test-price_monthly-') }));
});
it('rejects business checkout and missing assessments before creating customers', async () => {
  goal = 'business'; expect((await POST()).status).toBe(403);
  goal = null; expect((await POST()).status).toBe(409);
  expect(getOrCreateCustomer).not.toHaveBeenCalled();
});
it('requires webhook readiness and the agreed monthly price', async () => {
  delete process.env.STRIPE_WEBHOOK_SECRET; expect((await POST()).status).toBe(503);
  process.env.STRIPE_WEBHOOK_SECRET = 'test'; retrieve.mockResolvedValue({ ...price, unit_amount: 1999 });
  expect((await POST()).status).toBe(503); expect(create).not.toHaveBeenCalled();
});
it.each(['active','trialing','past_due','unpaid','paused','incomplete'])('prevents a second checkout while %s', async (status) => {
  list.mockResolvedValue({ data: [{ status }], has_more: false });
  expect((await POST()).status).toBe(409); expect(create).not.toHaveBeenCalled();
});
it('rejects unsigned users', async () => {
  (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });
  expect((await POST()).status).toBe(401); expect(create).not.toHaveBeenCalled();
});

it('reuses an open checkout instead of creating another payment session', async () => {
  pending.mockResolvedValue({ data: [{ mode: 'subscription', metadata: { priceId: price.id }, url: 'https://checkout.stripe.com/existing' }], has_more: false });
  const response = await POST();
  expect(await response.json()).toEqual({ url: 'https://checkout.stripe.com/existing' });
  expect(create).not.toHaveBeenCalled();
});
