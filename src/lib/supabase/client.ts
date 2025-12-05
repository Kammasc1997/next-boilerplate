import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
}

/**
 * Supabase client for client-side operations
 * Brug denne i Client Components og browser context
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase client for server-side operations
 * Bruger service role key for admin operations (kun server-side)
 */
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    // Hvis service role key ikke er sat, brug anon key (begrænset funktionalitet)
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using anon key (limited functionality)');
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

