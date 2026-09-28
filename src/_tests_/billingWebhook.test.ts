import { POST } from '../app/api/billing/webhook/route';
import { stripeClient, syncSubscription } from '../lib/billing';

jest.mock('../lib/billing', () => ({ stripeClient: jest.fn(), syncSubscription: jest.fn() }));

const request = (signature: string | null) => new Request('https://www.aicreditlab.com/api/billing/webhook', {
  method: 'POST', headers: signature ? { 'stripe-signature': signature } : {}, body: 'raw-body',
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  (stripeClient as jest.Mock).mockReturnValue({ webhooks: { constructEvent: jest.fn() },
    subscriptions: { retrieve: jest.fn().mockResolvedValue({ id: 'sub_one', status: 'active' }) } });
});

it('rejects unsigned payloads before accessing Stripe', async () => {
  const response = await POST(request(null));
  expect(response.status).toBe(400);
  expect(stripeClient).not.toHaveBeenCalled();
});

it('rejects invalid signatures without granting access', async () => {
  (stripeClient as jest.Mock)().webhooks.constructEvent.mockImplementation(() => { throw new Error('Invalid signature'); });
  const response = await POST(request('bad'));
  expect(response.status).toBe(400);
  expect(syncSubscription).not.toHaveBeenCalled();
});

it('syncs Stripe current subscription state after a signed update', async () => {
  (stripeClient as jest.Mock)().webhooks.constructEvent.mockReturnValue({ type: 'customer.subscription.updated',
    created: 123, data: { object: { id: 'sub_one', status: 'past_due' } } });
  const response = await POST(request('valid'));
  expect(response.status).toBe(200);
  expect(syncSubscription).toHaveBeenCalledWith({ id: 'sub_one', status: 'active' }, 123);
});

it('returns a retryable error when entitlement sync fails', async () => {
  (stripeClient as jest.Mock)().webhooks.constructEvent.mockReturnValue({ type: 'customer.subscription.deleted',
    created: 124, data: { object: { id: 'sub_one' } } });
  (syncSubscription as jest.Mock).mockRejectedValue(new Error('Database unavailable'));
  const response = await POST(request('valid'));
  expect(response.status).toBe(500);
});
