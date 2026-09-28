import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/serverSupabase';
import { usageFor } from '@/lib/letterQuota';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getServerSupabase();
    if (!db) throw new Error('Unavailable');
    const { data: plan, error } = await db.from('credit_plans').select('plan_type').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    const paid = plan?.plan_type === 'paid';
    const usage = await usageFor(userId, paid ? 'paid_generation' : 'free_download');
    return NextResponse.json({ paid, ...usage, remaining: Math.max(0, usage.limit - usage.used),
      resetAt: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toISOString() });
  } catch {
    return NextResponse.json({ error: 'Could not load letter allowance' }, { status: 503 });
  }
}
