import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSupabase } from '@/lib/serverSupabase';
import { getStripe } from '@/lib/stripe';

export async function POST(request: Request) {
  const stripe = getStripe();
  const db = getServerSupabase();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!stripe || !db || !secret) return NextResponse.json({ error: 'Webhook unavailable' }, { status: 503 });
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }); }

  const relevant = ['checkout.session.completed', 'customer.subscription.created',
    'customer.subscription.updated', 'customer.subscription.deleted',
    'invoice.paid', 'invoice.payment_failed'];
  if (!relevant.includes(event.type)) return NextResponse.json({ received: true });

  try {
    const object = event.data.object as Stripe.Checkout.Session | Stripe.Subscription | Stripe.Invoice;
    const customerId = typeof object.customer === 'string' ? object.customer : object.customer?.id;
    if (!customerId) throw new Error('Missing customer');
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) throw new Error('Deleted customer');
    const userId = customer.metadata.clerkUserId;
    if (!userId) throw new Error('Missing Clerk identity');
    // Reconcile current Stripe state, not event order. Replayed or delayed events stay safe.
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
    const current = subscriptions.data.find((item) => item.status === 'active') ||
      subscriptions.data.find((item) => item.status === 'trialing') || subscriptions.data[0];
    if (!current) return NextResponse.json({ received: true });
    const { error } = await db.rpc('set_subscription_entitlement', {
      p_user_id: userId, p_customer_id: customerId,
      p_subscription_id: current.id, p_status: current.status,
    });
    if (error) throw error;
    return NextResponse.json({ received: true });
  } catch {
    // Stripe retries failed deliveries; do not acknowledge a failed entitlement update.
    return NextResponse.json({ error: 'Could not reconcile subscription' }, { status: 500 });
  }
}
