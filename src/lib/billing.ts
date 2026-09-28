import 'server-only';
import Stripe from 'stripe';
import { getServerSupabase } from './serverSupabase';

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe is not configured');
  return new Stripe(key);
}

export function appUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value) throw new Error('App URL is not configured');
  const url = new URL(value);
  if (url.protocol !== 'https:' && !(url.hostname === 'localhost' && url.protocol === 'http:'))
    throw new Error('App URL must use HTTPS');
  return url.origin;
}

export async function billingAccount(userId: string) {
  const db = getServerSupabase();
  if (!db) throw new Error('Database unavailable');
  const { data, error } = await db.from('billing_accounts')
    .select('stripe_customer_id, stripe_subscription_id, subscription_status')
    .eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrCreateCustomer(userId: string, email?: string) {
  const existing = await billingAccount(userId);
  if (existing) return existing.stripe_customer_id as string;
  const customer = await stripeClient().customers.create({
    ...(email ? { email } : {}), metadata: { clerk_user_id: userId },
  }, { idempotencyKey: `aicreditlab-customer-${userId}` });
  const db = getServerSupabase();
  if (!db) throw new Error('Database unavailable');
  const { error } = await db.from('billing_accounts').insert({ user_id: userId, stripe_customer_id: customer.id });
  if (error) {
    // Concurrent checkout requests may have inserted the same account.
    const concurrent = await billingAccount(userId);
    if (concurrent) return concurrent.stripe_customer_id as string;
    throw error;
  }
  return customer.id;
}

export async function syncSubscription(subscription: Stripe.Subscription, eventCreated: number) {
  if (process.env.VERCEL_ENV === 'production' && !subscription.livemode)
    throw new Error('Test subscription cannot grant production access');
  const configuredPrice = process.env.STRIPE_PRICE_ID;
  if (!configuredPrice || !subscription.items.data.some((item) => item.price.id === configuredPrice)) return;
  const db = getServerSupabase();
  if (!db) throw new Error('Database unavailable');
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const { error } = await db.rpc('sync_billing_subscription', {
    p_customer_id: customerId, p_subscription_id: subscription.id,
    p_status: subscription.status, p_event_created: eventCreated,
  });
  if (error) throw error;
}
