import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/serverSupabase';

const statuses = ['Draft', 'Sent', 'Resolved'] as const;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Dispute service unavailable' }, { status: 503 });
  const { data: plan, error: planError } = await db.from('credit_plans').select('account_goal').eq('user_id', userId).maybeSingle();
  if (planError) return NextResponse.json({ error: 'Could not load your plan' }, { status: 500 });
  if (plan?.account_goal !== 'personal') return NextResponse.json({ error: 'Dispute tools require a personal credit plan' }, { status: 403 });
  const { data, error } = await db.from('disputes').select('id, creditor, agency, status')
    .eq('user_id', userId).order('id', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load disputes' }, { status: 500 });
  return NextResponse.json({ disputes: data });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let input: { creditor?: unknown; agency?: unknown };
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { creditor, agency } = input ?? {};
  if (typeof creditor !== 'string' || !creditor.trim() || creditor.length > 150 ||
    !['Equifax', 'Experian', 'TransUnion'].includes(agency as string))
    return NextResponse.json({ error: 'Enter a company and choose a credit bureau' }, { status: 400 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Dispute service unavailable' }, { status: 503 });
  const { data: plan, error: planError } = await db.from('credit_plans').select('account_goal').eq('user_id', userId).maybeSingle();
  if (planError) return NextResponse.json({ error: 'Could not load your plan' }, { status: 500 });
  if (plan?.account_goal !== 'personal') return NextResponse.json({ error: 'Dispute tools require a personal credit plan' }, { status: 403 });
  const { data, error } = await db.from('disputes')
    .insert({ user_id: userId, creditor: creditor.trim(), agency, status: 'Draft' })
    .select('id, creditor, agency, status').single();
  if (error) return NextResponse.json({ error: 'Could not save dispute' }, { status: 500 });
  return NextResponse.json({ dispute: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let input: { id?: unknown; status?: unknown };
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (typeof input?.id !== 'string' || input.id.length > 100 ||
    !statuses.includes(input.status as typeof statuses[number]))
    return NextResponse.json({ error: 'Invalid dispute update' }, { status: 400 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Dispute service unavailable' }, { status: 503 });
  const { data: plan, error: planError } = await db.from('credit_plans').select('account_goal').eq('user_id', userId).maybeSingle();
  if (planError) return NextResponse.json({ error: 'Could not load your plan' }, { status: 500 });
  if (plan?.account_goal !== 'personal') return NextResponse.json({ error: 'Dispute tools require a personal credit plan' }, { status: 403 });
  const { data, error } = await db.from('disputes').update({ status: input.status })
    .eq('id', input.id).eq('user_id', userId).select('id, creditor, agency, status').maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not update dispute' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
  return NextResponse.json({ dispute: data });
}
