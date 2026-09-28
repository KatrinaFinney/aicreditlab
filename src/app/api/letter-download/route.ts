import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/serverSupabase';
import { buildDisputeLetter } from '@/lib/disputeLetter';
import { validLetterDetails } from '@/lib/validateLetter';
import { reserveSlot, finishSlot, releaseSlot } from '@/lib/letterQuota';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!validLetterDetails(input)) return NextResponse.json({ error: 'Complete the letter details first' }, { status: 400 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Letter service unavailable' }, { status: 503 });
  const { data: plan, error } = await db.from('credit_plans').select('plan_type').eq('user_id', userId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not verify plan' }, { status: 503 });
  let reservation: string | null = null;
  if (plan?.plan_type !== 'paid') {
    try { reservation = await reserveSlot(userId, 'free_download'); } catch {
      return NextResponse.json({ error: 'Download allowance unavailable' }, { status: 503 });
    }
    if (!reservation) return NextResponse.json({ error: 'Your three free letter downloads are used for this month. The library unlocks next month.' }, { status: 429 });
  }
  try {
    const letter = buildDisputeLetter(input, new Date().toLocaleDateString('en-US'));
    if (reservation) await finishSlot(userId, reservation);
    return new Response(letter, { headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="credit-report-dispute-draft.txt"',
      'Cache-Control': 'no-store',
    } });
  } catch {
    if (reservation) await releaseSlot(userId, reservation);
    return NextResponse.json({ error: 'Could not prepare download' }, { status: 500 });
  }
}
