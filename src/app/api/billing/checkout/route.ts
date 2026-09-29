import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/serverSupabase';
import { getStripe, monthlyPriceCents } from '@/lib/stripe';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in to subscribe' }, { status: 401 });
  const stripe = getStripe();
  const db = getServerSupabase();
  if (!stripe || !db || !process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json({ error: 'Checkout is not available yet' }, { status: 503 });
  try {
    const { data: billing, error } = await db.from('billing_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (billing?.stripe_subscription_id) {
      const existing = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
      if (['active', 'trialing', 'past_due', 'unpaid'].includes(existing.status))
        return NextResponse.json({ error: 'You already have a subscription. Use Manage billing instead.' }, { status: 409 });
    }
    const email = (await currentUser())?.primaryEmailAddress?.emailAddress;
    const customer = billing?.stripe_customer_id || (await stripe.customers.create({
      ...(email ? { email } : {}), metadata: { clerkUserId: userId },
    })).id;
    // Save the customer before redirect so the billing portal can find it later.
    const { error: saveError } = await db.from('billing_subscriptions').upsert({
      user_id: userId, stripe_customer_id: customer,
    }, { onConflict: 'user_id' });
    if (saveError) throw saveError;
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', customer, client_reference_id: userId,
      line_items: [{ price_data: { currency: 'usd', unit_amount: monthlyPriceCents,
        recurring: { interval: 'month' }, product_data: { name: 'AI CreditLab Plus' } }, quantity: 1 }],
      subscription_data: { metadata: { clerkUserId: userId } },
      success_url: `${origin}/dashboard?checkout=success`, cancel_url: `${origin}/dashboard?checkout=cancel`,
    });
    if (!session.url) throw new Error('Missing checkout URL');
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 });
  }
}
