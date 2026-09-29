import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/serverSupabase';
import { getStripe } from '@/lib/stripe';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const stripe = getStripe();
  const db = getServerSupabase();
  if (!stripe || !db) return NextResponse.json({ error: 'Billing is unavailable' }, { status: 503 });
  const { data, error } = await db.from('billing_subscriptions')
    .select('stripe_customer_id').eq('user_id', userId).maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id, return_url: `${origin}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Could not open billing' }, { status: 502 });
  }
}
