'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, ExternalLink, Zap, Check, ShoppingCart, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { OnboardingData } from './OnboardingFlow';
import { supabase } from '@/lib/supabaseClient';

interface Step4IntegrationsProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  userId: string;
}

export default function Step4Integrations({ data, onUpdate, onNext, onBack, userId }: Step4IntegrationsProps) {
  const [shopifyConnected, setShopifyConnected] = useState(data.shopify_connected);
  const [stripeConnected, setStripeConnected] = useState(data.stripe_connected);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si des intégrations existent déjà
    checkExistingIntegrations();
  }, []);

  const checkExistingIntegrations = async () => {
    try {
      const { data: integrations } = await supabase
        .from('integration_tokens')
        .select('provider, is_active')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (integrations) {
        const shopify = integrations.find(i => i.provider === 'shopify');
        const stripe = integrations.find(i => i.provider === 'stripe');
        
        if (shopify) {
          setShopifyConnected(true);
          onUpdate({ shopify_connected: true });
        }
        if (stripe) {
          setStripeConnected(true);
          onUpdate({ stripe_connected: true });
        }
      }
    } catch (error) {
      console.error('Erreur vérification intégrations:', error);
    }
  };

  const handleShopifyConnect = () => {
    setLoading('shopify');
    // Redirection vers OAuth Shopify
    window.location.href = `/api/integrations/shopify/connect?userId=${userId}&return=/dashboard/onboarding-premium`;
  };

  const handleStripeConnect = () => {
    setLoading('stripe');
    // Redirection vers Stripe Connect
    window.location.href = `/api/integrations/stripe/connect?userId=${userId}&return=/dashboard/onboarding-premium`;
  };

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: '#14161b',
        border: '1px solid rgba(46, 108, 246, 0.3)',
      }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
            <Zap className="w-6 h-6" style={{ color: '#00D084' }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Synchronisation automatique</h2>
        </div>
        <p className="text-sm text-gray-400">
          Connectez vos outils pour importer automatiquement votre CA et gagner du temps.
        </p>
      </div>

      {/* Shopify */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl mb-4"
        style={{
          backgroundColor: '#1a1d24',
          border: shopifyConnected ? '1px solid rgba(0, 208, 132, 0.3)' : '1px solid #2d3441',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(149, 208, 90, 0.1)' }}>
                <ShoppingCart className="w-5 h-5" style={{ color: '#95D05A' }} />
              </div>
              <h3 className="text-lg font-semibold text-white">Shopify</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Importez automatiquement vos commandes et votre CA depuis votre boutique Shopify.
            </p>
            
            {shopifyConnected ? (
              <div className="flex items-center gap-2 text-sm text-[#00D084]">
                <Check className="w-4 h-4" />
                <span className="font-medium">Connecté</span>
              </div>
            ) : (
              <button
                onClick={handleShopifyConnect}
                disabled={loading === 'shopify'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                style={{
                  background: 'linear-gradient(135deg, #95D05A 0%, #76B432 100%)',
                  boxShadow: '0 2px 10px rgba(149, 208, 90, 0.3)',
                }}
              >
                {loading === 'shopify' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Connecter Shopify</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stripe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-xl mb-6"
        style={{
          backgroundColor: '#1a1d24',
          border: stripeConnected ? '1px solid rgba(0, 208, 132, 0.3)' : '1px solid #2d3441',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(99, 91, 255, 0.1)' }}>
                <CreditCard className="w-5 h-5" style={{ color: '#635BFF' }} />
              </div>
              <h3 className="text-lg font-semibold text-white">Stripe</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Synchronisez vos paiements Stripe pour un suivi automatique de votre CA.
            </p>
            
            {stripeConnected ? (
              <div className="flex items-center gap-2 text-sm text-[#00D084]">
                <Check className="w-4 h-4" />
                <span className="font-medium">Connecté</span>
              </div>
            ) : (
              <button
                onClick={handleStripeConnect}
                disabled={loading === 'stripe'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                style={{
                  background: 'linear-gradient(135deg, #635BFF 0%, #4B45D6 100%)',
                  boxShadow: '0 2px 10px rgba(99, 91, 255, 0.3)',
                }}
              >
                {loading === 'stripe' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Connecter Stripe</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info */}
      <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgba(46, 108, 246, 0.05)', border: '1px solid rgba(46, 108, 246, 0.2)' }}>
        <p className="text-sm text-gray-300">
          🔒 <span className="font-medium">Sécurisé</span> : Vos tokens sont chiffrés (AES-256). Comptalyze ne peut jamais modifier vos données, seulement les lire.<br />
          <span className="text-xs text-gray-400 mt-1 block">Vous pouvez vous déconnecter à tout moment depuis les réglages.</span>
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:text-white font-medium transition-colors border border-gray-800 hover:border-gray-700 w-full sm:w-auto min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 w-full sm:w-auto min-h-[48px]"
          style={{
            background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            boxShadow: '0 4px 20px rgba(46, 108, 246, 0.4)',
          }}
        >
          <span>Continuer</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-4">
        💡 Vous pourrez connecter ou déconnecter ces services plus tard dans les Réglages
      </p>
    </div>
  );
}

