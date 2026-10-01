import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { appUrl, billingAccount, getOrCreateCustomer, stripeClient } from '@/lib/billing';
import { isPersonalMonthlyPrice } from '@/lib/billingPrice';
import { getServerSupabase } from '@/lib/serverSupabase';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.STRIPE_PRICE_ID || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json({ error: 'Checkout is not available yet' }, { status: 503 });
  try {
    const db = getServerSupabase();
    if (!db) throw new Error('Database unavailable');
    const { data: plan, error } = await db.from('credit_plans').select('account_goal, questionnaire_completed').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!plan?.questionnaire_completed) return NextResponse.json({ error: 'Complete your credit assessment first' }, { status: 409 });
    if (plan.account_goal !== 'personal')
      return NextResponse.json({ error: 'The paid letter plan is for personal credit only' }, { status: 403 });
    const stripe = stripeClient();
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);
    if (!isPersonalMonthlyPrice(price))
      return NextResponse.json({ error: 'The $9.99 monthly plan is not configured yet' }, { status: 503 });
    const account = await billingAccount(userId);
    const email = (await currentUser())?.primaryEmailAddress?.emailAddress;
    const customerId = account?.stripe_customer_id ?? await getOrCreateCustomer(userId, email);
    // Check Stripe directly to prevent another checkout while webhook delivery is pending.
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
    if (subscriptions.has_more) throw new Error('Subscription list is incomplete');
    if (subscriptions.data.some((item) => ['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete'].includes(item.status)))
      return NextResponse.json({ error: 'A subscription already exists. Manage it from your dashboard.' }, { status: 409 });
    const pending = await stripe.checkout.sessions.list({ customer: customerId, status: 'open', limit: 100 });
    if (pending.has_more) throw new Error('Checkout session list is incomplete');
    const reusable = pending.data.find((item) => item.mode === 'subscription' && item.metadata?.priceId === price.id && item.url);
    if (reusable) return NextResponse.json({ url: reusable.url });
    const url = appUrl();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', customer: customerId, line_items: [{ price: price.id, quantity: 1 }],
      metadata: { priceId: price.id }, client_reference_id: userId, subscription_data: { metadata: { clerkUserId: userId } },
      success_url: `${url}/dashboard?checkout=success`, cancel_url: `${url}/dashboard?checkout=cancel`,
    }, { idempotencyKey: `aicreditlab-checkout-${customerId}-${price.id}-${Math.floor(Date.now() / 3600000)}` });
    if (!session.url) throw new Error('Missing checkout URL');
    return NextResponse.json({ url: session.url });
  } catch { return NextResponse.json({ error: 'Could not start checkout' }, { status: 503 }); }
}
