'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import Card from '@/app/components/Card';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import EmailReminderToggle from '@/app/components/EmailReminderToggle';
import Link from 'next/link';
import { User as UserIcon, Mail, CreditCard, Bell, AlertTriangle, XCircle } from 'lucide-react';

export default function ComptePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
                <div className="flex items-center gap-3 flex-wrap">
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

        {/* Gestion de l'abonnement */}
        {(subscription.isPro || subscription.isPremium) && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <CreditCard className="w-6 h-6" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Gestion de l'abonnement</h2>
                <p className="text-sm text-gray-400">Gérez votre abonnement {getPlanLabel()}</p>
              </div>
            </div>

            {!showCancelConfirm ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">
                        <strong>Attention :</strong> L'annulation de votre abonnement est immédiate.
                      </p>
                      <p className="text-xs text-gray-400">
                        Vous perdrez immédiatement l'accès aux fonctionnalités {getPlanLabel()}. Vous pourrez toujours utiliser le plan Gratuit.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={canceling}
                  className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <XCircle className="w-5 h-5" />
                  Annuler mon abonnement
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                  <p className="text-sm text-white font-semibold mb-2">
                    Êtes-vous sûr de vouloir annuler votre abonnement ?
                  </p>
                  <p className="text-xs text-gray-300">
                    Cette action est irréversible. Vous perdrez immédiatement l'accès à toutes les fonctionnalités {getPlanLabel()}.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!user) return;
                      
                      setCanceling(true);
                      try {
                        const res = await fetch('/api/cancel-subscription', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: user.id }),
                        });

                        const data = await res.json();

                        if (!res.ok) {
                          alert(`Erreur: ${data.error || 'Une erreur est survenue'}`);
                          setCanceling(false);
                          return;
                        }

                        alert('Votre abonnement a été annulé avec succès. Vous allez être redirigé...');
                        // Rafraîchir la page pour mettre à jour les métadonnées
                        window.location.reload();
                      } catch (error) {
                        console.error('Erreur:', error);
                        alert('Une erreur est survenue lors de l\'annulation.');
                        setCanceling(false);
                      }
                    }}
                    disabled={canceling}
                    className="flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    {canceling ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelConfirm(false);
                      setCanceling(false);
                    }}
                    disabled={canceling}
                    className="px-4 py-3 rounded-lg text-gray-300 font-medium transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

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

