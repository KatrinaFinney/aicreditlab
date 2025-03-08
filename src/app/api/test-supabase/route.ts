import { NextResponse } from 'next/server';
import supabase from '../../../lib/supabaseClient';

export const dynamic = "force-dynamic"; // 🚀 Prevent static caching
export async function GET() {
  const { data, error } = await supabase.from('disputes').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ disputes: data });
}
