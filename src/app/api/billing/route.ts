import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { billingAccount, stripeClient } from '@/lib/billing';
import { isPersonalMonthlyPrice } from '@/lib/billingPrice';
import { getServerSupabase } from '@/lib/serverSupabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getServerSupabase();
    if (!db) throw new Error('Database unavailable');
    const { data: plan, error } = await db.from('credit_plans')
      .select('account_goal, plan_type').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    const checkoutEnabled = process.env.BILLING_CHECKOUT_ENABLED === 'true';
    const account = checkoutEnabled || plan?.plan_type === 'paid' ? await billingAccount(userId) : null;
    let price: string | null = null;
    if (checkoutEnabled && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID) {
      const item = await stripeClient().prices.retrieve(process.env.STRIPE_PRICE_ID);
      if (isPersonalMonthlyPrice(item)) price = '$9.99';
    }
    return NextResponse.json({ accountGoal: plan?.account_goal ?? null, paid: plan?.plan_type === 'paid',
      status: account?.stripe_subscription_id ? account.status : null, hasBillingAccount: !!account, checkoutEnabled, price });
  } catch { return NextResponse.json({ error: 'Billing is unavailable' }, { status: 503 }); }
}
