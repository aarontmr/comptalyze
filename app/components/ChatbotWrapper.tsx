'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter l'hydration mismatch
const Chatbot = dynamic(() => import('@/components/Chatbot'), {
  ssr: false,
  loading: () => null,
});

export default function ChatbotWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Marquer comme monté côté client uniquement
    setIsMounted(true);

    // Récupérer l'utilisateur actuel
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
      }
    };

    getUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Ne rien rendre côté serveur (évite l'hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return <Chatbot user={user} />;
}

