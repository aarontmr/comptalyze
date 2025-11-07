'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

interface SignupBySource {
  source: string;
  medium: string;
  campaign: string;
  signup_count: number;
  unique_users: number;
  signup_date: string;
}

interface ConversionFunnel {
  source: string;
  total_signups: number;
  total_upgrades: number;
  conversion_rate_percent: number;
}

interface EventSummary {
  event_name: string;
  count: number;
}

export default function MetricsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signupsBySource, setSignupsBySource] = useState<SignupBySource[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [eventSummary, setEventSummary] = useState<EventSummary[]>([]);
  const [totalSignups, setTotalSignups] = useState(0);
  const [totalUpgrades, setTotalUpgrades] = useState(0);
  const [overallConversionRate, setOverallConversionRate] = useState(0);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/login');
        return;
      }

      // Vérifier si l'utilisateur est admin
      // Si la table user_profiles n'existe pas, on considère que l'utilisateur authentifié est admin
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();

        // Si la table n'existe pas (erreur 42P01), on permet l'accès
        // Sinon, on vérifie le flag is_admin
        if (error && error.code === '42P01') {
          console.warn('Table user_profiles non trouvée. Accès admin accordé par défaut.');
          setIsAdmin(true);
        } else if (!profile?.is_admin) {
          console.error('Accès refusé : utilisateur non-admin');
          router.push('/dashboard');
          return;
        } else {
          setIsAdmin(true);
        }
      } catch (profileError) {
        console.warn('Impossible de vérifier le statut admin:', profileError);
        // En cas d'erreur, on permet l'accès pour les utilisateurs authentifiés
        setIsAdmin(true);
      }

      await loadMetrics();
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Charger les signups par source (utiliser la vue créée dans la migration)
      const { data: signupsData } = await supabase
        .from('analytics_signups_by_source')
        .select('*')
        .order('signup_date', { ascending: false })
        .limit(50);

      if (signupsData) {
        setSignupsBySource(signupsData);
      }

      // Charger le funnel de conversion (utiliser la vue créée dans la migration)
      const { data: funnelData } = await supabase
        .from('analytics_conversion_funnel')
        .select('*');

      if (funnelData) {
        setConversionFunnel(funnelData);
        
        // Calculer les totaux
        const totalSignupsCount = funnelData.reduce((sum, item) => sum + item.total_signups, 0);
        const totalUpgradesCount = funnelData.reduce((sum, item) => sum + item.total_upgrades, 0);
        
        setTotalSignups(totalSignupsCount);
        setTotalUpgrades(totalUpgradesCount);
        setOverallConversionRate(
          totalSignupsCount > 0 
            ? Math.round((totalUpgradesCount / totalSignupsCount) * 100 * 100) / 100 
            : 0
        );
      }

      // Charger le résumé des événements
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('event_name');

      if (eventsData) {
        const summary: Record<string, number> = {};
        eventsData.forEach(event => {
          summary[event.event_name] = (summary[event.event_name] || 0) + 1;
        });
        
        setEventSummary(
          Object.entries(summary).map(([event_name, count]) => ({
            event_name,
            count,
          }))
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0e0f12' }}>
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0e0f12', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/logs"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'admin</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 Métriques d'Acquisition
          </h1>
          <p className="text-gray-400">
            Analyse des sources d'acquisition et des conversions
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: '#14161b', border: '1px solid rgba(46, 108, 246, 0.1)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-gray-400 text-sm font-medium">Total Signups</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totalSignups}</p>
          </div>

          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: '#14161b', border: '1px solid rgba(46, 108, 246, 0.1)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-gray-400 text-sm font-medium">Total Upgrades</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totalUpgrades}</p>
          </div>

          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: '#14161b', border: '1px solid rgba(46, 108, 246, 0.1)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="text-gray-400 text-sm font-medium">Taux de Conversion</h3>
            </div>
            <p className="text-3xl font-bold text-white">{overallConversionRate}%</p>
          </div>
        </div>

        {/* Conversion Funnel by Source */}
        <div
          className="mb-8 p-6 rounded-xl"
          style={{ backgroundColor: '#14161b', border: '1px solid rgba(46, 108, 246, 0.1)' }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Taux de Conversion par Source (Free → Payant)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(45, 52, 65, 0.5)' }}>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Source</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Signups</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Upgrades</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Taux de Conversion</th>
                </tr>
              </thead>
              <tbody>
                {conversionFunnel.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : (
                  conversionFunnel.map((item, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: '1px solid rgba(45, 52, 65, 0.3)' }}
                      className="hover:bg-gray-900/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-white">
                        {item.source}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {item.total_signups}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {item.total_upgrades}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: item.conversion_rate_percent > 5 
                              ? 'rgba(0, 208, 132, 0.1)' 
                              : item.conversion_rate_percent > 2
                              ? 'rgba(251, 191, 36, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                            color: item.conversion_rate_percent > 5 
                              ? '#00D084' 
                              : item.conversion_rate_percent > 2
                              ? '#fbbf24'
                              : '#ef4444',
                          }}
                        >
                          {item.conversion_rate_percent}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signups by Source */}
        <div
          className="mb-8 p-6 rounded-xl"
          style={{ backgroundColor: '#14161b', border: '1px solid rgba(46, 108, 246, 0.1)' }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Signups par Source
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(45, 52, 65, 0.5)' }}>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Source</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Médium</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Campagne</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Signups</th>
                </tr>
              </thead>
              <tbody>
                {signupsBySource.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : (
                  signupsBySource.map((item, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: '1px solid rgba(45, 52, 65, 0.3)' }}
                      className="hover:bg-gray-900/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(item.signup_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-white">{item.source}</td>
                      <td className="py-3 px-4 text-gray-300">{item.medium}</td>
                      <td className="py-3 px-4 text-gray-300">{item.campaign}</td>
                      <td className="py-3 px-4 text-right text-white font-medium">
                        {item.signup_count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Summary */}
        <div
          className="p-6 rounded-xl"
          style={{ backgroundColor: '#14161b', border: '1px solid rgba(46, 108, 246, 0.1)' }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Résumé des Événements
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {eventSummary.length === 0 ? (
              <p className="col-span-full text-center py-8 text-gray-500">
                Aucun événement tracké
              </p>
            ) : (
              eventSummary.map((event, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: 'rgba(46, 108, 246, 0.05)' }}
                >
                  <p className="text-2xl font-bold text-white mb-1">{event.count}</p>
                  <p className="text-xs text-gray-400">{event.event_name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

