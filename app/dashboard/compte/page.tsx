'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import Card from '@/app/components/Card';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import EmailReminderToggle from '@/app/components/EmailReminderToggle';
import Link from 'next/link';
import { User as UserIcon, Mail, CreditCard, Bell } from 'lucide-react';

export default function ComptePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const subscription = getUserSubscription(user);

  const getPlanLabel = () => {
    if (subscription.isPremium) return 'Premium';
    if (subscription.isPro) return 'Pro';
    return 'Gratuit';
  };

  const getPlanColor = () => {
    if (subscription.isPremium) return 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)';
    if (subscription.isPro) return 'linear-gradient(135deg, #2E6CF6 0%, #00D084 100%)';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Aperçu', href: '/dashboard' },
        { label: 'Mon compte' },
      ]} />
      <h1 className="text-3xl font-semibold text-white mb-8">Mon compte</h1>

      <div className="space-y-6">
        {/* Informations utilisateur */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
              <UserIcon className="w-6 h-6" style={{ color: '#2E6CF6' }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Informations personnelles</h2>
              <p className="text-sm text-gray-400">Gérez vos informations de compte</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">E-mail</label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <p className="text-white">{user?.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Plan d'abonnement</label>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                    style={{ background: getPlanColor() }}
                  >
                    {getPlanLabel()}
                  </span>
                  {!subscription.isPremium && (
                    <Link
                      href="/pricing"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Passer à {subscription.isPro ? 'Premium' : 'Pro'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Préférences e-mail */}
        {subscription.isPremium && user && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
                <Bell className="w-6 h-6" style={{ color: '#00D084' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Préférences e-mail</h2>
                <p className="text-sm text-gray-400">Configurez vos notifications</p>
              </div>
            </div>
            <EmailReminderToggle userId={user.id} isPremium={true} />
          </Card>
        )}

        {/* Actions */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block px-4 py-3 rounded-lg text-white font-medium transition-all hover:scale-[1.02] text-center"
              style={{ background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)' }}
            >
              {subscription.isPremium ? 'Gérer mon abonnement' : 'Passer à un plan supérieur'}
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all hover:bg-gray-800"
              style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
            >
              Déconnexion
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

