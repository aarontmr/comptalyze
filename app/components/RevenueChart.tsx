'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getUserPlan } from '@/lib/plan';

interface CARecord {
  month: number;
  year: number;
  amount_eur: number;
}

interface ChartData {
  month: string;
  ca: number;
}

export default function RevenueChart({ userId }: { userId: string }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<'free' | 'pro' | 'premium'>('free');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier le plan de l'utilisateur
        const userPlan = await getUserPlan(supabase, userId);
        setPlan(userPlan);

        if (userPlan !== 'premium') {
          setLoading(false);
          return;
        }

        // Calculer la date de début (12 mois en arrière)
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        
        // Récupérer les enregistrements des 12 derniers mois
        const { data: records, error } = await supabase
          .from('ca_records')
          .select('month, year, amount_eur')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        if (error) {
          console.error('Erreur lors de la récupération des données:', error);
          setLoading(false);
          return;
        }

        // Grouper par mois et sommer les montants
        const monthlyTotals: Record<string, number> = {};
        
        records?.forEach((record: CARecord) => {
          const key = `${record.year}-${record.month.toString().padStart(2, '0')}`;
          monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(record.amount_eur);
        });

        // Créer les données pour les 12 derniers mois
        const chartData: ChartData[] = [];
        const months = [
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          const monthName = months[date.getMonth()];
          
          chartData.push({
            month: monthName,
            ca: monthlyTotals[key] || 0,
          });
        }

        setData(chartData);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
        <p className="text-gray-400">Chargement des données...</p>
      </div>
    );
  }

  if (plan !== 'premium') {
    return (
      <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
        <h3 className="text-xl font-semibold text-white mb-2">Évolution de votre chiffre d'affaires</h3>
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}>
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
      </div>
    );
  }

  if (data.length === 0 || data.every(d => d.ca === 0)) {
    return (
      <div className="p-6 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
        <h3 className="text-xl font-semibold text-white mb-4">Évolution de votre chiffre d'affaires (12 derniers mois)</h3>
        <div className="mt-4 p-8 text-center rounded-lg" style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}>
          <p className="text-gray-400">Aucune donnée enregistrée pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
      <h3 className="text-xl font-semibold text-white mb-4">Évolution de votre chiffre d'affaires (12 derniers mois)</h3>
      <div className="w-full" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3441" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value.toLocaleString('fr-FR')} €`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d24',
                border: '1px solid #2d3441',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`, 'CA']}
            />
            <Legend 
              wrapperStyle={{ color: '#9ca3af', fontSize: '14px' }}
            />
            <Line 
              type="monotone" 
              dataKey="ca" 
              stroke="url(#gradient)"
              strokeWidth={2}
              dot={{ fill: '#00D084', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00D084" />
                <stop offset="100%" stopColor="#2E6CF6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




















