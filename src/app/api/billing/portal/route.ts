import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { appUrl, billingAccount, stripeClient } from '@/lib/billing';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const account = await billingAccount(userId);
    if (!account) return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
    const session = await stripeClient().billingPortal.sessions.create({
      customer: account.stripe_customer_id, return_url: `${appUrl()}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch { return NextResponse.json({ error: 'Could not open billing settings' }, { status: 503 }); }
}
