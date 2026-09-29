import { POST } from '../app/api/billing/webhook/route';
import { getStripe } from '../lib/stripe';
import { getServerSupabase } from '../lib/serverSupabase';

jest.mock('../lib/stripe', () => ({ getStripe: jest.fn() }));
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));

const rpc = jest.fn();
const constructEvent = jest.fn();
const retrieve = jest.fn();
const list = jest.fn();
const request = (signature = 'valid') => new Request('http://localhost/api/billing/webhook', {
  method: 'POST', headers: { 'stripe-signature': signature }, body: '{"event":"payload"}',
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'test-secret';
  (getStripe as jest.Mock).mockReturnValue({ webhooks: { constructEvent },
    customers: { retrieve }, subscriptions: { list } });
  (getServerSupabase as jest.Mock).mockReturnValue({ rpc });
  retrieve.mockResolvedValue({ id: 'cus_test', metadata: { clerkUserId: 'user_test' } });
  rpc.mockResolvedValue({ error: null });
  constructEvent.mockReturnValue({ type: 'customer.subscription.updated', data: { object: { customer: 'cus_test' } } });
});

it('rejects an invalid signature without updating access', async () => {
  constructEvent.mockImplementation(() => { throw new Error('Invalid signature'); });
  const response = await POST(request('tampered'));
  expect(response.status).toBe(400);
  expect(rpc).not.toHaveBeenCalled();
});

it('reconciles the current active subscription after a signed event', async () => {
  list.mockResolvedValue({ data: [{ id: 'sub_old', status: 'canceled' }, { id: 'sub_current', status: 'active' }] });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(constructEvent).toHaveBeenCalledWith('{"event":"payload"}', 'valid', 'test-secret');
  expect(rpc).toHaveBeenCalledWith('set_subscription_entitlement', {
    p_user_id: 'user_test', p_customer_id: 'cus_test', p_subscription_id: 'sub_current', p_status: 'active',
  });
});

it('reconciles cancellation and retries failed database writes', async () => {
  list.mockResolvedValue({ data: [{ id: 'sub_current', status: 'canceled' }] });
  rpc.mockResolvedValue({ error: new Error('Database unavailable') });
  expect((await POST(request())).status).toBe(500);
  expect(rpc).toHaveBeenCalledWith('set_subscription_entitlement', expect.objectContaining({ p_status: 'canceled' }));
});
