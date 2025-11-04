'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { getUserSubscription, hasFeatureAccess } from '@/lib/subscriptionUtils';
import { supabase } from '@/lib/supabaseClient';
import UrssafPrefill from './UrssafPrefill';
import { Trash2 } from 'lucide-react';

interface CARecord {
  id: string;
  year: number;
  month: number;
  activity_type: string;
  amount_eur: number;
  computed_net_eur: number;
  computed_contrib_eur: number;
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
          computed_net_eur: net,
          computed_contrib_eur: charges,
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

      showToastMessage('Enregistrement sauvegardé avec succès !');

      // Recharger l'historique
      await loadRecords();
      
      // Réinitialiser les champs
      setCa('');
      setActivity('');
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
          </div>
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
        style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
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
          <div className="overflow-x-auto">
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
        ) : (
          <p className="text-gray-400 text-center py-4">
            Aucun historique enregistré pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}

