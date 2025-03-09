import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

interface DisputeRequest {
  user_id: string;
  creditor: string;
  agency: string;
}

export async function POST(req: Request) {
  try {
    const { user_id, creditor, agency }: DisputeRequest = await req.json();
    const isTest = process.env.NODE_ENV === 'test';

    const client = isTest ? supabaseAdmin : supabase;

    if (!client) {
      throw new Error("Supabase client is not initialized.");
    }

    const { data, error } = await client
      .from('disputes')
      .insert([{ user_id, creditor, agency, status: 'Pending' }])
      .select();

    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {  // ⬅ Explicitly specify `unknown` instead of `any`
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
