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
import { User as UserIcon, Mail, CreditCard, Bell, AlertTriangle, XCircle, LogOut, Shield, Trash2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComptePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [customerDefaults, setCustomerDefaults] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    vat_rate: 0,
  });
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  const [savingDefaults, setSavingDefaults] = useState(false);

  useEffect(() => {
    const fetchUserAndDefaults = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          
          // Charger les valeurs par défaut pour les factures
          const { data: defaults } = await supabase
            .from('customer_defaults')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (defaults) {
            setCustomerDefaults({
              customer_name: defaults.customer_name || '',
              customer_email: defaults.customer_email || '',
              customer_address: defaults.customer_address || '',
              vat_rate: defaults.vat_rate || 0,
            });
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
        setLoadingDefaults(false);
      }
    };

    fetchUserAndDefaults();
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

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, confirmationText: deleteConfirmation }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Erreur: ${data.error || 'Une erreur est survenue'}`);
        setDeleting(false);
        return;
      }

      // Déconnexion et redirection
      await supabase.auth.signOut();
      alert('Votre compte a été supprimé définitivement.');
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la suppression du compte.');
      setDeleting(false);
    }
  };

  const handleSaveDefaults = async () => {
    if (!user) return;
    
    setSavingDefaults(true);
    try {
      const defaultValues = {
        user_id: user.id,
        customer_name: customerDefaults.customer_name.trim() || null,
        customer_email: customerDefaults.customer_email.trim() || null,
        customer_address: customerDefaults.customer_address.trim() || null,
        vat_rate: Number(customerDefaults.vat_rate) || 0,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('customer_defaults')
        .upsert(defaultValues, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      alert('Les valeurs par défaut ont été sauvegardées avec succès.');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setSavingDefaults(false);
    }
  };

  const handleClearDefaults = async () => {
    if (!user) return;
    if (!confirm('Voulez-vous effacer toutes les valeurs par défaut ?')) return;
    
    try {
      await supabase
        .from('customer_defaults')
        .delete()
        .eq('user_id', user.id);

      setCustomerDefaults({
        customer_name: '',
        customer_email: '',
        customer_address: '',
        vat_rate: 0,
      });

      alert('Les valeurs par défaut ont été effacées.');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la suppression.');
    }
  };

  // Desktop version
  const DesktopView = () => (
    <div>
      <h1 className="text-3xl font-semibold text-white mb-8">Mon compte</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Informations utilisateur */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Informations</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                <Mail className="w-6 h-6" style={{ color: '#2E6CF6' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">E-mail</p>
                <p className="text-base font-medium text-white">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                <CreditCard className="w-6 h-6" style={{ color: '#2E6CF6' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Plan d'abonnement</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <BadgePlan plan={getPlanType()} />
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

        {/* Actions rapides */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
              }}
            >
              {subscription.isPremium ? 'Gérer mon abonnement' : 'Passer à un plan supérieur'}
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
        </Card>
      </div>

      {/* Préférences email (Premium) */}
      {subscription.isPremium && user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Préférences</h2>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
                <Bell className="w-6 h-6" style={{ color: '#00D084' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-2">Rappel mensuel</h3>
                <EmailReminderToggle userId={user.id} isPremium={true} />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Valeurs par défaut des factures (Pro/Premium) */}
      {(subscription.isPro || subscription.isPremium) && user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                  <FileText className="w-6 h-6" style={{ color: '#2E6CF6' }} />
                </div>
                <h2 className="text-lg font-semibold text-white">Valeurs par défaut des factures</h2>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Ces informations seront automatiquement remplies lors de la création d'une nouvelle facture.
            </p>
            {!loadingDefaults && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du client par défaut
                  </label>
                  <input
                    type="text"
                    value={customerDefaults.customer_name}
                    onChange={(e) => setCustomerDefaults({ ...customerDefaults, customer_name: e.target.value })}
                    placeholder="Ex: Mon entreprise principale"
                    className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-500"
                    style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email par défaut
                  </label>
                  <input
                    type="email"
                    value={customerDefaults.customer_email}
                    onChange={(e) => setCustomerDefaults({ ...customerDefaults, customer_email: e.target.value })}
                    placeholder="client@exemple.com"
                    className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-500"
                    style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adresse par défaut
                  </label>
                  <textarea
                    value={customerDefaults.customer_address}
                    onChange={(e) => setCustomerDefaults({ ...customerDefaults, customer_address: e.target.value })}
                    placeholder="Ex: 123 Rue de la Paix, 75000 Paris"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-500"
                    style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Taux de TVA par défaut (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={customerDefaults.vat_rate}
                    onChange={(e) => setCustomerDefaults({ ...customerDefaults, vat_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveDefaults}
                    disabled={savingDefaults}
                    className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
                  >
                    {savingDefaults ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={handleClearDefaults}
                    disabled={savingDefaults}
                    className="px-6 py-3 rounded-lg text-gray-300 font-medium transition-all hover:bg-gray-800 disabled:opacity-50"
                    style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                  >
                    Effacer
                  </button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Gestion de l'essai gratuit */}
      {subscription.isTrial && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Essai gratuit</h2>
            <div className="space-y-4">
              {subscription.trialEndsAt && (() => {
                const trialEnd = new Date(subscription.trialEndsAt);
                const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', border: '1px solid rgba(0, 208, 132, 0.2)' }}>
                    <p className="text-base text-white font-semibold mb-1">
                      Essai gratuit actif
                    </p>
                    <p className="text-sm text-gray-300">
                      {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''} • Expire le {trialEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                );
              })()}
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300 mb-1">
                      <strong>Attention :</strong> L'annulation de l'essai est immédiate.
                    </p>
                    <p className="text-sm text-gray-400">
                      Vous perdrez l'accès aux fonctionnalités Premium.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCancelTrial}
                disabled={cancelingTrial}
                className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: '#dc2626' }}
              >
                <XCircle className="w-5 h-5" />
                {cancelingTrial ? 'Annulation...' : 'Annuler mon essai gratuit'}
              </button>
              <Link href="/pricing" className="block">
                <button
                  className="w-full px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
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
          className="mb-6"
        >
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Gestion de l'abonnement</h2>
            {!showCancelConfirm ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">
                        <strong>Attention :</strong> L'annulation est immédiate.
                      </p>
                      <p className="text-sm text-gray-400">
                        Vous perdrez l'accès aux fonctionnalités {subscription.isPremium ? 'Premium' : 'Pro'}.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={canceling}
                  className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <XCircle className="w-5 h-5" />
                  Annuler mon abonnement
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                  <p className="text-base text-white font-semibold mb-2">
                    Êtes-vous sûr de vouloir annuler ?
                  </p>
                  <p className="text-sm text-gray-300">
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
                    className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-6 py-3 rounded-lg text-gray-300 font-medium transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Données & confidentialité */}
      <Card className="mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
            <Shield className="w-6 h-6" style={{ color: '#2E6CF6' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Données & confidentialité</h3>
            <p className="text-sm text-gray-400">
              Vos données sont sécurisées et utilisées uniquement pour améliorer votre expérience.
            </p>
          </div>
        </div>
      </Card>

      {/* Section suppression du compte */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Zone de danger</h2>
        <Card>
            {!showDeleteConfirm ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-semibold mb-1">
                        Suppression définitive du compte
                      </p>
                      <p className="text-sm text-gray-400">
                        Cette action est irréversible. Toutes vos données (calculs, factures, abonnements) seront définitivement supprimées.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <Trash2 className="w-5 h-5" />
                  Supprimer mon compte
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50">
                  <p className="text-base text-white font-semibold mb-3">
                    ⚠️ Êtes-vous absolument sûr ?
                  </p>
                  <p className="text-sm text-gray-300 mb-3">
                    Cette action supprimera définitivement :
                  </p>
                  <ul className="text-sm text-gray-300 space-y-2 mb-4 ml-6 list-disc">
                    <li>Votre compte utilisateur</li>
                    <li>Tous vos calculs et historiques</li>
                    <li>Toutes vos factures</li>
                    <li>Votre abonnement (si actif)</li>
                    <li>Toutes vos données personnelles</li>
                  </ul>
                  <p className="text-sm text-red-300 font-semibold">
                    Cette action est IRRÉVERSIBLE et ne peut pas être annulée.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Pour confirmer, tapez <strong className="text-red-400">SUPPRIMER</strong> ci-dessous :
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="SUPPRIMER"
                    className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    style={{ 
                      backgroundColor: '#0e0f12',
                      border: '1px solid #2d3441'
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmation !== 'SUPPRIMER'}
                    className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    {deleting ? 'Suppression en cours...' : 'Supprimer définitivement'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmation('');
                    }}
                    disabled={deleting}
                    className="px-6 py-3 rounded-lg text-gray-300 font-medium transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
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

          {/* Valeurs par défaut des factures (Pro/Premium) - Mobile */}
          {(subscription.isPro || subscription.isPremium) && user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle title="Factures - Valeurs par défaut" />
              <Card>
                <p className="text-xs text-gray-400 mb-4">
                  Ces informations seront automatiquement remplies lors de la création d'une nouvelle facture.
                </p>
                {!loadingDefaults && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Nom du client par défaut
                      </label>
                      <input
                        type="text"
                        value={customerDefaults.customer_name}
                        onChange={(e) => setCustomerDefaults({ ...customerDefaults, customer_name: e.target.value })}
                        placeholder="Ex: Mon entreprise principale"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                        style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Email par défaut
                      </label>
                      <input
                        type="email"
                        value={customerDefaults.customer_email}
                        onChange={(e) => setCustomerDefaults({ ...customerDefaults, customer_email: e.target.value })}
                        placeholder="client@exemple.com"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                        style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Adresse par défaut
                      </label>
                      <textarea
                        value={customerDefaults.customer_address}
                        onChange={(e) => setCustomerDefaults({ ...customerDefaults, customer_address: e.target.value })}
                        placeholder="Ex: 123 Rue de la Paix, 75000 Paris"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500"
                        style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Taux de TVA par défaut (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={customerDefaults.vat_rate}
                        onChange={(e) => setCustomerDefaults({ ...customerDefaults, vat_rate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white"
                        style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveDefaults}
                        disabled={savingDefaults}
                        className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
                      >
                        {savingDefaults ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        onClick={handleClearDefaults}
                        disabled={savingDefaults}
                        className="px-4 py-2 rounded-lg text-gray-300 text-sm font-medium transition-all hover:bg-gray-800 disabled:opacity-50"
                        style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                      >
                        Effacer
                      </button>
                    </div>
                  </div>
                )}
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

          {/* Suppression du compte */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionTitle title="Zone de danger" />
            <Card>
              {!showDeleteConfirm ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-red-300 font-semibold mb-1">
                          Suppression définitive du compte
                        </p>
                        <p className="text-xs text-gray-400">
                          Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting}
                    className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    <Trash2 className="w-5 h-5" />
                    Supprimer mon compte
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50">
                    <p className="text-sm text-white font-semibold mb-2">
                      ⚠️ Êtes-vous absolument sûr ?
                    </p>
                    <p className="text-xs text-gray-300 mb-3">
                      Cette action supprimera définitivement :
                    </p>
                    <ul className="text-xs text-gray-300 space-y-1 mb-3 ml-4 list-disc">
                      <li>Votre compte utilisateur</li>
                      <li>Tous vos calculs et historiques</li>
                      <li>Toutes vos factures</li>
                      <li>Votre abonnement (si actif)</li>
                      <li>Toutes vos données personnelles</li>
                    </ul>
                    <p className="text-xs text-red-300 font-semibold">
                      Cette action est IRRÉVERSIBLE et ne peut pas être annulée.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-2">
                      Pour confirmer, tapez <strong className="text-red-400">SUPPRIMER</strong> ci-dessous :
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="SUPPRIMER"
                      className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{ 
                        backgroundColor: '#0e0f12',
                        border: '1px solid #2d3441'
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteConfirmation !== 'SUPPRIMER'}
                      className="flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      {deleting ? 'Suppression...' : 'Supprimer définitivement'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmation('');
                      }}
                      disabled={deleting}
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
