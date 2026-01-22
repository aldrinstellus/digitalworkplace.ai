import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create clients only if we have the required env vars
let supabase: SupabaseClient;
let supabaseAdmin: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  // Regular client with anon key (respects RLS)
  supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Admin client with service role key (bypasses RLS)
  // Only use for server-side operations that need to bypass RLS
  supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : supabase; // Fallback to regular client if service key not available
} else {
  // Build-time fallback - create dummy clients that will be replaced at runtime
  const dummyClient = {} as SupabaseClient;
  supabase = dummyClient;
  supabaseAdmin = dummyClient;
}

export { supabase, supabaseAdmin };
