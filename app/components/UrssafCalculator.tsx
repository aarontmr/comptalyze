'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getUserSubscription, hasFeatureAccess } from '@/lib/subscriptionUtils';
import { supabase } from '@/lib/supabaseClient';
import { trackEvent } from '@/lib/analytics';
import UrssafPrefill from './UrssafPrefill';
import { Trash2, Info } from 'lucide-react';
import { computeMonth, mapActivityType, type IRMode, type Activity } from '@/lib/calculs';

interface CARecord {
  id: string;
  year: number;
  month: number;
  activity_type: string;
  amount_eur: number;
  computed_net_eur: number;
  computed_contrib_eur: number;
  ir_mode?: string | null;
  ir_amount_eur?: number | null;
  created_at: string;
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

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

interface UrssafCalculatorProps {
  user?: User | null;
}

const FREE_PLAN_LIMIT = 3;

export default function UrssafCalculator({ user }: UrssafCalculatorProps) {
  const [ca, setCa] = useState<string>('');
  const [activity, setActivity] = useState<ActivityType | ''>('');
  const [showAnnual, setShowAnnual] = useState(false);
  const [hasACRE, setHasACRE] = useState(false);
  const [acreStartYear, setAcreStartYear] = useState<number>(new Date().getFullYear());
  const [irMode, setIrMode] = useState<IRMode>('none');
  const [baremeProvisionRate, setBaremeProvisionRate] = useState<string>('6');
  const [records, setRecords] = useState<CARecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showToast, setShowToast] = useState<string | null>(null);
  
  // Vérifier le plan d'abonnement de l'utilisateur
  const subscription = getUserSubscription(user);
  const isPro = subscription.isPro;
  const isPremium = subscription.isPremium;
  
  // Vérifier l'accès aux fonctionnalités
  const canExportPDF = hasFeatureAccess(user, 'export_pdf');
  
