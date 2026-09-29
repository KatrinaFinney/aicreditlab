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
    .select('plan_type, account_goal, active_saved_plan_id, full_name, address, selected_disputes, credit_plan, questionnaire_completed')
    .eq('user_id', userId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load your plan' }, { status: 500 });
  if (data?.plan_type === 'paid') {
    const { data: savedPlans, error: listError } = await db.from('saved_credit_plans')
      .select('id, account_goal, created_at').eq('user_id', userId).order('created_at', { ascending: true });
    if (listError) return NextResponse.json({ error: 'Could not load saved plans' }, { status: 500 });
    return NextResponse.json({ plan: data, savedPlans });
  }
  return NextResponse.json({ plan: data, savedPlans: [] });
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
  const newPlan = (body as { newPlan?: unknown } | null)?.newPlan === true;
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
  if (existing?.plan_type === 'paid') {
    const { data: id, error: saveError } = await db.rpc('save_paid_credit_plan', {
      p_user_id: userId, p_goal: goal, p_answers: answers, p_steps: creditPlan, p_new: newPlan,
    });
    if (saveError) return NextResponse.json({ error: 'Could not save your plan' }, { status: 500 });
    return NextResponse.json({ id, credit_plan: creditPlan });
  }
  const { error } = await db.from('credit_plans').upsert({
    user_id: userId, account_goal: goal, selected_disputes: answers, questionnaire_completed: true,
    plan_type: existing?.plan_type ?? 'free', credit_plan: creditPlan,
  }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: 'Could not save your plan' }, { status: 500 });
  return NextResponse.json({ credit_plan: creditPlan });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const id = (body as { id?: unknown } | null)?.id;
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Credit plan service is unavailable' }, { status: 503 });
  const { error } = await db.rpc('activate_paid_credit_plan', { p_user_id: userId, p_id: id });
  if (error) return NextResponse.json({ error: 'Could not open this saved plan' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
