import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/serverSupabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getServerSupabase();
  if (!db) return NextResponse.json({ error: 'Template service is unavailable' }, { status: 503 });
  const [{ data: plan, error: planError }, { data: templates, error: templateError }] = await Promise.all([
    db.from('credit_plans').select('plan_type').eq('user_id', userId).maybeSingle(),
    db.from('dispute_templates').select('id, title, category, download_pdf_url, download_docx_url'),
  ]);
  if (planError || templateError) return NextResponse.json({ error: 'Could not load templates' }, { status: 500 });
  const planType = plan?.plan_type ?? 'free';
  return NextResponse.json({ planType, templates: (templates ?? []).map((template) => ({
    ...template, download_docx_url: planType === 'paid' ? template.download_docx_url : undefined,
  })) });
}
