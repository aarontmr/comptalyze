'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserPlan } from '@/lib/plan';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import RevenueChart from '@/app/components/RevenueChart';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Card from '@/app/components/Card';
import Link from 'next/link';

export default function StatistiquesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<'free' | 'pro' | 'premium'>('free');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          return;
        }

        setUser(session.user);
        const userPlan = await getUserPlan(supabase, session.user.id);
        setPlan(userPlan);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const subscription = getUserSubscription(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!subscription.isPremium) {
    return (
      <div>
        <Breadcrumbs items={[
          { label: 'Aperçu', href: '/dashboard' },
          { label: 'Statistiques' },
        ]} />
        <h1 className="text-3xl font-semibold text-white mb-8">Statistiques</h1>
        <Card>
          <h3 className="text-xl font-semibold text-white mb-2">Évolution de votre chiffre d'affaires</h3>
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}>
            <p className="text-gray-300 mb-3">
              Disponible avec le plan{' '}
              <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
                Premium
              </span>
            </p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
            >
              Passer à Premium
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Aperçu', href: '/dashboard' },
        { label: 'Statistiques' },
      ]} />
      <h1 className="text-3xl font-semibold text-white mb-8">Statistiques</h1>
      {user && <RevenueChart userId={user.id} />}
    </div>
  );
}

