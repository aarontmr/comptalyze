'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingData } from './OnboardingFlow';
import { supabase } from '@/lib/supabaseClient';

interface Step5RecapProps {
  data: OnboardingData;
  userId: string;
  onBack: () => void;
}

export default function Step5Recap({ data, userId, onBack }: Step5RecapProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Sauvegarder les préférences dans Supabase
      const { error: saveError } = await supabase
        .from('user_onboarding_data')
        .upsert({
          user_id: userId,
          ir_mode: data.ir_mode,
          ir_rate: data.ir_rate,
          has_acre: data.has_acre,
          acre_year: data.acre_year,
          company_creation_date: data.company_creation_date,
          onboarding_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (saveError) {
        throw saveError;
      }

      // Succès ! Rediriger vers dashboard
      setTimeout(() => {
        router.push('/dashboard?onboarding=completed');
      }, 1500);
    } catch (err: any) {
      console.error('Erreur sauvegarde onboarding:', err);
      setError(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const getIRLabel = () => {
    if (data.ir_mode === 'versement_liberatoire') {
      return `Versement Libératoire (${data.ir_rate}%)`;
    } else if (data.ir_mode === 'bareme') {
      return 'Barème Progressif';
    }
    return 'Non renseigné';
  };

  const getACRELabel = () => {
    if (data.has_acre) {
      return `Oui - Année ${data.acre_year} (${data.company_creation_date ? new Date(data.company_creation_date).toLocaleDateString('fr-FR') : 'Date non renseignée'})`;
    }
    return 'Non';
  };

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: '#14161b',
        border: '1px solid rgba(46, 108, 246, 0.3)',
      }}
    >
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{
            background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            boxShadow: '0 0 30px rgba(46, 108, 246, 0.4)',
          }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Récapitulatif</h2>
        <p className="text-sm text-gray-400">
          Vérifiez vos informations avant de finaliser
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="space-y-4 mb-6">
        {/* Régime IR */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Régime d'Impôt sur le Revenu</p>
              <p className="text-sm font-medium text-white">{getIRLabel()}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
              <Check className="w-4 h-4 text-[#2E6CF6]" />
            </div>
          </div>
        </motion.div>

        {/* ACRE */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">ACRE (Exonération)</p>
              <p className="text-sm font-medium text-white">{getACRELabel()}</p>
            </div>
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
              <Check className="w-4 h-4 text-[#00D084]" />
            </div>
          </div>
        </motion.div>

        {/* Intégrations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Intégrations connectées</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.shopify_connected && (
                  <span className="px-2 py-1 text-xs rounded-md bg-[#95D05A]/10 text-[#95D05A] border border-[#95D05A]/20">
                    Shopify
                  </span>
                )}
                {data.stripe_connected && (
                  <span className="px-2 py-1 text-xs rounded-md bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20">
                    Stripe
                  </span>
                )}
                {!data.shopify_connected && !data.stripe_connected && (
                  <span className="text-sm text-gray-400">Aucune</span>
                )}
              </div>
            </div>
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
              <Check className="w-4 h-4 text-[#00D084]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Avantages activés */}
      <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgba(0, 208, 132, 0.05)', border: '1px solid rgba(0, 208, 132, 0.2)' }}>
        <p className="text-sm font-medium text-white mb-2">✨ Fonctionnalités Premium activées :</p>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>✓ Calculs URSSAF personnalisés avec {data.ir_mode === 'versement_liberatoire' ? 'VL' : 'barème'}</li>
          {data.has_acre && <li>✓ Réduction ACRE année {data.acre_year} appliquée automatiquement</li>}
          <li>✓ ComptaBot adapté à votre situation fiscale</li>
          {(data.shopify_connected || data.stripe_connected) && (
            <li>✓ Synchronisation automatique de votre CA</li>
          )}
          <li>✓ Pré-remplissage des déclarations URSSAF</li>
        </ul>
      </div>

      {/* Erreur */}
      {error && (
        <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:text-white font-medium transition-colors border border-gray-800 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <button
          onClick={handleComplete}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[48px]"
          style={{
            background: loading
              ? '#374151'
              : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(46, 108, 246, 0.4)',
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Finalisation...</span>
            </>
          ) : (
            <>
              <span>Terminer la configuration</span>
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

