'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import Card from '@/app/components/Card';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import OnboardingTutorial from '@/app/components/OnboardingTutorial';
import Link from 'next/link';
import { Calculator, FileText, BarChart3, TrendingUp, DollarSign, PieChart } from 'lucide-react';

interface CARecord {
  amount_eur: number;
  computed_net_eur: number;
  computed_contrib_eur: number;
}

interface Invoice {
  total_eur: number;
}

export default function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [stats, setStats] = useState({
    totalCA: 0,
    totalNet: 0,
    totalContrib: 0,
    recordCount: 0,
    invoiceCount: 0,
    totalInvoices: 0,
  });

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
          .select('amount_eur, computed_net_eur, computed_contrib_eur')
          .eq('user_id', session.user.id);

        if (caRecords) {
          const totalCA = caRecords.reduce((sum, r) => sum + Number(r.amount_eur), 0);
          const totalNet = caRecords.reduce((sum, r) => sum + Number(r.computed_net_eur || 0), 0);
          const totalContrib = caRecords.reduce((sum, r) => sum + Number(r.computed_contrib_eur || 0), 0);

          setStats((prev) => ({
            ...prev,
            totalCA,
            totalNet,
            totalContrib,
            recordCount: caRecords.length,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <OnboardingTutorial user={user} onComplete={() => setTutorialCompleted(true)} />
      <Breadcrumbs items={[{ label: 'Aperçu' }]} />
      <h1 className="text-3xl font-semibold text-white mb-8" data-tutorial="overview">Aperçu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-tutorial="stats-cards">
        {/* Chiffre d'affaires total */}
        <Card>
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
        </Card>

        {/* Revenu net */}
        <Card>
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
        </Card>

        {/* Cotisations totales */}
        <Card>
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
        </Card>

        {/* Factures (si Pro/Premium) */}
        {(subscription.isPro || subscription.isPremium) && (
          <Card>
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
          </Card>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/simulateur" data-tutorial="calculator">
          <Card className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
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
          </Card>
        </Link>

        {(subscription.isPro || subscription.isPremium) && (
          <Link href="/dashboard/factures" data-tutorial="invoices">
            <Card className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
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
            </Card>
          </Link>
        )}

        {subscription.isPremium && (
          <Link href="/dashboard/statistiques" data-tutorial="statistics">
            <Card className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
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
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
