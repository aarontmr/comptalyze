'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserPlan } from '@/lib/plan';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import MobileShell from '@/components/ui/MobileShell';
import SectionTitle from '@/components/ui/SectionTitle';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import ResponsiveChart from '@/components/charts/ResponsiveChart';
import StatsChart from '@/app/components/StatsChart';
import StatsCard from '@/app/components/StatsCard';
import DualLineChart from '@/app/components/DualLineChart';
import ProgressBar from '@/app/components/ProgressBar';
import PremiumOverlay from '@/app/components/PremiumOverlay';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import { AdvancedKPICard } from './AdvancedKPICard';
import { StatistiquesClient } from './StatistiquesClient';
import { DollarSign, TrendingUp, PieChart, Calculator } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface CARecord {
  year: number;
  month: number;
  amount_eur: number;
  computed_contrib_eur: number;
  computed_net_eur: number;
  activity_type: string;
}

interface MonthlyData {
  month: string;
  ca: number;
  net: number;
}

export default function StatistiquesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [records, setRecords] = useState<CARecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        setUser(session.user);
        
        // Récupérer le plan
        const userPlan = await getUserPlan(supabase, session.user.id);
        setPlan(userPlan);

        // Si free, rediriger
        if (userPlan === 'free') {
          router.push('/pricing?upgrade=pro');
          return;
        }

        // Récupérer les enregistrements CA
        const { data: allRecords, error } = await supabase
          .from('ca_records')
          .select('year, month, amount_eur, computed_contrib_eur, computed_net_eur, activity_type')
          .eq('user_id', session.user.id)
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        if (error) {
          console.error('Erreur lors de la récupération des données:', error);
        } else {
          setRecords((allRecords || []) as CARecord[]);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Écouter l'événement personnalisé pour mettre à jour les statistiques
    const handleRecordsUpdate = () => {
      fetchData();
    };

    window.addEventListener('ca_records_updated', handleRecordsUpdate);

    return () => {
      window.removeEventListener('ca_records_updated', handleRecordsUpdate);
    };
  }, [router]);

  // Calculer les statistiques de base
  const currentYear = new Date().getFullYear();
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);

  const recordsCurrentYear = records.filter(r => r.year === currentYear);
  const totalCA = recordsCurrentYear.reduce((sum, r) => sum + Number(r.amount_eur), 0);
  const totalNet = recordsCurrentYear.reduce((sum, r) => sum + Number(r.computed_net_eur || 0), 0);
  const totalContrib = recordsCurrentYear.reduce((sum, r) => sum + Number(r.computed_contrib_eur || 0), 0);
  
  // CA moyen mensuel (année en cours)
  const uniqueMonths = new Set(recordsCurrentYear.map(r => `${r.year}-${r.month}`));
  const avgMonthlyCA = uniqueMonths.size > 0 ? totalCA / uniqueMonths.size : 0;

  // Préparer les données pour les graphiques (12 derniers mois)
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  const monthlyData: MonthlyData[] = [];
  const monthlyTotals: Record<string, { ca: number; net: number }> = {};

  // Grouper par mois pour les 12 derniers mois
  records
    .filter(r => {
      const recordDate = new Date(r.year, r.month - 1, 1);
      return recordDate >= startDate;
    })
    .forEach((record: CARecord) => {
      const key = `${record.year}-${record.month.toString().padStart(2, '0')}`;
      if (!monthlyTotals[key]) {
        monthlyTotals[key] = { ca: 0, net: 0 };
      }
      monthlyTotals[key].ca += Number(record.amount_eur);
      monthlyTotals[key].net += Number(record.computed_net_eur || 0);
    });

  // Créer les données pour les 12 derniers mois
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthName = months[date.getMonth()];
    const totals = monthlyTotals[key] || { ca: 0, net: 0 };
    
    monthlyData.push({
      month: monthName,
      ca: totals.ca,
      net: totals.net,
    });
  }

  // Calculer les indicateurs avancés (Premium uniquement)
  const tauxChargesMoyen = totalCA > 0 ? (totalContrib / totalCA) * 100 : 0;
  
  // Taux de croissance (mois précédent)
  let tauxCroissance = 0;
  if (monthlyData.length >= 2) {
    const dernierMois = monthlyData[monthlyData.length - 1].ca;
    const moisPrecedent = monthlyData[monthlyData.length - 2].ca;
    if (moisPrecedent > 0) {
      tauxCroissance = ((dernierMois - moisPrecedent) / moisPrecedent) * 100;
    }
  }

  // Progression vers le plafond micro-entreprise
  const plafondMicro = 77700;
  const progressionPlafond = (totalCA / plafondMicro) * 100;

  // Formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Desktop version
  const DesktopView = () => {
    if (loading) {
      return (
        <div style={{ backgroundColor: '#0e0f12', minHeight: '100vh', padding: '2rem' }}>
          <h1 className="text-3xl font-semibold text-white mb-8">Statistiques</h1>
          <div className="text-gray-400">Chargement...</div>
        </div>
      );
    }

    if (!user || plan === 'free') {
      return null;
    }

    return (
      <div style={{ backgroundColor: '#0e0f12', minHeight: '100vh', padding: '2rem' }}>
        <Breadcrumbs items={[
          { label: 'Aperçu', href: '/dashboard' },
          { label: 'Statistiques' },
        ]} />
        <h1 className="text-3xl font-semibold text-white mb-8">Statistiques</h1>

        {/* SECTION 1 — Indicateurs de base (Pro et Premium) */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Indicateurs de base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard
              title="CA total annuel"
              value={formatCurrency(totalCA)}
              icon={DollarSign}
              delay={0}
            />
            <StatsCard
              title="Revenu net annuel"
              value={formatCurrency(totalNet)}
              icon={TrendingUp}
              delay={0.1}
            />
            <StatsCard
              title="Cotisations totales"
              value={formatCurrency(totalContrib)}
              icon={PieChart}
              delay={0.2}
            />
            <StatsCard
              title="CA moyen mensuel"
              value={formatCurrency(avgMonthlyCA)}
              icon={Calculator}
              delay={0.3}
            />
          </div>
        </section>

        {/* SECTION 2 — Évolution mensuelle (Pro et Premium) */}
        <section className="mb-8">
          <StatsChart
            data={monthlyData.map(d => ({ month: d.month, ca: d.ca }))}
            title="Évolution de votre chiffre d'affaires"
            delay={0.4}
          />
        </section>

        {/* SECTION 3 — Comparaison CA vs Net (Premium uniquement) */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Comparaison CA vs Net</h2>
          {plan !== 'premium' ? (
            <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#16181d', border: '1px solid rgba(45, 52, 65, 0.5)' }}>
              <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}>
                <p className="text-gray-300 mb-4">
                  Analyse avancée disponible avec le plan{' '}
                  <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
                    Premium
                  </span>
                </p>
                <a
                  href="/pricing?upgrade=premium"
                  className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
                >
                  Passer à Premium
                </a>
              </div>
            </div>
          ) : (
            <DualLineChart
              data={monthlyData}
              title="Évolution CA vs Revenu net"
              delay={0.5}
            />
          )}
        </section>

        {/* SECTION 4 — Taux et indicateurs avancés (Premium uniquement) */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Taux et indicateurs avancés</h2>
          {plan !== 'premium' ? (
            <div className="relative rounded-2xl p-6" style={{ backgroundColor: '#16181d', border: '1px solid rgba(45, 52, 65, 0.5)' }}>
              <PremiumOverlay 
                message="Passez au plan Premium pour débloquer les analyses avancées"
                ctaText="Passer à Premium"
                ctaHref="/pricing?upgrade=premium"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
                    <p className="text-gray-400 text-sm mb-2">Taux de charges moyen</p>
                    <p className="text-white text-2xl font-semibold">--</p>
                  </div>
                  <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
                    <p className="text-gray-400 text-sm mb-2">Taux de croissance</p>
                    <p className="text-white text-2xl font-semibold">--</p>
                  </div>
                  <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
                    <p className="text-gray-400 text-sm mb-2">Progression plafond</p>
                    <p className="text-white text-2xl font-semibold">--</p>
                  </div>
                </div>
              </PremiumOverlay>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AdvancedKPICard
                title="Taux de charges moyen"
                value={`${tauxChargesMoyen.toFixed(1)}%`}
                subtitle="Cotisations / CA"
                delay={0.6}
              />
              <AdvancedKPICard
                title="Taux de croissance"
                value={`${tauxCroissance >= 0 ? '+' : ''}${tauxCroissance.toFixed(1)}%`}
                subtitle="vs mois précédent"
                delay={0.7}
                valueColor={tauxCroissance >= 0 ? '#10b981' : '#ef4444'}
              />
              <div className="rounded-2xl p-6" style={{
                backgroundColor: '#16181d',
                border: '1px solid rgba(45, 52, 65, 0.5)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              }}>
                <p className="text-gray-400 text-sm font-medium mb-4">Progression vers le plafond</p>
                <ProgressBar
                  value={totalCA}
                  max={plafondMicro}
                  label="Plafond micro-entreprise"
                  delay={0.8}
                />
              </div>
            </div>
          )}
        </section>

        {/* SECTION 5 — Analyse IA (Premium uniquement) */}
        {plan === 'premium' && (
          <section className="mb-8">
            <StatistiquesClient userId={user.id} />
          </section>
        )}
      </div>
    );
  };

  // Mobile version
  const MobileView = () => {
    if (loading) {
      return (
        <MobileShell title="Statistiques">
          <div className="space-y-6 pt-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </MobileShell>
      );
    }

    if (!user || plan === 'free') {
      return null;
    }

    return (
      <MobileShell title="Statistiques">
        <div className="space-y-6 pt-4">
          {/* Indicateurs de base (Pro et Premium) */}
          <SectionTitle title="Indicateurs de base" />
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-medium text-gray-400">CA total</h3>
                </div>
                <p className="text-lg font-semibold text-white">{formatCurrency(totalCA)}</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-medium text-gray-400">Net annuel</h3>
                </div>
                <p className="text-lg font-semibold text-white">{formatCurrency(totalNet)}</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-medium text-gray-400">Cotisations</h3>
                </div>
                <p className="text-lg font-semibold text-white">{formatCurrency(totalContrib)}</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-medium text-gray-400">CA moyen</h3>
                </div>
                <p className="text-lg font-semibold text-white">{formatCurrency(avgMonthlyCA)}</p>
              </Card>
            </motion.div>
          </div>

          {/* Évolution du CA (12 mois) */}
          <SectionTitle title="Évolution du CA (12 mois)" />
          <ResponsiveChart minHeight={240}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData.map(d => ({ month: d.month, ca: d.ca }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3441" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1d24',
                    border: '1px solid #2d3441',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${formatCurrency(value)}`, 'CA']}
                />
                <Line 
                  type="monotone" 
                  dataKey="ca" 
                  stroke="url(#gradient)"
                  strokeWidth={2}
                  dot={{ fill: '#00D084', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00D084" />
                    <stop offset="100%" stopColor="#2E6CF6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </ResponsiveChart>

          {/* Comparaison CA vs Net (Premium uniquement) */}
          {plan === 'premium' ? (
            <>
              <SectionTitle title="CA vs Net" />
              <ResponsiveChart minHeight={240}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3441" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9ca3af"
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      style={{ fontSize: '11px' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1d24',
                        border: '1px solid #2d3441',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'ca' ? 'CA' : 'Net'
                      ]}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                      formatter={(value) => value === 'ca' ? 'CA' : 'Net'}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ca" 
                      stroke="#2E6CF6"
                      strokeWidth={2}
                      dot={{ fill: '#2E6CF6', r: 3 }}
                      name="ca"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#00D084"
                      strokeWidth={2}
                      dot={{ fill: '#00D084', r: 3 }}
                      name="net"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ResponsiveChart>
            </>
          ) : (
            <Card>
              <div className="text-center py-6">
                <p className="text-sm text-gray-300 mb-4">
                  Analyse avancée disponible avec le plan{' '}
                  <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
                    Premium
                  </span>
                </p>
                <a
                  href="/pricing?upgrade=premium"
                  className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
                >
                  Passer à Premium
                </a>
              </div>
            </Card>
          )}

          {/* Taux et indicateurs avancés (Premium uniquement) */}
          {plan === 'premium' ? (
            <>
              <SectionTitle title="Indicateurs avancés" />
              <div className="space-y-3">
                <AdvancedKPICard
                  title="Taux de charges moyen"
                  value={`${tauxChargesMoyen.toFixed(1)}%`}
                  subtitle="Cotisations / CA"
                />
                <AdvancedKPICard
                  title="Taux de croissance"
                  value={`${tauxCroissance >= 0 ? '+' : ''}${tauxCroissance.toFixed(1)}%`}
                  subtitle="vs mois précédent"
                  valueColor={tauxCroissance >= 0 ? '#10b981' : '#ef4444'}
                />
                <Card>
                  <p className="text-gray-400 text-sm font-medium mb-4">Progression vers le plafond</p>
                  <ProgressBar
                    value={totalCA}
                    max={plafondMicro}
                    label="Plafond micro-entreprise"
                  />
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <PremiumOverlay 
                message="Passez au plan Premium pour débloquer les analyses avancées"
                ctaText="Passer à Premium"
                ctaHref="/pricing?upgrade=premium"
              >
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">Indicateurs avancés disponibles avec Premium</p>
                </div>
              </PremiumOverlay>
            </Card>
          )}

          {/* Analyse IA (Premium uniquement) */}
          {plan === 'premium' && user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle title="Analyse IA" />
              <StatistiquesClient userId={user.id} />
            </motion.div>
          )}
        </div>
      </MobileShell>
    );
  };

  return (
    <>
      <div className="hidden lg:block">
        <DesktopView />
      </div>
      <div className="lg:hidden">
        <MobileView />
      </div>
    </>
  );
}