  // Années disponibles (année courante et 2 précédentes)
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  // Charger l'historique depuis Supabase
  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  const loadRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ca_records')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Erreur lors du chargement des enregistrements:', error);
        const errorMessage = error.message || JSON.stringify(error);
        showToastMessage(`Erreur lors du chargement: ${errorMessage}`);
        setRecords([]);
        return;
      }

      // Trier les enregistrements par date (du plus ancien au plus récent) pour calculer la croissance
      const sortedData = (data || []).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.month !== b.month) return a.month - b.month;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      setRecords(sortedData);
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      const errorMessage = error?.message || 'Erreur inconnue';
      showToastMessage(`Erreur lors du chargement: ${errorMessage}`);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer le taux de croissance
  const calculateGrowthRate = (currentIndex: number): string | null => {
    if (currentIndex === 0 || records.length === 0) {
      return null; // Pas de mois précédent pour le premier enregistrement
    }

    const currentRecord = records[currentIndex];
    const previousRecord = records[currentIndex - 1];

    const currentCA = Number(currentRecord.amount_eur);
    const previousCA = Number(previousRecord.amount_eur);

    if (previousCA === 0) {
      return currentCA > 0 ? '∞' : null;
    }

    const growthRate = ((currentCA - previousCA) / previousCA) * 100;
    return growthRate.toFixed(1);
  };

  // Calculer l'année ACRE (1ère, 2ème, 3ème année ou plus)
  const getACREYear = (): number => {
    if (!hasACRE) return 0;
    const currentYear = selectedYear;
    const yearDiff = currentYear - acreStartYear;
    
    // L'ACRE s'applique pendant 3 ans maximum
    if (yearDiff < 0) return 0; // Pas encore commencé
    if (yearDiff === 0) return 1; // 1ère année
    if (yearDiff === 1) return 2; // 2ème année
    if (yearDiff === 2) return 3; // 3ème année
    return 0; // Plus de 3 ans, ACRE terminé
  };

  // Calculer le taux réduit selon l'ACRE
  const getACREReducedRate = (baseRate: number): number => {
    const acreYear = getACREYear();
    
    if (acreYear === 0 || !hasACRE) return baseRate;
    
    // Réductions ACRE :
    // 1ère année : -50% (taux divisé par 2)
    // 2ème année : -25% (taux * 0.75)
    // 3ème année : -12.5% (taux * 0.875)
    switch (acreYear) {
      case 1:
        return baseRate * 0.5; // Réduction de 50%
      case 2:
        return baseRate * 0.75; // Réduction de 25%
      case 3:
        return baseRate * 0.875; // Réduction de 12.5%
      default:
        return baseRate;
    }
  };

  // Calculs
  const caValue = parseFloat(ca) || 0;
  const selectedActivity = activity ? activities[activity] : null;
  const baseRate = selectedActivity ? selectedActivity.rate : 0;
  const effectiveRate = hasACRE && selectedActivity ? getACREReducedRate(baseRate) : baseRate;
  
  // Calculs avec IR via computeMonth
  let calcResult = null;
  if (caValue > 0 && selectedActivity && activity) {
    const activityForCalc = mapActivityType(activity);
    const baremeRate = parseFloat(baremeProvisionRate) / 100 || 0.06;
    calcResult = computeMonth({
      ca: caValue,
      activity: activityForCalc,
      cotisRate: effectiveRate,
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
  const annualIR = ir * 12;

  // Texte explicatif
  const getExplanation = (): string => {
    if (!caValue || !selectedActivity) {
      return '';
    }
    const baseRatePercent = (baseRate * 100).toFixed(1);
    const effectiveRatePercent = (effectiveRate * 100).toFixed(1);
    const acreYear = getACREYear();
    
    let explanation = `Pour une activité de ${selectedActivity.label.toLowerCase()}, `;
    
    if (hasACRE && acreYear > 0) {
      const reduction = acreYear === 1 ? '50%' : acreYear === 2 ? '25%' : '12,5%';
      explanation += `le taux de cotisation normal est de ${baseRatePercent}%, mais avec l'ACRE (${acreYear}ère année d'activité, réduction de ${reduction}), le taux effectif est de ${effectiveRatePercent}%. `;
    } else {
      explanation += `le taux de cotisation est de ${baseRatePercent}%. `;
    }
    
    explanation += `Sur un chiffre d'affaires de ${caValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €, vous paierez ${charges.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € de cotisations`;
    
    if (irMode !== 'none' && ir > 0) {
      if (irMode === 'vl') {
        explanation += ` et ${ir.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € d'impôt sur le revenu (versement libératoire)`;
      } else {
        explanation += ` et ${ir.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € d'impôt sur le revenu (provision barème)`;
      }
    }
    
    explanation += `. Vous conserverez ${netAfterAll.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € nets après déduction de toutes les charges.`;
    
    return explanation;
  };

  // Sauvegarder dans Supabase
  const saveToHistory = async () => {
    if (!caValue || !selectedActivity || !user) return;
    
    // Vérifier la limite pour les utilisateurs gratuits
    if (!isPro && records.length >= FREE_PLAN_LIMIT) {
      showToastMessage('Limite atteinte. Passez au plan Pro pour enregistrer sans limite.');
      return;
    }

    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('ca_records')
        .insert({
          user_id: user.id,
          year: selectedYear,
          month: selectedMonth,
          activity_type: selectedActivity.label,
          amount_eur: caValue,
          computed_net_eur: netAfterAll,
          computed_contrib_eur: charges,
          ir_mode: irMode !== 'none' ? irMode : null,
          ir_amount_eur: irMode !== 'none' ? ir : null,
        })
        .select();

      if (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        let errorMessage = 'Erreur inconnue';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.code) {
          errorMessage = `Code d'erreur: ${error.code}`;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          try {
            errorMessage = JSON.stringify(error);
          } catch {
            errorMessage = 'Erreur lors de l\'enregistrement';
          }
        }
        
        // Si c'est une erreur de contrainte unique (peut arriver si la contrainte existe encore)
        if (error.code === '23505') {
          showToastMessage(`Un enregistrement existe déjà pour ce mois/activité. ${errorMessage}`);
        } else if (error.code === 'PGRST116') {
          showToastMessage('Aucun enregistrement retourné. Vérifiez vos permissions.');
        } else if (error.code === '42501') {
          showToastMessage('Permission refusée. Vérifiez vos politiques RLS dans Supabase.');
        } else {
          showToastMessage(`Erreur lors de l'enregistrement: ${errorMessage}`);
        }
        return;
      }

      if (!data || data.length === 0) {
        showToastMessage('Aucun enregistrement n\'a été créé. Vérifiez les logs pour plus de détails.');
        return;
      }

      // Track record created
      await trackEvent('record_created', {
        type: 'ca_record',
        activity_type: selectedActivity.label,
        amount_eur: caValue,
      });

      // Vérifier les seuils après l'enregistrement (en arrière-plan, sans bloquer)
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) return;

          // Appeler l'API de vérification des seuils
          await fetch('/api/cron/check-thresholds', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
        } catch (error) {
          // Erreur silencieuse
          console.error('Erreur vérification seuils:', error);
        }
      })();

      showToastMessage('Enregistrement sauvegardé avec succès !');

      // Recharger l'historique
      await loadRecords();
      
      // Réinitialiser les champs
      setCa('');
      setActivity('');
      setIrMode('none');
      setBaremeProvisionRate('6');
    } catch (error) {
      console.error('Erreur:', error);
      showToastMessage('Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour supprimer un enregistrement
  const deleteRecord = async (recordId: string) => {
    if (!user || !confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      return;
    }

    try {
      setDeleting(recordId);
      
      const { error } = await supabase
        .from('ca_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        showToastMessage(`Erreur lors de la suppression: ${error.message}`);
        return;
      }

      showToastMessage('Enregistrement supprimé avec succès !');
      
      // Recharger l'historique
      await loadRecords();
      
      // Émettre un événement personnalisé pour mettre à jour les statistiques
      window.dispatchEvent(new CustomEvent('ca_records_updated'));
    } catch (error: any) {
      console.error('Erreur:', error);
      showToastMessage(`Erreur lors de la suppression: ${error?.message || 'Erreur inconnue'}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!user || !canExportPDF) return;

    try {
      setExporting(true);
      
      // Récupérer le token d'accès
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showToastMessage('Vous devez être connecté pour exporter le PDF.');
        return;
      }

      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers,
        body: JSON.stringify({ year: selectedYear }),
      });

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Si ce n'est pas du JSON, essayer de lire le texte
        const text = await response.text();
        console.error('Réponse non-JSON:', text);
        showToastMessage('Erreur: Le serveur a renvoyé une réponse inattendue.');
        return;
      }

      if (!response.ok) {
        const errorMessage = data.error || 'Erreur lors de l\'export.';
        console.error('Erreur export PDF:', errorMessage);
        showToastMessage(errorMessage);
        return;
      }

      showToastMessage('PDF envoyé à votre e-mail ! Vérifiez votre boîte de réception.');
    } catch (error: any) {
      console.error('Erreur lors de l\'export:', error);
      showToastMessage(`Erreur lors de l'export: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setExporting(false);
    }
  };

  const showToastMessage = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 5000);
  };

  const formatEuro = (value: number): string => {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculer le nombre d'enregistrements pour les utilisateurs gratuits
  const remainingCalculations = isPro ? Infinity : Math.max(0, FREE_PLAN_LIMIT - records.length);
  const canSave = isPro || remainingCalculations > 0;

  return (
    <div className="w-full">
      {/* Toast message */}
      {showToast && (
        <div
          className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white shadow-lg animate-in slide-in-from-top"
          style={{
            background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
          }}
        >
          {showToast}
        </div>
      )}

      {/* Bannière de plan pour les utilisateurs gratuits */}
      {!isPro && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: '#1b2d1b', border: '1px solid #10b981' }}
        >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400 mb-1">
                  Plan Gratuit • {records.length} / {FREE_PLAN_LIMIT} enregistrements utilisés
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Vous avez {remainingCalculations} enregistrement{remainingCalculations !== 1 ? 's' : ''} restant{remainingCalculations !== 1 ? 's' : ''}.
                  {records.length > 0 && ' Passez au plan Pro pour des enregistrements illimités !'}
                </p>
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

      {/* Bannière pour les utilisateurs Pro/Premium */}
      {isPro && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: '#1b2d1b', border: '1px solid #10b981' }}
        >
          <p className="text-sm font-medium text-green-400">
            ✓ Plan {isPremium ? 'Premium' : 'Pro'} activé • Enregistrements illimités
          </p>
        </div>
      )}

      {/* Section de saisie */}
      <div
        className="mb-6 p-6 rounded-xl"
        style={{ backgroundColor: '#16181d', border: '1px solid #374151' }}
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

            {/* Sélecteurs mois/année */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-300 mb-2">
                  Mois
                </label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  style={{
                    backgroundColor: '#23272f',
                    border: '1px solid #2d3441',
                  }}
                >
                  {MONTHS.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
                  Année
                </label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  style={{
                    backgroundColor: '#23272f',
                    border: '1px solid #2d3441',
                  }}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sélecteur de régime IR */}
            <div>
              <label htmlFor="irMode" className="block text-sm font-medium text-gray-300 mb-2">
                Régime d&apos;impôt sur le revenu
              </label>
              <select
                id="irMode"
                value={irMode}
                onChange={(e) => setIrMode(e.target.value as IRMode)}
                className="w-full px-4 py-2.5 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  backgroundColor: '#23272f',
                  border: '1px solid #2d3441',
                }}
              >
                <option value="none">Aucun (juste cotisations)</option>
                <option value="vl">Versement libératoire</option>
                <option value="bareme">Barème classique (provision)</option>
              </select>
            </div>

            {/* Input taux de provision (si barème sélectionné) */}
            {irMode === 'bareme' && (
              <div>
                <label htmlFor="baremeProvisionRate" className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    Taux de provision IR (%)
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 p-4 rounded-lg text-xs text-gray-300 bg-[#23272f] border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                        <p className="font-semibold text-gray-200 mb-2">Comment estimer votre taux d&apos;impôt ?</p>
                        <p className="mb-2">
                          Le barème progressif de l&apos;IR dépend de votre situation (revenus du foyer, situation familiale, tranches d&apos;imposition).
                        </p>
                        <p className="mb-2">
                          <strong>Pour calculer votre taux moyen :</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mb-2">
                          <li>IR payé ÷ Revenu net imposable = Taux moyen</li>
                          <li>Consultez votre dernière déclaration d&apos;impôt</li>
                          <li>Ou utilisez le simulateur sur impots.gouv.fr</li>
                        </ul>
                        <p className="text-yellow-400">
                          ⚠️ Valeur par défaut : 6% (estimation moyenne). À ajuster selon votre situation.
                        </p>
                      </div>
                    </div>
                  </span>
                </label>
                <input
                  id="baremeProvisionRate"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={baremeProvisionRate}
                  onChange={(e) => setBaremeProvisionRate(e.target.value)}
                  placeholder="6"
                  className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  style={{
                    backgroundColor: '#23272f',
                    border: '1px solid #2d3441',
                  }}
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 <strong>Exemple :</strong> Si vous avez payé 1200€ d&apos;IR sur 20 000€ de revenu net imposable, votre taux moyen est de 6% (1200 ÷ 20000 = 0.06).
                </p>
              </div>
            )}

            {/* Info note pour versement libératoire */}
            {irMode === 'vl' && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)', border: '1px solid rgba(46, 108, 246, 0.3)' }}>
                <p className="text-sm text-gray-300">
                  <strong className="text-blue-400">Le versement libératoire</strong> est payé en même temps que vos cotisations URSSAF :
                </p>
                <ul className="mt-2 text-xs text-gray-400 space-y-1 ml-4 list-disc">
                  <li>1% ventes</li>
                  <li>1,7% prestations BIC</li>
                  <li>2,2% BNC</li>
                </ul>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-3">
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
              
              <div className="flex items-center">
                <input
                  id="acre"
                  type="checkbox"
                  checked={hasACRE}
                  onChange={(e) => setHasACRE(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{
                    accentColor: '#2E6CF6',
                  }}
                />
                <label htmlFor="acre" className="ml-2 text-sm text-gray-300">
                  Je bénéficie de l&apos;ACRE (Aide aux Créateurs et Repreneurs d&apos;Entreprise)
                </label>
              </div>
              
              {hasACRE && (
                <div className="ml-6 pl-4 border-l-2" style={{ borderColor: '#2E6CF6' }}>
                  <label htmlFor="acreStartYear" className="block text-xs text-gray-400 mb-2">
                    Année de début d&apos;activité (pour calculer l&apos;année ACRE)
                  </label>
                  <select
                    id="acreStartYear"
                    value={acreStartYear}
                    onChange={(e) => setAcreStartYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    style={{
                      backgroundColor: '#23272f',
                      border: '1px solid #2d3441',
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => currentYear - i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {getACREYear() > 0 && (
                    <p className="mt-2 text-xs text-green-400">
                      ✓ {getACREYear()}ère année ACRE en {selectedYear} (réduction de {getACREYear() === 1 ? '50%' : getACREYear() === 2 ? '25%' : '12,5%'})
                    </p>
                  )}
                  {getACREYear() === 0 && hasACRE && (
                    <p className="mt-2 text-xs text-yellow-400">
                      ⚠️ L&apos;ACRE s&apos;applique pendant 3 ans maximum. Vérifiez votre année de début d&apos;activité.
                    </p>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Section résultats */}
      <div
        className="mb-6 p-6 rounded-xl"
        style={{ backgroundColor: '#16181d', border: '1px solid #374151' }}
      >
        {caValue > 0 && selectedActivity ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {hasACRE && getACREYear() > 0 && (
              <div className="p-3 rounded-lg mb-2" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', border: '1px solid rgba(0, 208, 132, 0.3)' }}>
                <p className="text-xs text-gray-300">
                  <strong className="text-green-400">ACRE actif</strong> : Taux normal {baseRate ? (baseRate * 100).toFixed(1) : '0'}% → 
                  Taux effectif <strong className="text-green-400">{(effectiveRate * 100).toFixed(1)}%</strong> 
                  ({getACREYear() === 1 ? 'réduction de 50%' : getACREYear() === 2 ? 'réduction de 25%' : 'réduction de 12,5%'})
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-sm text-gray-400 mb-1">Cotisations sociales</p>
                <p className="text-xl font-semibold" style={{ color: '#00D084' }}>
                  {formatEuro(charges)} €
                </p>
                {hasACRE && getACREYear() > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Économie grâce à l&apos;ACRE : {formatEuro((baseRate * caValue) - charges)} €
                  </p>
                )}
              </motion.div>

              {irMode !== 'none' && ir > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-gray-400">
                      IR {irMode === 'vl' ? '(versement libératoire)' : '(provision barème)'}
                    </p>
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-gray-500 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 p-4 rounded-lg text-xs text-gray-300 bg-[#23272f] border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                        {irMode === 'vl' ? (
                          <>
                            <p className="font-semibold text-gray-200 mb-2">Versement libératoire</p>
                            <p className="mb-2">Taux fixes selon activité :</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>1% ventes</li>
                              <li>1,7% prestations BIC</li>
                              <li>2,2% BNC</li>
                            </ul>
                            <p className="mt-2 text-blue-400">Payé en même temps que vos cotisations URSSAF.</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-gray-200 mb-2">Provision barème classique</p>
                            <p className="mb-2">
                              <strong>Calcul :</strong> (CA - Abattement forfaitaire) × Taux de provision
                            </p>
                            <p className="mb-2">
                              <strong>Abattements :</strong> 71% ventes • 50% services • 34% BNC
                            </p>
                            <p className="text-yellow-400 mb-2">
                              ⚠️ Estimation indicative. Le montant réel dépend de votre foyer fiscal (revenus du conjoint, nombre d&apos;enfants, tranches d&apos;imposition).
                            </p>
                            <p className="text-xs text-gray-400">
                              Consultez votre déclaration d&apos;impôt ou impots.gouv.fr pour un calcul précis.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xl font-semibold" style={{ color: '#00D084' }}>
                    {formatEuro(ir)} €
                  </p>
                  {irMode === 'bareme' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Basé sur un taux de provision de {baremeProvisionRate}% • {formatEuro(caValue * (activity === 'vente' ? 0.71 : activity === 'services' ? 0.5 : 0.34))} € d&apos;abattement
                    </p>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-gray-400 mb-1">Net après cotisations</p>
                <p className="text-xl font-semibold" style={{ color: '#00D084' }}>
                  {formatEuro(net)} €
                </p>
              </motion.div>

              {irMode !== 'none' && ir > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <p className="text-sm text-gray-400 mb-1">Net après cotisations + IR</p>
                  <p className="text-xl font-semibold" style={{ color: '#00D084' }}>
                    {formatEuro(netAfterAll)} €
                  </p>
                </motion.div>
              )}
            </div>

            {showAnnual && (
              <motion.div 
                className="pt-4 border-t" 
                style={{ borderColor: '#2d3441' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm text-gray-400 mb-2">Projection annuelle</p>
                <p className="text-lg font-medium text-white">
                  {formatEuro(annualNet)} € nets
                  {irMode !== 'none' && ir > 0 && ` / ${formatEuro(annualCharges)} € cotisations + ${formatEuro(annualIR)} € IR`}
                  {irMode === 'none' && ` / ${formatEuro(annualCharges)} € de cotisations`}
                </p>
              </motion.div>
            )}
            <div className="pt-4 border-t" style={{ borderColor: '#2d3441' }}>
              <p className="text-sm text-gray-400 mb-2">Explication</p>
              <p className="text-sm text-gray-300">{getExplanation()}</p>
            </div>
            
            {/* Message de limite lorsque la limite est atteinte */}
            {!isPro && records.length >= FREE_PLAN_LIMIT && (
              <div
                className="mt-4 p-4 rounded-lg"
                style={{ backgroundColor: '#2d1b1b', border: '1px solid #ef4444' }}
              >
                <p className="text-sm text-red-400 mb-2">
                  ⚠️ Limite atteinte : Vous avez utilisé vos {FREE_PLAN_LIMIT} enregistrements gratuits.
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Vous pouvez toujours visualiser les calculs, mais passez au plan Pro pour enregistrer de nouveaux enregistrements.
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
            {!isPro && records.length > 0 && records.length < FREE_PLAN_LIMIT && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#1b2d1b', border: '1px solid #10b981' }}>
                <p className="text-xs text-green-400">
                  ✓ {remainingCalculations} enregistrement{remainingCalculations !== 1 ? 's' : ''} restant{remainingCalculations !== 1 ? 's' : ''} • Enregistrez ce calcul pour le sauvegarder
                </p>
              </div>
            )}
            
            <button
              onClick={saveToHistory}
              disabled={!canSave || !caValue || !selectedActivity || saving}
              className="w-full mt-4 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: canSave && caValue && selectedActivity && !saving
                  ? 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)'
                  : '#374151',
                boxShadow: canSave && caValue && selectedActivity && !saving
                  ? '0 4px 15px rgba(46,108,246,0.3)'
                  : 'none',
              }}
            >
              {saving ? 'Enregistrement...' : (!canSave ? 'Limite atteinte' : 'Enregistrer ce calcul')}
            </button>

            {/* Bouton export PDF (Pro+) */}
            {canExportPDF && records.length > 0 && (
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="w-full mt-3 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: exporting
                    ? '#374151'
                    : 'linear-gradient(135deg, #2E6CF6 0%, #00D084 100%)',
                  boxShadow: exporting
                    ? 'none'
                    : '0 4px 15px rgba(0,208,132,0.3)',
                }}
              >
                {exporting ? 'Génération du PDF...' : 'Exporter en PDF par e-mail'}
              </button>
            )}
          </motion.div>
        ) : (
          <p className="text-gray-400 text-center">
            Veuillez entrer un chiffre d&apos;affaires et choisir votre activité.
          </p>
        )}
      </div>

      {/* Pré-remplissage URSSAF (Premium only) */}
      {isPremium && user && (
        <div className="mt-6">
          <UrssafPrefill userId={user.id} />
        </div>
      )}

      {/* Section historique */}
      <div
        className="p-6 rounded-xl mt-6"
        style={{ backgroundColor: '#16181d', border: '1px solid #374151' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Historique</h3>
            {!isPro && (
              <p className="text-xs text-gray-400 mt-1">
                {records.length} / {FREE_PLAN_LIMIT} enregistrements utilisés
              </p>
            )}
          </div>
          {canExportPDF && records.length > 0 && (
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: exporting
                  ? '#374151'
                  : 'linear-gradient(135deg, #2E6CF6 0%, #00D084 100%)',
                boxShadow: exporting
                  ? 'none'
                  : '0 4px 15px rgba(0,208,132,0.3)',
              }}
            >
              {exporting ? 'Export...' : 'Exporter en PDF'}
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-4">Chargement...</p>
        ) : records.length > 0 ? (
          <>
            {/* Version Desktop - Tableau */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#2d3441' }}>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-400">Mois/Année</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-400">Activité</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">CA</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Cotisations</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Net</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-400">Croissance</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => {
                      const growthRate = calculateGrowthRate(index);
                      const growthValue = growthRate ? parseFloat(growthRate) : null;
                      const isPositive = growthValue !== null && growthValue > 0;
                      const isNegative = growthValue !== null && growthValue < 0;

                    return (
                      <tr
                        key={record.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(45, 52, 65, 0.3)',
                        }}
                      >
                        <td className="py-2 px-3 text-sm text-gray-300">
                          {MONTHS[record.month - 1]} {record.year}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-300">{record.activity_type}</td>
                        <td className="py-2 px-3 text-sm text-gray-300 text-right">
                          {formatEuro(Number(record.amount_eur))} €
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-300 text-right">
                          {formatEuro(Number(record.computed_contrib_eur))} €
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-right" style={{ color: '#00D084' }}>
                          {formatEuro(Number(record.computed_net_eur))} €
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-right">
                          {growthRate === null ? (
                            <span className="text-gray-500">-</span>
                          ) : growthRate === '∞' ? (
                            <span style={{ color: '#00D084' }}>+∞</span>
                          ) : (
                            <span
                              style={{
                                color: isPositive ? '#00D084' : isNegative ? '#ef4444' : '#9ca3af',
                              }}
                            >
                              {isPositive ? '+' : ''}{growthRate}%
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => deleteRecord(record.id)}
                            disabled={deleting === record.id}
                            className="inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              color: deleting === record.id ? '#9ca3af' : '#ef4444',
                            }}
                            title="Supprimer cet enregistrement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t" style={{ borderColor: '#2d3441' }}>
                    <td colSpan={2} className="py-3 px-3 text-sm font-semibold text-white">
                      CA Annuel (total)
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold text-white text-right">
                      {formatEuro(
                        records.reduce((sum, record) => sum + Number(record.amount_eur), 0)
                      )} €
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold text-gray-400 text-right">
                      {formatEuro(
                        records.reduce((sum, record) => sum + Number(record.computed_contrib_eur), 0)
                      )} €
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold text-right" style={{ color: '#00D084' }}>
                      {formatEuro(
                        records.reduce((sum, record) => sum + Number(record.computed_net_eur), 0)
                      )} €
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold text-gray-500 text-right">
                      -
                    </td>
                    <td className="py-3 px-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Version Mobile - Cartes */}
            <div className="md:hidden space-y-3">
              {records.map((record, index) => {
                const growthRate = calculateGrowthRate(index);
                const growthValue = growthRate ? parseFloat(growthRate) : null;
                const isPositive = growthValue !== null && growthValue > 0;
                const isNegative = growthValue !== null && growthValue < 0;

                return (
                  <div
                    key={record.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: '#1a1d24',
                      border: '1px solid #2d3441',
                    }}
                  >
                    {/* En-tête avec date et action */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {MONTHS[record.month - 1]} {record.year}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{record.activity_type}</p>
                      </div>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        disabled={deleting === record.id}
                        className="inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          color: deleting === record.id ? '#9ca3af' : '#ef4444',
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Données principales */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">CA</span>
                        <span className="text-sm font-medium text-white">
                          {formatEuro(Number(record.amount_eur))} €
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Cotisations</span>
                        <span className="text-sm text-gray-300">
                          {formatEuro(Number(record.computed_contrib_eur))} €
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t" style={{ borderColor: '#2d3441' }}>
                        <span className="text-xs font-medium text-gray-300">Net</span>
                        <span className="text-base font-semibold" style={{ color: '#00D084' }}>
                          {formatEuro(Number(record.computed_net_eur))} €
                        </span>
                      </div>
                      {growthRate !== null && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Croissance</span>
                          {growthRate === '∞' ? (
                            <span className="text-sm font-medium" style={{ color: '#00D084' }}>+∞</span>
                          ) : (
                            <span
                              className="text-sm font-medium"
                              style={{
                                color: isPositive ? '#00D084' : isNegative ? '#ef4444' : '#9ca3af',
                              }}
                            >
                              {isPositive ? '+' : ''}{growthRate}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Total mobile */}
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: '#23272f',
                  border: '1px solid #00D084',
                }}
              >
                <p className="text-sm font-semibold text-white mb-3">CA Annuel (total)</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">CA Total</span>
                    <span className="text-sm font-semibold text-white">
                      {formatEuro(
                        records.reduce((sum, record) => sum + Number(record.amount_eur), 0)
                      )} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Cotisations Total</span>
                    <span className="text-sm text-gray-300">
                      {formatEuro(
                        records.reduce((sum, record) => sum + Number(record.computed_contrib_eur), 0)
                      )} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: '#2d3441' }}>
                    <span className="text-xs font-medium text-gray-300">Net Total</span>
                    <span className="text-base font-semibold" style={{ color: '#00D084' }}>
                      {formatEuro(
                        records.reduce((sum, record) => sum + Number(record.computed_net_eur), 0)
                      )} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center py-4">
            Aucun historique enregistré pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}

