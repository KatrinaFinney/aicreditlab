import { auth, currentUser } from '@clerk/nextjs/server';
import { POST } from '../app/api/billing/checkout/route';
import { getStripe } from '../lib/stripe';
import { getServerSupabase } from '../lib/serverSupabase';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn(), currentUser: jest.fn() }));
jest.mock('../lib/stripe', () => ({ getStripe: jest.fn(), monthlyPriceCents: 999 }));
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));

it('creates a signed-in $9.99 monthly Stripe subscription without granting access on redirect', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'test-secret';
  (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_test' });
  (currentUser as jest.Mock).mockResolvedValue({ primaryEmailAddress: { emailAddress: 'test@example.com' } });
  const create = jest.fn().mockResolvedValue({ id: 'cus_test' });
  const sessionCreate = jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' });
  (getStripe as jest.Mock).mockReturnValue({ customers: { create }, checkout: { sessions: { create: sessionCreate } } });
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const from = jest.fn().mockReturnValue({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }), upsert,
  });
  (getServerSupabase as jest.Mock).mockReturnValue({ from });

  const response = await POST(new Request('https://example.com/api/billing/checkout', { method: 'POST' }));
  expect(response.status).toBe(200);
  expect(sessionCreate).toHaveBeenCalledWith(expect.objectContaining({
    mode: 'subscription', client_reference_id: 'user_test',
    line_items: [expect.objectContaining({ price_data: expect.objectContaining({
      currency: 'usd', unit_amount: 999, recurring: { interval: 'month' },
    }) })],
  }));
  expect(from).toHaveBeenCalledWith('billing_subscriptions');
  expect(from).not.toHaveBeenCalledWith('credit_plans');
});
