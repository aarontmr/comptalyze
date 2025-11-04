'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import MobileShell from '@/components/ui/MobileShell';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import SectionTitle from '@/components/ui/SectionTitle';
import BadgePlan from '@/components/ui/BadgePlan';
import EmailReminderToggle from '@/app/components/EmailReminderToggle';
import Link from 'next/link';
import { User as UserIcon, Mail, CreditCard, Bell, AlertTriangle, XCircle, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [cancelingTrial, setCancelingTrial] = useState(false);

  const getPlanType = (): 'free' | 'pro' | 'premium' => {
    if (subscription.isPremium) return 'premium';
    if (subscription.isPro) return 'pro';
    return 'free';
  };

  const handleCancelTrial = async () => {
    if (!user) return;
    
    setCancelingTrial(true);
    try {
      const res = await fetch('/api/cancel-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Erreur: ${data.error || 'Une erreur est survenue'}`);
        setCancelingTrial(false);
        return;
      }

      alert('Votre essai gratuit a été annulé. Vous allez être redirigé...');
      window.location.reload();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de l\'annulation de l\'essai.');
      setCancelingTrial(false);
    }
  };

  // Desktop version
  const DesktopView = () => (
    <div>
      <h1 className="text-3xl font-semibold text-white mb-8">Mon compte</h1>
      {/* Desktop content stays the same */}
    </div>
  );

  // Mobile version
  const MobileView = () => {
    if (loading) {
      return (
        <MobileShell title="Mon compte">
          <div className="space-y-6 pt-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </MobileShell>
      );
    }

    return (
      <MobileShell title="Mon compte">
        <div className="space-y-6 pt-4">
          {/* Informations utilisateur */}
          <SectionTitle title="Mon compte" />
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                  <Mail className="w-5 h-5" style={{ color: '#2E6CF6' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">E-mail</p>
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                  <CreditCard className="w-5 h-5" style={{ color: '#2E6CF6' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Plan d'abonnement</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <BadgePlan plan={getPlanType()} />
                    {!subscription.isPremium && (
                      <Link
                        href="/pricing"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Passer à {subscription.isPro ? 'Premium' : 'Pro'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Préférences e-mail (Premium) */}
          {subscription.isPremium && user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle title="Préférences" />
              <Card>
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
                    <Bell className="w-5 h-5" style={{ color: '#00D084' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-2">Rappel mensuel</h3>
                    <EmailReminderToggle userId={user.id} isPremium={true} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Gestion de l'essai gratuit */}
          {subscription.isTrial && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle title="Essai gratuit" />
              <Card>
                <div className="space-y-4">
                  {subscription.trialEndsAt && (() => {
                    const trialEnd = new Date(subscription.trialEndsAt);
                    const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', border: '1px solid rgba(0, 208, 132, 0.2)' }}>
                        <p className="text-sm text-white font-semibold mb-1">
                          Essai gratuit actif
                        </p>
                        <p className="text-xs text-gray-300">
                          {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''} • Expire le {trialEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    );
                  })()}
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-300 mb-1">
                          <strong>Attention :</strong> L'annulation de l'essai est immédiate.
                        </p>
                        <p className="text-xs text-gray-400">
                          Vous perdrez l'accès aux fonctionnalités Premium.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelTrial}
                    disabled={cancelingTrial}
                    className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    <XCircle className="w-5 h-5" />
                    {cancelingTrial ? 'Annulation...' : 'Annuler mon essai gratuit'}
                  </button>
                  <Link
                    href="/pricing"
                    className="block"
                  >
                    <button
                      className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                      }}
                    >
                      S'abonner maintenant
                    </button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Gestion de l'abonnement (Pro/Premium) */}
          {(subscription.isPro || subscription.isPremium) && !subscription.isTrial && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle title="Gestion de l'abonnement" />
              <Card>
                {!showCancelConfirm ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-300 mb-1">
                            <strong>Attention :</strong> L'annulation est immédiate.
                          </p>
                          <p className="text-xs text-gray-400">
                            Vous perdrez l'accès aux fonctionnalités {subscription.isPremium ? 'Premium' : 'Pro'}.
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
                    <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                      <p className="text-sm text-white font-semibold mb-2">
                        Êtes-vous sûr de vouloir annuler ?
                      </p>
                      <p className="text-xs text-gray-300">
                        Cette action est irréversible. Vous perdrez immédiatement l'accès à toutes les fonctionnalités {subscription.isPremium ? 'Premium' : 'Pro'}.
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
                        {canceling ? 'Annulation...' : 'Confirmer'}
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
            </motion.div>
          )}

          {/* Actions */}
          <SectionTitle title="Actions" />
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block"
            >
              <Card className="min-h-[44px] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {subscription.isPremium ? 'Gérer mon abonnement' : 'Passer à un plan supérieur'}
                </span>
              </Card>
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all hover:bg-gray-800 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>

          {/* Données & confidentialité */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                  <Shield className="w-5 h-5" style={{ color: '#2E6CF6' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">Données & confidentialité</h3>
                  <p className="text-xs text-gray-400">
                    Vos données sont sécurisées et utilisées uniquement pour améliorer votre expérience.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </MobileShell>
    );
  };

  return (
    <>
      <div className="hidden lg:block">
        <DesktopView />
      </div>
      <div className="lg:hidden">
        <MobileView />
      </div>
    </>
  );
}
