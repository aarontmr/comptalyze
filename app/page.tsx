'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';

interface HistoryEntry {
  id?: string;
  month: string;
  activity: string;
  ca: number;
  charges: number;
  net: number;
}

interface ActivityRate {
  label: string;
  rate: number;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    is_pro?: boolean;
  };
}

const ACTIVITY_TYPES: Record<string, ActivityRate> = {
  vente: { label: 'Vente de marchandises', rate: 12.3 },
  services: { label: 'Prestation de services', rate: 21.2 },
  liberal: { label: 'Activité libérale', rate: 21.1 },
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [ca, setCa] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [showAnnual, setShowAnnual] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [simulationCount, setSimulationCount] = useState(0);
  const router = useRouter();

  // Check auth and load data
  useEffect(() => {
    checkUser();
    supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (error || !currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);
      setIsPro(currentUser.user_metadata?.is_pro === true);
      await loadHistory(currentUser.id);
      await loadSimulationCount(currentUser.id);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('Could not find the table') || 
            error.message?.includes('relation "public.history" does not exist') ||
            error.code === '42P01') {
          console.warn('Table history n\'existe pas encore. Exécutez supabase_setup.sql dans Supabase.');
          return;
        }
        throw error;
      }
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadSimulationCount = async (userId: string) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { count, error } = await supabase
        .from('history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;
      setSimulationCount(count || 0);
    } catch (error) {
      console.error('Error loading simulation count:', error);
    }
  };

  // Calculate contributions and net income
  const calculateResults = () => {
    const caValue = parseFloat(ca);
    if (!caValue || !activity || caValue <= 0) {
      return null;
    }

    const rate = ACTIVITY_TYPES[activity]?.rate || 0;
    const charges = caValue * (rate / 100);
    const net = caValue - charges;

    return { charges, net, rate };
  };

  // Save to history
  const saveToHistory = async () => {
    if (!user) return;

    const results = calculateResults();
    if (!results) return;

    // Check limit for free users
    if (!isPro && simulationCount >= 3) {
      alert('Vous avez atteint la limite de 3 simulations mensuelles. Passez à Pro pour des simulations illimitées !');
      router.push('/pricing');
      return;
    }

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const now = new Date();
    const monthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    try {
      const { data, error } = await supabase
        .from('history')
        .insert({
          user_id: user.id,
          month: monthLabel,
          activity: ACTIVITY_TYPES[activity].label,
          ca: parseFloat(ca),
          charges: results.charges,
          net: results.net,
        })
        .select()
        .single();

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('Could not find the table') || 
            error.message?.includes('relation "public.history" does not exist') ||
            error.code === '42P01') {
          alert(
            '⚠️ La table "history" n\'existe pas dans Supabase.\n\n' +
            '📝 Solution :\n' +
            '1. Allez sur supabase.com\n' +
            '2. Ouvrez SQL Editor\n' +
            '3. Copiez le contenu de supabase_setup.sql\n' +
            '4. Exécutez le script\n\n' +
            'Consultez CREATE_TABLE.md pour plus de détails.'
          );
          return;
        }
        throw error;
      }

      setHistory([data, ...history]);
      setSimulationCount(simulationCount + 1);
      
      // Clear form
      setCa('');
      setActivity('');
      setShowAnnual(false);
    } catch (error: any) {
      console.error('Error saving history:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  };

  // Clear history
  const clearHistory = async () => {
    if (!user) return;
    
    if (!confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory([]);
      setSimulationCount(0);
    } catch (error: any) {
      console.error('Error clearing history:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const results = calculateResults();
  const currentActivity = activity ? ACTIVITY_TYPES[activity] : null;

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0f1117' }}
      >
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4 transition-opacity duration-700 ease-in-out"
      style={{ 
        backgroundColor: '#0f1117',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        opacity: isLoaded ? 1 : 0
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Top-centered Logo */}
        <div className="w-full flex justify-center mb-8">
          <Image
            src={logo}
            alt="Comptalyze"
            priority
            width={600}
            height={200}
            className="h-[100px] w-auto sm:h-[110px] md:h-[120px]"
          />
        </div>
        {/* Header with User Info */}
        <header className="mb-8 flex justify-between items-center animate-fade-in">
          <div>
            <p className="text-sm text-gray-400">
              Bienvenue, {user?.email || 'Utilisateur'}
              {!isPro && (
                <span className="ml-2 px-2 py-1 rounded text-xs" style={{ backgroundColor: '#23272f' }}>
                  Plan Gratuit
                </span>
              )}
              {isPro && (
                <span className="ml-2 px-2 py-1 rounded text-xs text-green-400" style={{ backgroundColor: '#1a2e1a' }}>
                  Pro
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            {!isPro && (
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                Passer à Pro
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 text-sm"
              style={{
                backgroundColor: '#23272f',
                border: '1px solid #2d3441'
              }}
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* Limit warning for free users */}
        {!isPro && (
          <div 
            className="mb-6 p-4 rounded-lg"
            style={{ backgroundColor: '#2d241b', border: '1px solid #f97316' }}
          >
            <p className="text-sm text-orange-400">
              {simulationCount >= 3 ? (
                <>Vous avez atteint votre limite mensuelle (3/3). <Link href="/pricing" className="underline">Passez à Pro</Link> pour des simulations illimitées !</>
              ) : (
                <>Simulations restantes ce mois : {3 - simulationCount}/3</>
              )}
            </p>
          </div>
        )}

        {/* Main Card */}
        <div 
          className="rounded-xl shadow-2xl p-6 mb-6 transition-opacity duration-700 ease-in-out"
          style={{ 
            backgroundColor: '#1a1d24',
            opacity: isLoaded ? 1 : 0,
            animationDelay: '100ms'
          }}
        >
          {/* Input Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="ca" className="block text-sm font-medium text-gray-300 mb-2">
                Chiffre d&apos;affaires (CA)
              </label>
              <input
                id="ca"
                type="number"
                value={ca}
                onChange={(e) => setCa(e.target.value)}
                placeholder="Entrez votre chiffre d'affaires (en €)"
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: '#23272f',
                  border: '1px solid #2d3441'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2d3441';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-300 mb-2">
                Type d&apos;activité
              </label>
              <select
                id="activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: '#23272f',
                  border: '1px solid #2d3441'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2d3441';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" style={{ backgroundColor: '#23272f' }}>Sélectionnez votre activité</option>
                {Object.entries(ACTIVITY_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key} style={{ backgroundColor: '#23272f' }}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="showAnnual"
                type="checkbox"
                checked={showAnnual}
                onChange={(e) => setShowAnnual(e.target.checked)}
                className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                style={{ 
                  accentColor: '#3b82f6'
                }}
              />
              <label htmlFor="showAnnual" className="ml-2 text-sm text-gray-300 cursor-pointer">
                Afficher projection annuelle
              </label>
            </div>

            <button
              onClick={saveToHistory}
              disabled={!results || (!isPro && simulationCount >= 3)}
              className="w-full px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: results && (isPro || simulationCount < 3)
                  ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                  : '#374151',
                boxShadow: results && (isPro || simulationCount < 3)
                  ? '0 4px 15px rgba(59, 130, 246, 0.3)'
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (results && (isPro || simulationCount < 3)) {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (results && (isPro || simulationCount < 3)) {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              Enregistrer ce calcul
            </button>
          </div>

          {/* Results Section */}
          <div className="border-t pt-6" style={{ borderColor: '#2d3441' }}>
            {results ? (
              <div className="space-y-3">
                <div className="text-lg font-medium" style={{ color: '#10b981' }}>
                  Cotisations URSSAF : {results.charges.toFixed(2)} €
                </div>
                <div className="text-lg font-medium" style={{ color: '#10b981' }}>
                  Revenu net : {results.net.toFixed(2)} €
                </div>
                {showAnnual && (
                  <div className="text-lg font-medium mt-4 pt-4 border-t" style={{ color: '#60a5fa', borderColor: '#2d3441' }}>
                    Projection annuelle : {(results.net * 12).toFixed(2)} € nets / {(results.charges * 12).toFixed(2)} € de cotisations
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 italic">
                Veuillez entrer un chiffre d&apos;affaires et choisir votre activité.
              </div>
            )}
          </div>

          {/* Explanatory Text */}
          {currentActivity && results && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: '#2d3441' }}>
              <p className="text-sm text-gray-400 italic">
                Pour une activité de {currentActivity.label.toLowerCase()}, le taux de cotisation est de {currentActivity.rate} %.{' '}
                Cela signifie que sur un chiffre d&apos;affaires de {parseFloat(ca).toFixed(2)} €, vous paierez {results.charges.toFixed(2)} € de cotisations et conserverez {results.net.toFixed(2)} € nets.
              </p>
            </div>
          )}
        </div>

        {/* History Section */}
        <div 
          className="rounded-xl shadow-2xl p-6 transition-opacity duration-700 ease-in-out"
          style={{ 
            backgroundColor: '#1a1d24',
            opacity: isLoaded ? 1 : 0,
            animationDelay: '200ms'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Historique</h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                }}
              >
                Effacer l&apos;historique
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-gray-400 italic">Aucun historique enregistré pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: '#23272f' }}>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300" style={{ borderBottom: '2px solid #2d3441' }}>
                      Mois
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300" style={{ borderBottom: '2px solid #2d3441' }}>
                      Activité
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300" style={{ borderBottom: '2px solid #2d3441' }}>
                      Chiffre d&apos;affaires
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300" style={{ borderBottom: '2px solid #2d3441' }}>
                      Cotisations
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300" style={{ borderBottom: '2px solid #2d3441' }}>
                      Revenu net
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr
                      key={entry.id || index}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#1a1d24' : '#23272f',
                        borderBottom: '1px solid #2d3441'
                      }}
                      className="hover:bg-opacity-80 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {entry.month}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {entry.activity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {entry.ca.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {entry.charges.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#10b981' }}>
                        {entry.net.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}
