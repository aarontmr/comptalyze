'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import MobileShell from '@/components/ui/MobileShell';
import Card from '@/components/ui/Card';
import DesktopCard from '@/app/components/Card';
import Skeleton from '@/components/ui/Skeleton';
import SectionTitle from '@/components/ui/SectionTitle';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import { DollarSign, TrendingUp, PieChart, ArrowRight, Sparkles, Calculator, FileText, BarChart3, Shield } from 'lucide-react';
import Link from 'next/link';
import PremiumAdvice from '@/app/components/PremiumAdvice';
import { motion } from 'framer-motion';
import UpgradeTeaser from '@/app/components/UpgradeTeaser';
import TrialBanner from '@/app/components/TrialBanner';

interface CARecord {
  amount_eur: number;
  computed_net_eur: number;
  computed_contrib_eur: number;
  year: number;
  month: number;
  activity_type: string;
}

interface Invoice {
  total_eur: number;
}

export default function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCA: 0,
    totalNet: 0,
    totalContrib: 0,
    recordCount: 0,
    invoiceCount: 0,
    totalInvoices: 0,
    currentMonthCA: 0,
    lastMonthCA: 0,
  });
  const [recentRecords, setRecentRecords] = useState<CARecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        setUser(session.user);
        const subscription = getUserSubscription(session.user);

        // Charger les enregistrements CA
        const { data: caRecords } = await supabase
          .from('ca_records')
          .select('amount_eur, computed_net_eur, computed_contrib_eur, year, month, activity_type')
          .eq('user_id', session.user.id)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .order('created_at', { ascending: false });

        if (caRecords) {
          const totalCA = caRecords.reduce((sum, r) => sum + Number(r.amount_eur), 0);
          const totalNet = caRecords.reduce((sum, r) => sum + Number(r.computed_net_eur || 0), 0);
          const totalContrib = caRecords.reduce((sum, r) => sum + Number(r.computed_contrib_eur || 0), 0);

          // Calculer CA du mois actuel et du mois précédent
          const now = new Date();
          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();
          const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
          const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

          const currentMonthCA = caRecords
            .filter(r => r.year === currentYear && r.month === currentMonth)
            .reduce((sum, r) => sum + Number(r.amount_eur), 0);

          const lastMonthCA = caRecords
            .filter(r => r.year === lastMonthYear && r.month === lastMonth)
            .reduce((sum, r) => sum + Number(r.amount_eur), 0);

          setRecentRecords(caRecords.slice(0, 3) as CARecord[]);
          setStats((prev) => ({
            ...prev,
            totalCA,
            totalNet,
            totalContrib,
            recordCount: caRecords.length,
            currentMonthCA,
            lastMonthCA,
          }));
        }

        // Charger les factures si Pro/Premium
        if (subscription.isPro || subscription.isPremium) {
          const { data: invoices } = await supabase
            .from('invoices')
            .select('total_eur')
            .eq('user_id', session.user.id);

          if (invoices) {
            const totalInvoices = invoices.reduce((sum, inv) => sum + Number(inv.total_eur), 0);
            setStats((prev) => ({
              ...prev,
              invoiceCount: invoices.length,
              totalInvoices,
            }));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const subscription = getUserSubscription(user);

  const formatEuro = (value: number) => {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculer le taux de croissance du CA
  const calculateGrowthRate = () => {
    if (stats.lastMonthCA === 0) {
      if (stats.currentMonthCA > 0) return { value: Infinity, formatted: 'Nouveau' };
      return { value: 0, formatted: '0%' };
    }
    const growthRate = ((stats.currentMonthCA - stats.lastMonthCA) / stats.lastMonthCA) * 100;
    return {
      value: growthRate,
      formatted: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`
    };
  };

  const growthRate = calculateGrowthRate();

  const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getMonthName = (month: number) => MONTHS[month - 1] || '';

  // Desktop version (hidden on mobile) - uses existing Card from app/components
  const DesktopView = () => (
    <div>
      <Breadcrumbs items={[{ label: 'Aperçu' }]} />
      <h1 className="text-3xl font-semibold text-white mb-8" data-tutorial="overview">Aperçu</h1>

      {/* Trial Banner */}
      {subscription.isTrial && subscription.trialEndsAt && (
        <TrialBanner 
          trialEndsAt={subscription.trialEndsAt}
          plan={subscription.isPremium ? 'premium' : 'pro'}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-tutorial="stats-cards">
        {/* Chiffre d'affaires total */}
        <DesktopCard>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
              <DollarSign className="w-6 h-6" style={{ color: '#00D084' }} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">CA Total</h3>
          <p className="text-2xl font-semibold text-white">
            {formatEuro(stats.totalCA)} €
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.recordCount} enregistrement{stats.recordCount !== 1 ? 's' : ''}
          </p>
        </DesktopCard>

        {/* Revenu net */}
        <DesktopCard>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#2E6CF6' }} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Revenu Net</h3>
          <p className="text-2xl font-semibold text-white">
            {formatEuro(stats.totalNet)} €
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Après cotisations
          </p>
        </DesktopCard>

        {/* Cotisations totales */}
        <DesktopCard>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <PieChart className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Cotisations</h3>
          <p className="text-2xl font-semibold text-white">
            {formatEuro(stats.totalContrib)} €
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Total URSSAF
          </p>
        </DesktopCard>

        {/* Taux de croissance du CA */}
        {stats.lastMonthCA > 0 && (
          <DesktopCard>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: growthRate.value >= 0 ? '#10b981' : '#ef4444' }} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Croissance CA</h3>
            <p className="text-2xl font-semibold text-white" style={{ color: growthRate.value >= 0 ? '#10b981' : '#ef4444' }}>
              {growthRate.formatted}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              vs mois précédent
            </p>
          </DesktopCard>
        )}

        {/* Factures (si Pro/Premium) */}
        {(subscription.isPro || subscription.isPremium) && (
          <DesktopCard>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                <FileText className="w-6 h-6" style={{ color: '#2E6CF6' }} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Factures</h3>
            <p className="text-2xl font-semibold text-white">
              {formatEuro(stats.totalInvoices)} €
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.invoiceCount} facture{stats.invoiceCount !== 1 ? 's' : ''}
            </p>
          </DesktopCard>
        )}
      </div>

      {/* Upgrade Teaser */}
      <UpgradeTeaser currentPlan={subscription.plan} />

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/simulateur" data-tutorial="calculator">
          <DesktopCard className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
                <Calculator className="w-6 h-6" style={{ color: '#00D084' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Calcul URSSAF</h3>
                <p className="text-sm text-gray-400">
                  Simuler vos cotisations
                </p>
              </div>
            </div>
          </DesktopCard>
        </Link>

        {(subscription.isPro || subscription.isPremium) && (
          <Link href="/dashboard/factures" data-tutorial="invoices">
            <DesktopCard className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                  <FileText className="w-6 h-6" style={{ color: '#2E6CF6' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Factures</h3>
                  <p className="text-sm text-gray-400">
                    Gérer vos factures
                  </p>
                </div>
              </div>
            </DesktopCard>
          </Link>
        )}

        {subscription.isPremium && (
          <Link href="/dashboard/statistiques" data-tutorial="statistics">
            <DesktopCard className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
                  <BarChart3 className="w-6 h-6" style={{ color: '#00D084' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Statistiques</h3>
                  <p className="text-sm text-gray-400">
                    Visualiser vos données
                  </p>
                </div>
              </div>
            </DesktopCard>
          </Link>
        )}
      </div>

      {/* Trust badge URSSAF */}
      <div className="mt-8 pt-6 border-t" style={{ borderColor: '#1f232b' }}>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Shield className="w-4 h-4" style={{ color: '#00D084' }} />
          <span>Basé sur les données officielles de l'URSSAF</span>
        </div>
      </div>
    </div>
  );

  // Mobile version
  const MobileView = () => (
    <MobileShell title="Aperçu">
      <div className="space-y-6 pt-4">
        {/* Trial Banner */}
        {subscription.isTrial && subscription.trialEndsAt && (
          <TrialBanner 
            trialEndsAt={subscription.trialEndsAt}
            plan={subscription.isPremium ? 'premium' : 'pro'}
          />
        )}
        
        {/* Stats Cards */}
        <div className="space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
                      <DollarSign className="w-5 h-5" style={{ color: '#00D084' }} />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">CA du mois</h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatEuro(stats.currentMonthCA)} €
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                      <PieChart className="w-5 h-5" style={{ color: '#ef4444' }} />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Cotisations estimées</h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatEuro(stats.totalContrib)} €
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
                      <TrendingUp className="w-5 h-5" style={{ color: '#2E6CF6' }} />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Revenu net</h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatEuro(stats.totalNet)} €
                  </p>
                </Card>
              </motion.div>

              {/* Taux de croissance du CA */}
              {stats.lastMonthCA > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Croissance CA</h3>
                        <p className="text-xl font-semibold" style={{ color: growthRate.value >= 0 ? '#10b981' : '#ef4444' }}>
                          {growthRate.formatted}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          vs mois précédent
                        </p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <TrendingUp className="w-5 h-5" style={{ color: growthRate.value >= 0 ? '#10b981' : '#ef4444' }} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Upgrade Teaser */}
        <UpgradeTeaser currentPlan={subscription.plan} />

        {/* Derniers enregistrements */}
        <SectionTitle title="Derniers enregistrements" />
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map((record, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * idx }}
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {getMonthName(record.month)} {record.year}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{record.activity_type}</p>
                      <p className="text-lg font-semibold text-white mt-2">
                        {formatEuro(Number(record.amount_eur))} €
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            <Link href="/dashboard/simulateur">
              <Card className="flex items-center justify-between min-h-[44px]">
                <span className="text-sm font-medium text-gray-300">Voir l'historique</span>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Card>
            </Link>
          </div>
        ) : (
          <Card>
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">Aucun enregistrement pour le moment</p>
              <Link
                href="/dashboard/simulateur"
                className="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)' }}
              >
                Créer un calcul
              </Link>
            </div>
          </Card>
        )}

        {/* Conseil IA (Premium) */}
        {subscription.isPremium && user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#00D084' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-2">Conseil IA</h3>
                  <PremiumAdvice userId={user.id} />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Trust badge URSSAF */}
        <div className="pt-6 border-t" style={{ borderColor: '#1f232b' }}>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" style={{ color: '#00D084' }} />
            <span>Basé sur les données officielles de l'URSSAF</span>
          </div>
        </div>
      </div>
    </MobileShell>
  );

  if (loading) {
    return (
      <div>
        <div className="hidden lg:block">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-400">Chargement...</div>
          </div>
        </div>
        <div className="lg:hidden">
          <MobileShell title="Aperçu">
            <div className="space-y-3 pt-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </MobileShell>
        </div>
      </div>
    );
  }

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
