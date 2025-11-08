'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, HelpCircle, TrendingDown, Calendar } from 'lucide-react';
import { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';

interface Step3ACREProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3ACRE({ data, onUpdate, onNext, onBack }: Step3ACREProps) {
  const [hasACRE, setHasACRE] = useState<boolean>(data.has_acre);
  const [acreYear, setAcreYear] = useState<number | null>(data.acre_year);
  const [creationDate, setCreationDate] = useState<string>(data.company_creation_date || '');

  const handleACREToggle = (value: boolean) => {
    setHasACRE(value);
    if (!value) {
      setAcreYear(null);
      onUpdate({ has_acre: false, acre_year: null });
    } else {
      onUpdate({ has_acre: true });
    }
  };

  const handleYearSelect = (year: number) => {
    setAcreYear(year);
    onUpdate({ acre_year: year });
  };

  const handleDateChange = (date: string) => {
    setCreationDate(date);
    onUpdate({ company_creation_date: date });
  };

  const handleNext = () => {
    if (hasACRE && !acreYear) {
      alert('Veuillez sélectionner votre année ACRE');
      return;
    }
    if (hasACRE && !creationDate) {
      alert('Veuillez indiquer votre date de création d\'entreprise');
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
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
            <TrendingDown className="w-6 h-6" style={{ color: '#00D084' }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">ACRE (Exonération)</h2>
        </div>
        <p className="text-sm text-gray-400">
          Bénéficiez-vous de l'ACRE ? Cela réduit vos cotisations pendant 3 ans.
        </p>
      </div>

      {/* Question principale */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Avez-vous l'ACRE ?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleACREToggle(true)}
            className={`p-3 sm:p-4 rounded-xl font-semibold transition-all min-h-[48px] text-sm sm:text-base ${
              hasACRE
                ? 'ring-2 ring-[#00D084] text-white'
                : 'ring-1 ring-gray-800 text-gray-400 hover:ring-gray-700'
            }`}
            style={{
              backgroundColor: hasACRE ? 'rgba(0, 208, 132, 0.1)' : '#1a1d24',
            }}
          >
            ✓ Oui
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleACREToggle(false)}
            className={`p-3 sm:p-4 rounded-xl font-semibold transition-all min-h-[48px] text-sm sm:text-base ${
              !hasACRE
                ? 'ring-2 ring-[#2E6CF6] text-white'
                : 'ring-1 ring-gray-800 text-gray-400 hover:ring-gray-700'
            }`}
            style={{
              backgroundColor: !hasACRE ? 'rgba(46, 108, 246, 0.1)' : '#1a1d24',
            }}
          >
            ✗ Non
          </motion.button>
        </div>
      </div>

      {/* Si oui : année ACRE */}
      {hasACRE && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6 mb-6"
        >
          {/* Année ACRE */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              En quelle année ACRE êtes-vous ?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((year) => (
                <motion.button
                  key={year}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleYearSelect(year)}
                  className={`p-3 sm:p-4 rounded-xl font-semibold transition-all min-h-[48px] text-sm sm:text-base ${
                    acreYear === year
                      ? 'ring-2 ring-[#00D084] text-white'
                      : 'ring-1 ring-gray-800 text-gray-400 hover:ring-gray-700'
                  }`}
                  style={{
                    backgroundColor: acreYear === year ? 'rgba(0, 208, 132, 0.1)' : '#1a1d24',
                  }}
                >
                  Année {year}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Année 1 : -50% de cotisations | Année 2 : -25% | Année 3 : -10%
            </p>
          </div>

          {/* Date de création */}
          <div>
            <label htmlFor="creation-date" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Calendar className="w-4 h-4" />
              Date de création de votre entreprise
            </label>
            <input
              id="creation-date"
              type="date"
              value={creationDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white transition-all focus:ring-2 focus:ring-[#00D084] outline-none"
              style={{
                backgroundColor: '#1a1d24',
                border: '1px solid #2d3441',
                fontSize: '16px',
                WebkitAppearance: 'none',
              }}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </motion.div>
      )}

      {/* Info ACRE */}
      <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgba(0, 208, 132, 0.05)', border: '1px solid rgba(0, 208, 132, 0.2)' }}>
        <div className="flex items-start gap-2">
          <HelpCircle className="w-5 h-5 flex-shrink-0 text-[#00D084]" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Qu'est-ce que l'ACRE ?</p>
            <p className="text-xs text-gray-400">
              L'ACRE (Aide à la Création ou à la Reprise d'une Entreprise) réduit vos cotisations sociales pendant 3 ans. 
              Si vous avez créé votre entreprise récemment, vous en bénéficiez probablement !
            </p>
          </div>
        </div>
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
    </div>
  );
}

