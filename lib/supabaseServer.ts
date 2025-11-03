import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for server-side operations
 * Note: With @supabase/supabase-js, sessions are stored in localStorage on the client.
 * This server-side check provides a basic protection layer, but the client-side
 * check in DashboardClient provides the actual security.
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Forward all cookies from the request
        cookie: cookieStore.toString(),
      },
    },
  });

  return client;
}

/**
 * Check if user has a valid session on the server
 * This is a basic check - the client component provides the actual security
 */
export async function getServerSession() {
  try {
    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      // Silently fail on server - client will handle redirect
      return null;
    }
    
    return session;
  } catch (error) {
    // Silently fail on server - client will handle redirect
    return null;
  }
}

