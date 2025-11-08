'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, HelpCircle, Percent } from 'lucide-react';
import { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface Step2IRRegimeProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2IRRegime({ data, onUpdate, onNext, onBack }: Step2IRRegimeProps) {
  const [selected, setSelected] = useState<'versement_liberatoire' | 'bareme' | 'non_soumis' | null>(data.ir_mode);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleSelect = (mode: 'versement_liberatoire' | 'bareme' | 'non_soumis') => {
    setSelected(mode);
    
    // Calculer le taux VL si applicable (simplifié, sera affiné plus tard)
    const rate = mode === 'versement_liberatoire' ? 2.2 : null;
    
    onUpdate({
      ir_mode: mode,
      ir_rate: rate,
    });
  };

  const handleNext = () => {
    if (!selected) {
      alert('Veuillez sélectionner votre situation fiscale');
      return;
    }
    onNext();
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
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
            <Percent className="w-6 h-6" style={{ color: '#2E6CF6' }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Régime d'Impôt sur le Revenu</h2>
        </div>
        <p className="text-sm text-gray-400">
          Choisissez votre mode d'imposition pour des calculs de revenus nets précis.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Option 1 : Versement Libératoire */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect('versement_liberatoire')}
          className={`relative p-6 rounded-xl text-left transition-all ${
            selected === 'versement_liberatoire'
              ? 'ring-2 ring-[#2E6CF6]'
              : 'ring-1 ring-gray-800 hover:ring-gray-700'
          }`}
          style={{
            backgroundColor: selected === 'versement_liberatoire' ? 'rgba(46, 108, 246, 0.1)' : '#1a1d24',
          }}
        >
          {selected === 'versement_liberatoire' && (
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}>
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          
          <div className="mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Versement Libératoire</h3>
            <p className="text-xs text-gray-400">Prélèvement mensuel avec votre CA</p>
          </div>
          
          <div className="space-y-2 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Impôt payé en même temps que cotisations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Taux fixe : 1% à 2.2% selon activité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Simplicité administrative</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(showTooltip === 'vl' ? null : 'vl');
            }}
            className="mt-3 flex items-center gap-1 text-xs text-[#2E6CF6] hover:text-[#00D084] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>En savoir plus</span>
          </button>

          {showTooltip === 'vl' && (
            <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)', border: '1px solid rgba(46, 108, 246, 0.3)' }}>
              <p className="text-gray-300">
                Le versement libératoire vous permet de payer votre impôt en même temps que vos cotisations URSSAF, chaque mois/trimestre. Taux : 1% (ventes), 1.7% (services BIC), 2.2% (services BNC).
              </p>
            </div>
          )}
        </motion.button>

        {/* Option 2 : Barème Progressif */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect('bareme')}
          className={`relative p-6 rounded-xl text-left transition-all ${
            selected === 'bareme'
              ? 'ring-2 ring-[#2E6CF6]'
              : 'ring-1 ring-gray-800 hover:ring-gray-700'
          }`}
          style={{
            backgroundColor: selected === 'bareme' ? 'rgba(46, 108, 246, 0.1)' : '#1a1d24',
          }}
        >
          {selected === 'bareme' && (
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}>
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          
          <div className="mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Barème Progressif</h3>
            <p className="text-xs text-gray-400">Déclaration annuelle classique</p>
          </div>
          
          <div className="space-y-2 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Impôt selon tranches de revenu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Déclaration une fois par an</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Potentiellement plus avantageux</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(showTooltip === 'bareme' ? null : 'bareme');
            }}
            className="mt-3 flex items-center gap-1 text-xs text-[#2E6CF6] hover:text-[#00D084] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>En savoir plus</span>
          </button>

          {showTooltip === 'bareme' && (
            <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)', border: '1px solid rgba(46, 108, 246, 0.3)' }}>
              <p className="text-gray-300">
                Le barème progressif applique les tranches d'imposition classiques à votre revenu. Vous déclarez une fois par an avec votre déclaration de revenus. Peut être plus avantageux si revenus faibles.
              </p>
            </div>
          )}
        </motion.button>

        {/* Option 3 : Pas encore soumis à l'IR */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect('non_soumis')}
          className={`relative p-6 rounded-xl text-left transition-all ${
            selected === 'non_soumis'
              ? 'ring-2 ring-[#00D084]'
              : 'ring-1 ring-gray-800 hover:ring-gray-700'
          }`}
          style={{
            backgroundColor: selected === 'non_soumis' ? 'rgba(0, 208, 132, 0.1)' : '#1a1d24',
          }}
        >
          {selected === 'non_soumis' && (
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}>
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          
          <div className="mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Pas encore soumis</h3>
            <p className="text-xs text-gray-400">Début d'activité ou revenus faibles</p>
          </div>
          
          <div className="space-y-2 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Revenus en dessous des seuils</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Première année d'activité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00D084]">✓</span>
              <span>Vous choisirez plus tard</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(showTooltip === 'non_soumis' ? null : 'non_soumis');
            }}
            className="mt-3 flex items-center gap-1 text-xs text-[#2E6CF6] hover:text-[#00D084] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>En savoir plus</span>
          </button>

          {showTooltip === 'non_soumis' && (
            <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', border: '1px solid rgba(0, 208, 132, 0.3)' }}>
              <p className="text-gray-300">
                Si vous venez de démarrer votre activité ou si vos revenus sont faibles, vous n'êtes peut-être pas encore concerné par l'impôt sur le revenu. Vous pourrez mettre à jour ce paramètre plus tard dans les réglages.
              </p>
            </div>
          )}
        </motion.button>
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
          onClick={handleNext}
          disabled={!selected}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto min-h-[48px]"
          style={{
            background: selected
              ? 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)'
              : '#374151',
            boxShadow: selected ? '0 4px 20px rgba(46, 108, 246, 0.4)' : 'none',
          }}
        >
          <span>Continuer</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

