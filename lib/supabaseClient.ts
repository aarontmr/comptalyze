import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client with environment variables
 * Uses lazy initialization to ensure env vars are loaded properly
 */
function initializeSupabase(): SupabaseClient {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Validate environment variables with helpful error messages
  if (!supabaseUrl || supabaseUrl === '') {
    console.error('\n❌ ERREUR : NEXT_PUBLIC_SUPABASE_URL est manquante ou vide');
    console.error('📝 Solution :');
    console.error('   1. Ouvrez .env.local à la racine du projet');
    console.error('   2. Ajoutez : NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co');
    console.error('   3. REDÉMARREZ le serveur (Ctrl+C puis npm run dev)');
    console.error('   4. Vérifiez avec : npm run check-env\n');
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL. Please add it to your .env.local file and restart the server.'
    );
  }

  if (!supabaseAnonKey || supabaseAnonKey === '') {
    console.error('\n❌ ERREUR : NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante ou vide');
    console.error('📝 Solution :');
    console.error('   1. Ouvrez .env.local à la racine du projet');
    console.error('   2. Ajoutez : NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon');
    console.error('   3. REDÉMARREZ le serveur (Ctrl+C puis npm run dev)');
    console.error('   4. Vérifiez avec : npm run check-env\n');
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Please add it to your .env.local file and restart the server.'
    );
  }

  // Create and return the Supabase client
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  // Debug log in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Supabase client initialisé avec succès');
    console.log('   URL:', supabaseUrl.substring(0, 40) + '...');
  }

  return client;
}

// Export the initialized client
// The initialization happens at module load time, which should work
// because Next.js injects env vars before module execution
export const supabase = initializeSupabase();
