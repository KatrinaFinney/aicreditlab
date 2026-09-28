import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { billingAccount, stripeClient } from '@/lib/billing';
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
    const account = await billingAccount(userId);
    let price: string | null = null;
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID) {
      const item = await stripeClient().prices.retrieve(process.env.STRIPE_PRICE_ID);
      if (item.active && item.type === 'recurring' && item.unit_amount != null && item.recurring?.interval === 'month') {
        price = new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.unit_amount / 100);
      }
    }
    return NextResponse.json({ accountGoal: plan?.account_goal ?? null, paid: plan?.plan_type === 'paid',
      status: account?.subscription_status ?? null, hasBillingAccount: !!account, price });
  } catch { return NextResponse.json({ error: 'Billing is unavailable' }, { status: 503 }); }
}
