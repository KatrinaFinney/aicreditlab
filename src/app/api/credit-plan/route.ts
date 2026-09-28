import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { generateCreditPlan, isValidCreditAnswers, type CreditGoal } from '@/lib/creditPlan';
import { getServerSupabase } from '@/lib/serverSupabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Credit plan service is unavailable' }, { status: 503 });
  const { data, error } = await db.from('credit_plans')
    .select('plan_type, account_goal, full_name, address, selected_disputes, credit_plan, questionnaire_completed')
    .eq('user_id', userId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load your plan' }, { status: 500 });
  return NextResponse.json({ plan: data });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const answers = (body as { answers?: unknown } | null)?.answers;
  const goal = (body as { goal?: unknown } | null)?.goal;
  if (goal !== 'personal' && goal !== 'business')
    return NextResponse.json({ error: 'Choose personal or business credit' }, { status: 400 });
  if (!isValidCreditAnswers(answers, goal as CreditGoal))
    return NextResponse.json({ error: 'Select one to three valid answers for each question' }, { status: 400 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Credit plan service is unavailable' }, { status: 503 });
  const creditPlan = generateCreditPlan(answers, goal as CreditGoal);
  const { data: existing, error: lookupError } = await db.from('credit_plans')
    .select('plan_type').eq('user_id', userId).maybeSingle();
  if (lookupError) return NextResponse.json({ error: 'Could not save your plan' }, { status: 500 });
  const { error } = await db.from('credit_plans').upsert({
    user_id: userId, account_goal: goal, selected_disputes: answers, questionnaire_completed: true,
    plan_type: existing?.plan_type ?? 'free', credit_plan: creditPlan,
  }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: 'Could not save your plan' }, { status: 500 });
  return NextResponse.json({ credit_plan: creditPlan });
}
