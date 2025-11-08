'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import OnboardingFlow from './components/OnboardingFlow';

export default function OnboardingPremiumPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        const subscription = getUserSubscription(session.user);
        
        // Vérifier si l'utilisateur est Premium
        if (!subscription.isPremium) {
          router.push('/pricing');
          return;
        }

        // Vérifier si l'onboarding est déjà complété
        const { data: onboardingData } = await supabase
          .from('user_onboarding_data')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (onboardingData?.onboarding_completed) {
          // Déjà fait, rediriger vers dashboard
          router.push('/dashboard');
          return;
        }

        setUser(session.user);
        setLoading(false);
      } catch (error) {
        console.error('Erreur vérification auth:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0e0f12' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2E6CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <OnboardingFlow user={user} />;
}

