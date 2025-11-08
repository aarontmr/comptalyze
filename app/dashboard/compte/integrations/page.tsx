'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { ShoppingCart, CreditCard, Check, X, ExternalLink, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Integration {
  id: string;
  provider: 'shopify' | 'stripe';
  shop_domain?: string;
  stripe_account_id?: string;
  is_active: boolean;
  connected_at: string;
  last_sync_at?: string;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadIntegrations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const subscription = getUserSubscription(session.user);
    if (!subscription.isPremium) {
      router.push('/pricing');
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const loadIntegrations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error: fetchError } = await supabase
        .from('integration_tokens')
        .select('*')
        .eq('user_id', session.user.id);

      if (fetchError) throw fetchError;

      setIntegrations(data || []);
    } catch (err: any) {
      console.error('Erreur chargement intégrations:', err);
    }
  };

  const handleConnect = (provider: 'shopify' | 'stripe') => {
    if (!user) return;
    setActionLoading(provider);
    window.location.href = `/api/integrations/${provider}/connect?userId=${user.id}&return=/dashboard/compte/integrations`;
  };

  const handleDisconnect = async (integrationId: string, provider: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${provider === 'shopify' ? 'Shopify' : 'Stripe'} ?\n\nLe sync automatique sera arrêté.`)) {
      return;
    }

    setActionLoading(integrationId);
    setError(null);
    setSuccess(null);

    try {
      const { error: deleteError } = await supabase
        .from('integration_tokens')
        .delete()
        .eq('id', integrationId);

      if (deleteError) throw deleteError;

      setSuccess(`${provider === 'shopify' ? 'Shopify' : 'Stripe'} déconnecté avec succès`);
      await loadIntegrations();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déconnexion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualSync = async (provider: string) => {
    setActionLoading(`sync-${provider}`);
    setError(null);
    setSuccess(null);

    try {
      // Appel à l'API de sync manuel (à créer si besoin)
      const response = await fetch('/api/integrations/sync-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) throw new Error('Échec du sync');

      setSuccess(`${provider === 'shopify' ? 'Shopify' : 'Stripe'} synchronisé !`);
      await loadIntegrations();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la synchronisation');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2E6CF6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const shopifyIntegration = integrations.find(i => i.provider === 'shopify' && i.is_active);
  const stripeIntegration = integrations.find(i => i.provider === 'stripe' && i.is_active);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Intégrations</h1>
        <p className="text-gray-400">
          Connectez Shopify ou Stripe pour synchroniser automatiquement votre CA
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', border: '1px solid rgba(0, 208, 132, 0.3)' }}
        >
          <Check className="w-5 h-5 text-[#00D084] flex-shrink-0" />
          <p className="text-sm text-[#00D084]">{success}</p>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="mb-8 p-5 rounded-xl" style={{ backgroundColor: 'rgba(46, 108, 246, 0.05)', border: '1px solid rgba(46, 108, 246, 0.2)' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
            <RefreshCw className="w-5 h-5" style={{ color: '#2E6CF6' }} />
          </div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">Synchronisation automatique</p>
            <p className="text-gray-400">
              Chaque dernier jour du mois à 23h, votre CA est importé automatiquement et vous recevez un email récapitulatif.
              Vous pouvez aussi forcer une synchronisation manuelle à tout moment.
            </p>
          </div>
        </div>
      </div>

      {/* Intégrations Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Shopify */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: '#14161b',
            border: shopifyIntegration ? '1px solid rgba(0, 208, 132, 0.3)' : '1px solid #1f232b',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(149, 208, 90, 0.1)' }}>
                <ShoppingCart className="w-6 h-6" style={{ color: '#95D05A' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Shopify</h3>
                <p className="text-xs text-gray-400">E-commerce</p>
              </div>
            </div>
            {shopifyIntegration && (
              <div className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', color: '#00D084' }}>
                ✓ Connecté
              </div>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Importez automatiquement vos commandes et votre CA depuis votre boutique Shopify.
          </p>

          {shopifyIntegration ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1d24' }}>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-400">Boutique :</span>
                  <span className="text-white font-medium">{shopifyIntegration.shop_domain}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-400">Connecté le :</span>
                  <span className="text-white">{new Date(shopifyIntegration.connected_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {shopifyIntegration.last_sync_at && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Dernier sync :</span>
                    <span className="text-white">{new Date(shopifyIntegration.last_sync_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleManualSync('shopify')}
                  disabled={actionLoading === 'sync-shopify'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px]"
                  style={{ background: 'linear-gradient(135deg, #95D05A 0%, #76B432 100%)' }}
                >
                  {actionLoading === 'sync-shopify' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Sync...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm">Sync manuel</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDisconnect(shopifyIntegration.id, 'shopify')}
                  disabled={actionLoading === shopifyIntegration.id}
                  className="px-4 py-2.5 rounded-lg text-red-400 hover:text-white font-medium transition-all hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {actionLoading === shopifyIntegration.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleConnect('shopify')}
              disabled={actionLoading === 'shopify'}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[48px]"
              style={{ background: 'linear-gradient(135deg, #95D05A 0%, #76B432 100%)', boxShadow: '0 4px 12px rgba(149, 208, 90, 0.3)' }}
            >
              {actionLoading === 'shopify' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  <span>Connecter Shopify</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Stripe */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: '#14161b',
            border: stripeIntegration ? '1px solid rgba(0, 208, 132, 0.3)' : '1px solid #1f232b',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(99, 91, 255, 0.1)' }}>
                <CreditCard className="w-6 h-6" style={{ color: '#635BFF' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Stripe</h3>
                <p className="text-xs text-gray-400">Paiements en ligne</p>
              </div>
            </div>
            {stripeIntegration && (
              <div className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', color: '#00D084' }}>
                ✓ Connecté
              </div>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Synchronisez vos paiements Stripe pour un suivi automatique de votre CA.
          </p>

          {stripeIntegration ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#1a1d24' }}>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-400">Account ID :</span>
                  <span className="text-white font-mono text-xs">{stripeIntegration.stripe_account_id?.substring(0, 20)}...</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-400">Connecté le :</span>
                  <span className="text-white">{new Date(stripeIntegration.connected_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {stripeIntegration.last_sync_at && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Dernier sync :</span>
                    <span className="text-white">{new Date(stripeIntegration.last_sync_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleManualSync('stripe')}
                  disabled={actionLoading === 'sync-stripe'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px]"
                  style={{ background: 'linear-gradient(135deg, #635BFF 0%, #4B45D6 100%)' }}
                >
                  {actionLoading === 'sync-stripe' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Sync...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm">Sync manuel</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDisconnect(stripeIntegration.id, 'stripe')}
                  disabled={actionLoading === stripeIntegration.id}
                  className="px-4 py-2.5 rounded-lg text-red-400 hover:text-white font-medium transition-all hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {actionLoading === stripeIntegration.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleConnect('stripe')}
              disabled={actionLoading === 'stripe'}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[48px]"
              style={{ background: 'linear-gradient(135deg, #635BFF 0%, #4B45D6 100%)', boxShadow: '0 4px 12px rgba(99, 91, 255, 0.3)' }}
            >
              {actionLoading === 'stripe' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  <span>Connecter Stripe</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sécurité Info */}
      <div className="mt-8 p-5 rounded-xl" style={{ backgroundColor: 'rgba(0, 208, 132, 0.05)', border: '1px solid rgba(0, 208, 132, 0.2)' }}>
        <h3 className="text-sm font-semibold text-white mb-2">🔒 Sécurité</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✓ Vos tokens sont chiffrés (AES-256) dans la base de données</li>
          <li>✓ Comptalyze ne peut que <strong>lire</strong> vos données, jamais les modifier</li>
          <li>✓ OAuth standard (même sécurité que "Se connecter avec Google")</li>
          <li>✓ Déconnexion instantanée si vous le souhaitez</li>
        </ul>
      </div>

      {/* Help */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Besoin d'aide ? <a href="mailto:support@comptalyze.fr" className="text-[#2E6CF6] hover:text-[#00D084] transition-colors">Contactez le support</a>
        </p>
      </div>
    </div>
  );
}

