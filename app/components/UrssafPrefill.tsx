'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserPlan } from '@/lib/plan';

interface UrssafPrefillProps {
  userId: string;
}

export default function UrssafPrefill({ userId }: UrssafPrefillProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState<number | null>(null);
  const [quarter, setQuarter] = useState<number | null>(null);
  const [activityType, setActivityType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [prefillText, setPrefillText] = useState<string | null>(null);
  const [plan, setPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [checkingPlan, setCheckingPlan] = useState(true);

  // Vérifier le plan au chargement
  useEffect(() => {
    const checkPlan = async () => {
      const userPlan = await getUserPlan(supabase, userId);
      setPlan(userPlan);
      setCheckingPlan(false);
    };
    checkPlan();
  }, [userId]);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handleGenerate = async () => {
    if (plan !== 'premium') {
      alert('Cette fonctionnalité est disponible avec le plan Premium');
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch('/api/urssaf/prefill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          year,
          month: month || null,
          quarter: quarter || null,
          activity_type: activityType || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erreur lors de la génération');
        return;
      }

      setPrefillText(data.text);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (prefillText) {
      navigator.clipboard.writeText(prefillText);
      alert('Texte copié dans le presse-papiers');
    }
  };

  const handleDownload = () => {
    if (prefillText) {
      const blob = new Blob([prefillText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pre-remplissage-urssaf-${year}${month ? `-${month}` : ''}${quarter ? `-Q${quarter}` : ''}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleMonthChange = (value: string) => {
    if (value === '') {
      setMonth(null);
      setQuarter(null);
    } else {
      setMonth(parseInt(value));
      setQuarter(null);
    }
  };

  const handleQuarterChange = (value: string) => {
    if (value === '') {
      setQuarter(null);
      setMonth(null);
    } else {
      setQuarter(parseInt(value));
      setMonth(null);
    }
  };

  if (checkingPlan) {
    return (
      <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
      <h3 className="text-xl font-semibold text-white mb-4">Pré-remplissage URSSAF</h3>

      {plan !== 'premium' && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}>
          <p className="text-gray-300 mb-3">
            Disponible avec le plan <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>Premium</span>
          </p>
          <a
            href="/pricing"
            className="inline-block px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
          >
            Passer à Premium
          </a>
        </div>
      )}

      {plan === 'premium' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Année</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min="2020"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type d'activité (optionnel)</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
              >
                <option value="">Toutes activités</option>
                <option value="vente">Vente</option>
                <option value="services">Services</option>
                <option value="liberal">Libéral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mois (optionnel)</label>
              <select
                value={month || ''}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
              >
                <option value="">Tous les mois</option>
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Trimestre (optionnel)</label>
              <select
                value={quarter || ''}
                onChange={(e) => handleQuarterChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
              >
                <option value="">Aucun</option>
                <option value="1">Trimestre 1 (Jan-Mar)</option>
                <option value="2">Trimestre 2 (Avr-Juin)</option>
                <option value="3">Trimestre 3 (Juil-Sep)</option>
                <option value="4">Trimestre 4 (Oct-Déc)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90 disabled:opacity-50 mb-4"
            style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
          >
            {loading ? 'Génération...' : 'Générer pré-remplissage URSSAF'}
          </button>

          {prefillText && (
            <div className="mt-4">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                >
                  Copier
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}
                >
                  Télécharger en TXT
                </button>
              </div>
              <pre
                className="p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap overflow-auto"
                style={{ backgroundColor: '#23272f', border: '1px solid #2d3441', maxHeight: '300px' }}
              >
                {prefillText}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

