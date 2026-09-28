import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const agencies = ['Equifax', 'Experian', 'TransUnion'] as const;

import { buildDisputeLetter, type LetterDetails } from '@/lib/disputeLetter';
import { letterTemplateFor } from '@/lib/letterTemplates';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let details: LetterDetails;
  try { details = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const required = ['fullName', 'address', 'creditor', 'errorDescription', 'requestedCorrection'] as const;
  if (!details || required.some((key) => typeof details[key] !== 'string' ||
    !details[key].trim() || details[key].length > 1000) ||
    !agencies.includes(details.agency as typeof agencies[number]) ||
    (details.templateId && !letterTemplateFor(details.templateId)) ||
    (details.accountReference && (typeof details.accountReference !== 'string' || details.accountReference.length > 30))) {
    return NextResponse.json({ error: 'Please complete each required field with your own accurate details' }, { status: 400 });
  }
  const cleaned = Object.fromEntries(Object.entries(details).map(([key, value]) =>
    [key, typeof value === 'string' ? value.trim() : value])) as LetterDetails;
  return NextResponse.json({ letter: buildDisputeLetter(cleaned, new Date().toLocaleDateString('en-US')) });
}
