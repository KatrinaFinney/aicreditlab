import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { auth } from '@clerk/nextjs/server';

interface DisputeRequest {
  creditor: string;
  agency: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { creditor, agency }: DisputeRequest = await req.json();
    if (typeof creditor !== 'string' || !creditor.trim() || typeof agency !== 'string' || !agency.trim())
      return NextResponse.json({ error: 'Creditor and agency are required' }, { status: 400 });
    const client = supabaseAdmin;

    if (!client) {
      return NextResponse.json({ error: 'Dispute service is unavailable' }, { status: 503 });
    }

    const { data, error } = await client
      .from('disputes')
      .insert([{ user_id: userId, creditor: creditor.trim(), agency: agency.trim(), status: 'Pending' }])
      .select();

    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {  // ⬅ Explicitly specify `unknown` instead of `any`
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
