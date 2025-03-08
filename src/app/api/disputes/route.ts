import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

/**
 * Handle GET request to fetch disputes for a specific user.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('user_id', user_id);

    if (error) {
      console.error("Supabase Fetch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ disputes: data }, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * Handle POST request to insert a new dispute into the database.
 */
export async function POST(request: NextRequest) {
  try {
    const { user_id, creditor, agency, isTest } = await request.json();

    if (!user_id || !creditor || !agency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log("Attempting to insert:", { user_id, creditor, agency });

    // Use admin key for testing, otherwise use normal Supabase client
    const client = isTest ? supabaseAdmin : supabase;

    const { data, error } = await client
      .from('disputes')
      .insert([{ user_id, creditor, agency, status: 'Pending' }])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Inserted Dispute:", data);
    return NextResponse.json({ dispute: data }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
