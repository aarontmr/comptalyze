'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calculator, Sparkles, ArrowRight } from 'lucide-react';
import { computeMonth, mapActivityType, type IRMode } from '@/lib/calculs';

type ActivityType = 'vente' | 'services' | 'liberal';

interface ActivityConfig {
  label: string;
  rate: number;
}

const activities: Record<ActivityType, ActivityConfig> = {
  vente: { label: 'Vente de marchandises', rate: 0.123 },
  services: { label: 'Prestation de services', rate: 0.212 },
  liberal: { label: 'Activité libérale', rate: 0.211 },
};

export default function UrssafCalculatorDemo() {
  const [ca, setCa] = useState<string>('3000');
  const [activity, setActivity] = useState<ActivityType>('services');
  const [irMode, setIrMode] = useState<IRMode>('none');
  const [baremeProvisionRate, setBaremeProvisionRate] = useState<string>('6');

  // Calculs
  const caValue = parseFloat(ca) || 0;
  const selectedActivity = activity ? activities[activity] : null;
  const baseRate = selectedActivity ? selectedActivity.rate : 0;

  // Calculs avec IR via computeMonth
  let calcResult = null;
  if (caValue > 0 && selectedActivity && activity) {
    const activityForCalc = mapActivityType(activity);
    const baremeRate = parseFloat(baremeProvisionRate) / 100 || 0.06;
    calcResult = computeMonth({
      ca: caValue,
      activity: activityForCalc,
      cotisRate: baseRate,
      irMode: irMode,
      baremeProvisionRate: baremeRate,
    });
  }

  const charges = calcResult?.cotis || 0;
  const ir = calcResult?.ir || 0;
  const net = calcResult?.netAfterCotis || (caValue - charges);
  const netAfterAll = calcResult?.netAfterAll || net;
  const annualNet = netAfterAll * 12;
  const annualCharges = charges * 12;

  const formatEuro = (value: number): string => {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Afficher les résultats automatiquement quand on a des valeurs valides
  const showResults = caValue > 0 && selectedActivity;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,208,132,0.05) 0%, rgba(46,108,246,0.05) 100%)',
          border: '1px solid rgba(46,108,246,0.2)',
          boxShadow: '0 8px 32px rgba(46,108,246,0.15)',
        }}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b" style={{ borderColor: 'rgba(46,108,246,0.2)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(0,208,132,0.15) 0%, rgba(46,108,246,0.15) 100%)',
              }}
            >
              <Calculator className="w-6 h-6" style={{ color: '#00D084' }} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Calculez vos cotisations URSSAF
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Essayez notre calculateur gratuitement
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CA */}
            <div>
              <label htmlFor="demo-ca" className="block text-sm font-medium text-gray-300 mb-2">
                Chiffre d&apos;affaires (€)
              </label>
              <input
                id="demo-ca"
                type="number"
                min="0"
                step="100"
                value={ca}
                onChange={(e) => {
                  setCa(e.target.value);
                }}
                placeholder="3000"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  backgroundColor: '#16181d',
                  border: '1px solid #374151',
                }}
              />
            </div>

            {/* Activité */}
            <div>
              <label htmlFor="demo-activity" className="block text-sm font-medium text-gray-300 mb-2">
                Type d&apos;activité
              </label>
              <select
                id="demo-activity"
                value={activity}
                onChange={(e) => {
                  setActivity(e.target.value as ActivityType);
                }}
                className="w-full px-4 py-3 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  backgroundColor: '#16181d',
                  border: '1px solid #374151',
                }}
              >
                {Object.entries(activities).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} ({config.rate * 100}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* IR Mode */}
          <div>
            <label htmlFor="demo-ir" className="block text-sm font-medium text-gray-300 mb-2">
              Impôt sur le Revenu (optionnel)
            </label>
            <select
              id="demo-ir"
              value={irMode}
              onChange={(e) => {
                setIrMode(e.target.value as IRMode);
              }}
              className="w-full px-4 py-3 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              style={{
                backgroundColor: '#16181d',
                border: '1px solid #374151',
              }}
            >
              <option value="none">Aucun (juste cotisations URSSAF)</option>
              <option value="vl">Versement libératoire (taux fixe 1-2,2%)</option>
              <option value="bareme">Barème classique (selon vos revenus)</option>
            </select>
          </div>

          {/* Taux de provision IR */}
          {irMode === 'bareme' && (
            <div>
              <label htmlFor="demo-bareme" className="block text-sm font-medium text-gray-300 mb-2">
                Taux de provision IR (%)
              </label>
              <input
                id="demo-bareme"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={baremeProvisionRate}
                onChange={(e) => {
                  setBaremeProvisionRate(e.target.value);
                }}
                placeholder="6"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  backgroundColor: '#16181d',
                  border: '1px solid #374151',
                }}
              />
            </div>
          )}

        </div>

        {/* Résultats */}
        {showResults && (
          <motion.div
            id="demo-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 sm:p-8 border-t space-y-6"
            style={{
              borderColor: 'rgba(46,108,246,0.2)',
              background: 'linear-gradient(135deg, rgba(0,208,132,0.03) 0%, rgba(46,108,246,0.03) 100%)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: '#00D084' }} />
              <h4 className="text-lg font-semibold text-white">Résultats de votre simulation</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CA */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#16181d', border: '1px solid #374151' }}>
                <p className="text-xs text-gray-400 mb-1">Chiffre d&apos;affaires</p>
                <p className="text-xl font-bold text-white">{formatEuro(caValue)} €</p>
              </div>

              {/* Cotisations */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#16181d', border: '1px solid #374151' }}>
                <p className="text-xs text-gray-400 mb-1">Cotisations URSSAF</p>
                <p className="text-xl font-bold" style={{ color: '#00D084' }}>
                  {formatEuro(charges)} €
                </p>
              </div>

              {/* IR */}
              {irMode !== 'none' && ir > 0 && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#16181d', border: '1px solid #374151' }}>
                  <p className="text-xs text-gray-400 mb-1">Impôt sur le Revenu</p>
                  <p className="text-xl font-bold" style={{ color: '#00D084' }}>
                    {formatEuro(ir)} €
                  </p>
                </div>
              )}

              {/* Net */}
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: 'rgba(0,208,132,0.1)',
                  border: '1px solid rgba(0,208,132,0.3)',
                }}
              >
                <p className="text-xs text-gray-400 mb-1">Net après charges</p>
                <p className="text-xl font-bold" style={{ color: '#00D084' }}>
                  {formatEuro(netAfterAll)} €
                </p>
              </div>
            </div>

            {/* Projection annuelle */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#16181d', border: '1px solid #374151' }}>
              <p className="text-sm text-gray-400 mb-2">Projection annuelle</p>
              <p className="text-2xl font-bold text-white">
                {formatEuro(annualNet)} € nets
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sur une base de {formatEuro(annualCharges)} € de cotisations par an
              </p>
            </div>

            {/* CTA */}
            <div
              className="p-6 rounded-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)',
                border: '1px solid rgba(46,108,246,0.3)',
              }}
            >
              <div className="relative z-10">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Enregistrez vos calculs et suivez votre activité
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Créez un compte gratuit pour sauvegarder vos calculs, suivre votre croissance et exporter vos données en PDF.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-[1.05] hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                      boxShadow: '0 4px 15px rgba(46,108,246,0.3)',
                    }}
                  >
                    Créer un compte gratuit
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 hover:bg-gray-800/50"
                    style={{
                      border: '1px solid #374151',
                      backgroundColor: '#16181d',
                    }}
                  >
                    Voir les tarifs
                  </Link>
                </div>
              </div>
              {/* Décoration */}
              <div
                className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, #2E6CF6 0%, transparent 70%)',
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

