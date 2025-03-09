import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Throw an error if the required variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Supabase URL and Anon Key are required. Check your .env.local file.");
}

// Always export the regular Supabase client (used for frontend requests)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Always declare `supabaseAdmin`, but only initialize it if the key is available
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
