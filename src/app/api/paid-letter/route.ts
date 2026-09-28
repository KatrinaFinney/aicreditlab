import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/serverSupabase';
import { letterTemplateFor } from '@/lib/letterTemplates';
import type { LetterDetails } from '@/lib/disputeLetter';
import { validLetterDetails } from '@/lib/validateLetter';
import { reserveSlot, finishSlot, releaseSlot } from '@/lib/letterQuota';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let input: LetterDetails & { consent?: boolean };
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!validLetterDetails(input) || input.consent !== true ||
    (input.accountReference && (typeof input.accountReference !== 'string' || !/^[A-Za-z0-9-]{1,8}$/.test(input.accountReference))))
    return NextResponse.json({ error: 'Complete the form and consent before generating a draft' }, { status: 400 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Letter service unavailable' }, { status: 503 });
  const { data: plan, error } = await db.from('credit_plans').select('plan_type').eq('user_id', userId).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not verify plan access' }, { status: 500 });
  if (plan?.plan_type !== 'paid') return NextResponse.json({ error: 'Paid plan required' }, { status: 403 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'AI drafting is not configured yet' }, { status: 503 });
  let reservation: string | null;
  try { reservation = await reserveSlot(userId, 'paid_generation'); } catch {
    return NextResponse.json({ error: 'Generation allowance unavailable' }, { status: 503 });
  }
  if (!reservation) return NextResponse.json({ error: 'Five AI drafts have been generated this month. Your allowance resets next month.' }, { status: 429 });
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_LETTER_MODEL || 'gpt-5-mini', store: false, max_output_tokens: 1000,
        instructions: 'Draft a clear, respectful letter disputing a specific possible credit report inaccuracy. Use only facts supplied by the user. Do not invent dates, amounts, laws, attachments, prior contacts, identity theft, or outcomes. Do not promise deletion, score changes, or legal results. Address the selected credit bureau. Return only the letter text. If facts are incomplete, mark missing details clearly in [brackets] for user review.',
        input: JSON.stringify({ date: new Date().toLocaleDateString('en-US'), letterType: input.templateId ? letterTemplateFor(input.templateId)?.title : 'Credit report error',
          name: input.fullName.trim(), address: input.address.trim(), bureau: input.agency,
          company: input.creditor.trim(), accountReference: input.accountReference?.trim().slice(0, 30) || '',
          error: input.errorDescription.trim(), requestedCorrection: input.requestedCorrection.trim() }),
      }),
    });
    if (!response.ok) throw new Error('AI generation failed');
    const result = await response.json();
    const letter = result.output?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
      .filter((part: { type?: string }) => part.type === 'output_text')
      .map((part: { text?: string }) => part.text ?? '').join('\n').trim();
    if (!letter) throw new Error('Empty draft');
    await finishSlot(userId, reservation);
    return NextResponse.json({ letter });
  } catch {
    await releaseSlot(userId, reservation);
    return NextResponse.json({ error: 'Could not generate the letter right now' }, { status: 502 });
  }
}
