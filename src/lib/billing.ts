import Stripe from 'stripe';
import { getServerSupabase } from './serverSupabase';

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  assertBillingMode(key?.startsWith('sk_live_') ?? false);
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
  const { data, error } = await db.from('billing_subscriptions')
    .select('stripe_customer_id, stripe_subscription_id, status')
    .eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrCreateCustomer(userId: string, email?: string) {
  const existing = await billingAccount(userId);
  if (existing) return existing.stripe_customer_id as string;
  const customer = await stripeClient().customers.create({
    ...(email ? { email } : {}), metadata: { clerkUserId: userId },
  }, { idempotencyKey: `aicreditlab-customer-${userId}` });
  const db = getServerSupabase();
  if (!db) throw new Error('Database unavailable');
  const { error } = await db.from('billing_subscriptions').insert({ user_id: userId, stripe_customer_id: customer.id });
  if (error) {
    // Concurrent checkout requests may have inserted the same account.
    const concurrent = await billingAccount(userId);
    if (concurrent) return concurrent.stripe_customer_id as string;
    throw error;
  }
  return customer.id;
}

// Fail closed: test billing must explicitly target a separate database, even in previews.
export function assertBillingMode(livemode: boolean) {
  if (livemode) return;
  const database = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isolated = process.env.BILLING_TEST_DATABASE_URL;
  if (process.env.VERCEL_ENV === 'production' || !database || !isolated ||
      new URL(database).origin !== new URL(isolated).origin ||
      new URL(database).hostname === 'wsnnriiqkcvazkvhrwdm.supabase.co')
    throw new Error('Test billing requires an explicitly isolated Supabase database');
}
