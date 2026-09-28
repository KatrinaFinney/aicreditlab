import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripeClient, syncSubscription } from '@/lib/billing';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripeClient().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch { return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 }); }
  try {
    let subscriptionId: string | null = null;
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription')
        subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted') {
      subscriptionId = (event.data.object as Stripe.Subscription).id;
    }
    if (subscriptionId) {
      // Fetch current Stripe state so delayed event deliveries do not restore stale access.
      const subscription = await stripeClient().subscriptions.retrieve(subscriptionId);
      await syncSubscription(subscription, event.created);
    }
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 }); }
}
