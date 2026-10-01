import { POST } from '../app/api/billing/webhook/route';
import { stripeClient, assertBillingMode } from '../lib/billing';
import { getServerSupabase } from '../lib/serverSupabase';
jest.mock('../lib/billing', () => ({ stripeClient: jest.fn(), assertBillingMode: jest.fn() }));
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));
const rpc = jest.fn(); const constructEvent = jest.fn(); const list = jest.fn();
const price = { id: 'price_monthly', active: true, type: 'recurring', currency: 'usd', unit_amount: 999,
  recurring: { interval: 'month', interval_count: 1 } };
const subscription = (id: string, status: string, priceId = price.id) => ({ id, status, livemode: true, items: { data: [{ price: { ...price, id: priceId } }] } });
const request = (signature = 'valid') => new Request('https://example.com/api/billing/webhook', {
  method: 'POST', headers: { 'stripe-signature': signature }, body: '{"event":"payload"}',
});
beforeEach(() => {
  jest.resetAllMocks(); process.env.STRIPE_WEBHOOK_SECRET = 'test-secret'; process.env.STRIPE_PRICE_ID = price.id;
  (stripeClient as jest.Mock).mockReturnValue({ webhooks: { constructEvent }, subscriptions: { list } });
  (getServerSupabase as jest.Mock).mockReturnValue({ rpc, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { user_id: 'user_test' }, error: null }) }) }) }) });
  rpc.mockResolvedValue({ error: null });
  constructEvent.mockReturnValue({ livemode: true, type: 'customer.subscription.updated', data: { object: { customer: 'cus_test' } } });
  list.mockResolvedValue({ data: [subscription('sub_current','active')], has_more: false });
});
it('rejects invalid signatures without updating access', async () => {
  constructEvent.mockImplementation(() => { throw new Error('Invalid signature'); });
  expect((await POST(request('tampered'))).status).toBe(400); expect(rpc).not.toHaveBeenCalled();
});
it('reconciles current matching subscriptions rather than stale event state', async () => {
  list.mockResolvedValue({ data: [subscription('sub_unrelated','active','other_price'), subscription('sub_old','canceled'), subscription('sub_current','active')], has_more: false });
  expect((await POST(request())).status).toBe(200);
  expect(constructEvent).toHaveBeenCalledWith('{"event":"payload"}', 'valid', 'test-secret');
  expect(rpc).toHaveBeenCalledWith('set_subscription_entitlement', {
    p_user_id: 'user_test', p_customer_id: 'cus_test', p_subscription_id: 'sub_current', p_status: 'active',
  });
});
it.each(['invoice.paid','invoice.payment_failed','customer.subscription.deleted'])('reconciles %s and preserves retryable database errors', async (type) => {
  constructEvent.mockReturnValue({ livemode: true, type, data: { object: { customer: 'cus_test' } } });
  list.mockResolvedValue({ data: [subscription('sub_current','canceled')], has_more: false });
  rpc.mockResolvedValue({ error: new Error('Database unavailable') });
  expect((await POST(request())).status).toBe(500);
  expect(rpc).toHaveBeenCalledWith('set_subscription_entitlement', expect.objectContaining({ p_status: 'canceled' }));
});
it('ignores unrelated products', async () => {
  list.mockResolvedValue({ data: [subscription('sub_other','active','other_price')], has_more: false });
  expect((await POST(request())).status).toBe(200); expect(rpc).not.toHaveBeenCalled();
});
it('does not write test events into a shared database', async () => {
  (assertBillingMode as jest.Mock).mockImplementation(() => { throw new Error('Isolated database required'); });
  expect((await POST(request())).status).toBe(500); expect(rpc).not.toHaveBeenCalled();
});
it('does not reconcile an incomplete subscription list', async () => {
  list.mockResolvedValue({ data: [], has_more: true });
  expect((await POST(request())).status).toBe(500); expect(rpc).not.toHaveBeenCalled();
});

it('revokes a canceled subscription even if its price has since been archived', async () => {
  const canceled = subscription('sub_current','canceled');
  canceled.items.data[0].price.active = false;
  list.mockResolvedValue({ data: [canceled], has_more: false });
  expect((await POST(request())).status).toBe(200);
  expect(rpc).toHaveBeenCalledWith('set_subscription_entitlement', expect.objectContaining({ p_status: 'canceled' }));
});
