'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import UrssafCalculator from '@/app/components/UrssafCalculator';
import EmailReminderToggle from '@/app/components/EmailReminderToggle';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';

interface DashboardClientProps {
  user: User | null;
}

export default function DashboardClient({ user: serverUser }: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(serverUser);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Délai pour s'assurer que localStorage est accessible
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erreur de session:', error);
          router.push('/login');
          return;
        }

        if (!session) {
          router.push('/login');
          return;
        }

        setUser(session.user);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la vérification de la session:', err);
        router.push('/login');
      }
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login');
        } else {
          setUser(session.user);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0e0f12' }}
      >
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-white">Tableau de bord</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
          >
            Déconnexion
          </button>
        </header>

        {/* User Info */}
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <p className="text-gray-300">
            Bienvenue, <span className="text-white font-medium">{user?.email}</span>
          </p>
        </div>

        {/* Email Reminder Toggle (Premium only) */}
        {user && getUserSubscription(user).isPremium && (
          <div className="mb-6">
            <EmailReminderToggle userId={user.id} isPremium={true} />
          </div>
        )}

        {/* Calculator (contient chatbot, graphique, pré-remplissage et historique) */}
        <UrssafCalculator user={user} />
      </div>
    </div>
  );
}

