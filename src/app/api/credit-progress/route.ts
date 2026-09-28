import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/serverSupabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Progress service unavailable' }, { status: 503 });
  const { data, error } = await db.from('credit_plan_progress')
    .select('completed_steps, focus_mode, session_minutes').eq('user_id', userId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load progress' }, { status: 500 });
  return NextResponse.json({ completedSteps: data?.completed_steps ?? [], focusMode: data?.focus_mode ?? false, sessionMinutes: data?.session_minutes ?? 10 });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const step = (body as { step?: unknown } | null)?.step;
  const completed = (body as { completed?: unknown } | null)?.completed;
  if (typeof step !== 'string' || typeof completed !== 'boolean')
    return NextResponse.json({ error: 'Invalid progress update' }, { status: 400 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Progress service unavailable' }, { status: 503 });
  const { data: plan, error: planError } = await db.from('credit_plans')
    .select('credit_plan').eq('user_id', userId).maybeSingle();
  if (planError || !Array.isArray(plan?.credit_plan) || !plan.credit_plan.includes(step))
    return NextResponse.json({ error: 'Step is not in your current plan' }, { status: 400 });
  const { data: progress, error: readError } = await db.from('credit_plan_progress')
    .select('completed_steps').eq('user_id', userId).maybeSingle();
  if (readError) return NextResponse.json({ error: 'Could not load progress' }, { status: 500 });
  const previous = Array.isArray(progress?.completed_steps) ? progress.completed_steps as string[] : [];
  const completedSteps = plan.credit_plan.filter((item: string) =>
    item === step ? completed : previous.includes(item));
  const { error } = await db.from('credit_plan_progress').upsert({
    user_id: userId, completed_steps: completedSteps, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: 'Could not save progress' }, { status: 500 });
  return NextResponse.json({ completedSteps });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let input: { focusMode?: unknown; sessionMinutes?: unknown };
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (typeof input?.focusMode !== 'boolean' || ![5, 10, 20].includes(input.sessionMinutes as number))
    return NextResponse.json({ error: 'Invalid preferences' }, { status: 400 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Progress service unavailable' }, { status: 503 });
  const { data: previous, error: readError } = await db.from('credit_plan_progress')
    .select('completed_steps').eq('user_id', userId).maybeSingle();
  if (readError) return NextResponse.json({ error: 'Could not save preferences' }, { status: 500 });
  const { error } = await db.from('credit_plan_progress').upsert({
    user_id: userId, completed_steps: previous?.completed_steps ?? [],
    focus_mode: input.focusMode, session_minutes: input.sessionMinutes,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: 'Could not save preferences' }, { status: 500 });
  return NextResponse.json({ focusMode: input.focusMode, sessionMinutes: input.sessionMinutes });
}
