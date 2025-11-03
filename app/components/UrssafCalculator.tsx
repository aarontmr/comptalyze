'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { getUserSubscription, hasFeatureAccess } from '@/lib/subscriptionUtils';

interface HistoryEntry {
  month: string;
  activity: string;
  ca: number;
  charges: number;
  net: number;
}

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

interface UrssafCalculatorProps {
  user?: User | null;
}

const FREE_PLAN_LIMIT = 3;

export default function UrssafCalculator({ user }: UrssafCalculatorProps) {
  const [ca, setCa] = useState<string>('');
  const [activity, setActivity] = useState<ActivityType | ''>('');
  const [showAnnual, setShowAnnual] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Vérifier le plan d'abonnement de l'utilisateur
  const subscription = getUserSubscription(user);
  const isPro = subscription.isPro;
  const isPremium = subscription.isPremium;
  
  // Calculs restants pour les utilisateurs gratuits
  const remainingCalculations = isPro ? Infinity : Math.max(0, FREE_PLAN_LIMIT - history.length);
  const canSave = isPro || remainingCalculations > 0;
  
  // Vérifier l'accès aux fonctionnalités
  const canExportPDF = hasFeatureAccess(user, 'export_pdf');
  const canUseUnlimitedCalculations = hasFeatureAccess(user, 'unlimited_calculations');

  // Debug (à retirer en production)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('UrssafCalculator - User:', user?.email);
      console.log('UrssafCalculator - isPro:', isPro);
      console.log('UrssafCalculator - user_metadata:', user?.user_metadata);
      console.log('UrssafCalculator - History length:', history.length);
      console.log('UrssafCalculator - Remaining:', remainingCalculations);
    }
  }, [user, isPro, history.length, remainingCalculations]);

  // Charger l'historique au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('comptalyzeHistory');
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          console.error('Erreur lors du chargement de l\'historique:', e);
        }
      }
    }
  }, []);

  // Calculs
  const caValue = parseFloat(ca) || 0;
  const selectedActivity = activity ? activities[activity] : null;
  const charges = selectedActivity ? caValue * selectedActivity.rate : 0;
  const net = caValue - charges;
  const annualNet = net * 12;
  const annualCharges = charges * 12;

  // Texte explicatif
  const getExplanation = (): string => {
    if (!caValue || !selectedActivity) {
      return '';
    }
    const ratePercent = (selectedActivity.rate * 100).toFixed(1);
    return `Pour une activité de ${selectedActivity.label.toLowerCase()}, le taux de cotisation est de ${ratePercent} %. Cela signifie que sur un chiffre d'affaires de ${caValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €, vous paierez ${charges.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € de cotisations et conserverez ${net.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € nets.`;
  };

  // Sauvegarder dans l'historique
  const saveToHistory = () => {
    if (!caValue || !selectedActivity) return;
    
    // Vérifier la limite pour les utilisateurs gratuits
    if (!isPro && history.length >= FREE_PLAN_LIMIT) {
      return;
    }

    const now = new Date();
    const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const entry: HistoryEntry = {
      month: capitalizedMonth,
      activity: selectedActivity.label,
      ca: caValue,
      charges,
      net,
    };

    const newHistory = [entry, ...history];
    setHistory(newHistory);
    localStorage.setItem('comptalyzeHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('comptalyzeHistory');
      setHistory([]);
    }
  };

  const formatEuro = (value: number): string => {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Simulateur de cotisations URSSAF
        </h2>

        {/* Bannière de plan pour les utilisateurs gratuits */}
        {!isPro && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ backgroundColor: '#1b2d1b', border: '1px solid #10b981' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400 mb-1">
                  Plan Gratuit • {history.length} / {FREE_PLAN_LIMIT} simulations utilisées
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Vous avez {remainingCalculations} simulation{remainingCalculations !== 1 ? 's' : ''} restante{remainingCalculations !== 1 ? 's' : ''}.
                  {history.length > 0 && ' Passez au plan Pro pour des simulations illimitées !'}
                </p>
                {history.length === 0 && (
                  <p className="text-xs text-gray-400 mb-3">
                    Commencez par créer vos premières simulations. Passez au plan Pro pour enregistrer sans limite.
                  </p>
                )}
              </div>
              <Link
                href="/pricing"
                className="ml-4 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                  boxShadow: '0 4px 15px rgba(46,108,246,0.3)',
                }}
              >
                Passer au Pro
              </Link>
            </div>
          </div>
        )}

        {/* Bannière pour les utilisateurs Pro */}
        {isPro && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ backgroundColor: '#1b2d1b', border: '1px solid #10b981' }}
          >
            <p className="text-sm font-medium text-green-400">
              ✓ Plan Pro activé • Simulations illimitées
            </p>
          </div>
        )}

        {/* Section de saisie */}
        <div
          className="mb-6 p-6 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="space-y-4">
            {/* Input CA */}
            <div>
              <label htmlFor="ca" className="block text-sm font-medium text-gray-300 mb-2">
                Chiffre d&apos;affaires (en €)
              </label>
              <input
                id="ca"
                type="number"
                min="0"
                step="0.01"
                value={ca}
                onChange={(e) => setCa(e.target.value)}
                placeholder="Entrez votre chiffre d'affaires (en €)"
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  backgroundColor: '#23272f',
                  border: '1px solid #2d3441',
                }}
              />
            </div>

            {/* Select activité */}
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-300 mb-2">
                Type d&apos;activité
              </label>
              <select
                id="activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityType | '')}
                className="w-full px-4 py-2.5 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  backgroundColor: '#23272f',
                  border: '1px solid #2d3441',
                }}
              >
                <option value="">Sélectionnez une activité</option>
                {Object.entries(activities).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} ({config.rate * 100}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox projection annuelle */}
            <div className="flex items-center">
              <input
                id="annual"
                type="checkbox"
                checked={showAnnual}
                onChange={(e) => setShowAnnual(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{
                  accentColor: '#2E6CF6',
                }}
              />
              <label htmlFor="annual" className="ml-2 text-sm text-gray-300">
                Afficher projection annuelle
              </label>
            </div>
          </div>
        </div>

        {/* Section résultats */}
        <div
          className="mb-6 p-6 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          {caValue > 0 && selectedActivity ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Cotisations URSSAF</p>
                <p className="text-xl font-semibold" style={{ color: '#00D084' }}>
                  {formatEuro(charges)} €
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Revenu net</p>
                <p className="text-xl font-semibold" style={{ color: '#00D084' }}>
                  {formatEuro(net)} €
                </p>
              </div>
              {showAnnual && (
                <div className="pt-4 border-t" style={{ borderColor: '#2d3441' }}>
                  <p className="text-sm text-gray-400 mb-2">Projection annuelle</p>
                  <p className="text-lg font-medium text-white">
                    {formatEuro(annualNet)} € nets / {formatEuro(annualCharges)} € de cotisations
                  </p>
                </div>
              )}
              <div className="pt-4 border-t" style={{ borderColor: '#2d3441' }}>
                <p className="text-sm text-gray-400 mb-2">Explication</p>
                <p className="text-sm text-gray-300">{getExplanation()}</p>
              </div>
              
              {/* Message de limite lorsque la limite est atteinte */}
              {!isPro && history.length >= FREE_PLAN_LIMIT && (
                <div
                  className="mt-4 p-4 rounded-lg"
                  style={{ backgroundColor: '#2d1b1b', border: '1px solid #ef4444' }}
                >
                  <p className="text-sm text-red-400 mb-2">
                    ⚠️ Limite atteinte : Vous avez utilisé vos {FREE_PLAN_LIMIT} simulations gratuites.
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Vous pouvez toujours visualiser les calculs, mais passez au plan Pro pour enregistrer de nouvelles simulations.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                      boxShadow: '0 4px 15px rgba(46,108,246,0.3)',
                    }}
                  >
                    Passer au plan Pro
                  </Link>
                </div>
              )}
              
              {/* Indicateur de simulations restantes */}
              {!isPro && history.length > 0 && history.length < FREE_PLAN_LIMIT && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#1b2d1b', border: '1px solid #10b981' }}>
                  <p className="text-xs text-green-400">
                    ✓ {remainingCalculations} simulation{remainingCalculations !== 1 ? 's' : ''} restante{remainingCalculations !== 1 ? 's' : ''} • Enregistrez ce calcul pour le sauvegarder
                  </p>
                </div>
              )}
              
              <button
                onClick={saveToHistory}
                disabled={!canSave || !caValue || !selectedActivity}
                className="w-full mt-4 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: canSave && caValue && selectedActivity
                    ? 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)'
                    : '#374151',
                  boxShadow: canSave && caValue && selectedActivity
                    ? '0 4px 15px rgba(46,108,246,0.3)'
                    : 'none',
                }}
              >
                {!canSave ? 'Limite atteinte' : 'Enregistrer ce calcul'}
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-center">
              Veuillez entrer un chiffre d&apos;affaires et choisir votre activité.
            </p>
          )}
        </div>

        {/* Section historique */}
        <div
          className="p-6 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Historique</h3>
              {!isPro && (
                <p className="text-xs text-gray-400 mt-1">
                  {history.length} / {FREE_PLAN_LIMIT} simulations utilisées
                </p>
              )}
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#ef4444' }}
              >
                Effacer l&apos;historique
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#2d3441' }}>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-400">Mois</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-400">Activité</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">CA</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Cotisations</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Revenu net</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? '' : ''}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(45, 52, 65, 0.3)',
                      }}
                    >
                      <td className="py-2 px-3 text-sm text-gray-300">{entry.month}</td>
                      <td className="py-2 px-3 text-sm text-gray-300">{entry.activity}</td>
                      <td className="py-2 px-3 text-sm text-gray-300 text-right">{formatEuro(entry.ca)} €</td>
                      <td className="py-2 px-3 text-sm text-gray-300 text-right">{formatEuro(entry.charges)} €</td>
                      <td className="py-2 px-3 text-sm font-medium text-right" style={{ color: '#00D084' }}>
                        {formatEuro(entry.net)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">
              Aucun historique enregistré pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

