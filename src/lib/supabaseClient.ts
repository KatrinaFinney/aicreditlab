import { createClient } from '@supabase/supabase-js';

console.log("🔍 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("🔍 Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase credentials. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default supabase;
