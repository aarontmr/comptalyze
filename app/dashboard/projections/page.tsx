"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { TrendingUp, Calendar, AlertTriangle, Target } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Projection {
  month: string;
  projectedCA: number;
  projectedContrib: number;
  projectedNet: number;
}

export default function ProjectionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthsAhead, setMonthsAhead] = useState(6);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await calculateProjections(session.user.id);
      }
    };
    fetchUser();
  }, [monthsAhead]);

  const calculateProjections = async (userId: string) => {
    setLoading(true);
    try {
      // Récupérer les données des 12 derniers mois
      const { data: records } = await supabase
        .from("ca_records")
        .select("year, month, amount_eur, computed_contrib_eur, computed_net_eur, activity_type")
        .eq("user_id", userId)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(12);

      if (!records || records.length === 0) {
        setProjections([]);
        setLoading(false);
        return;
      }

      // Calculer la moyenne mensuelle
      const totalCA = records.reduce((sum, r) => sum + Number(r.amount_eur), 0);
      const totalContrib = records.reduce((sum, r) => sum + Number(r.computed_contrib_eur || 0), 0);
      const totalNet = records.reduce((sum, r) => sum + Number(r.computed_net_eur || 0), 0);

      const avgMonthlyCA = totalCA / records.length;
      const avgMonthlyContrib = totalContrib / records.length;
      const avgMonthlyNet = totalNet / records.length;

      // Calculer la tendance (croissance moyenne)
      const sortedRecords = [...records].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      let growthRate = 0;
      if (sortedRecords.length >= 2) {
        const firstCA = Number(sortedRecords[0].amount_eur);
        const lastCA = Number(sortedRecords[sortedRecords.length - 1].amount_eur);
        growthRate = ((lastCA - firstCA) / firstCA) * 100 / sortedRecords.length;
      }

      // Générer les projections
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
      const now = new Date();
      const projectionsData: Projection[] = [];

      for (let i = 1; i <= monthsAhead; i++) {
        const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthName = months[futureDate.getMonth()];
        
        // Appliquer la croissance
        const projectedCA = avgMonthlyCA * (1 + (growthRate / 100) * i);
        const projectedContrib = projectedCA * (totalContrib / totalCA);
        const projectedNet = projectedCA - projectedContrib;

        projectionsData.push({
          month: `${monthName} ${futureDate.getFullYear()}`,
          projectedCA: Math.max(0, projectedCA),
          projectedContrib: Math.max(0, projectedContrib),
          projectedNet: Math.max(0, projectedNet),
        });
      }

      setProjections(projectionsData);
    } catch (error) {
      console.error("Error calculating projections:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProjectedCA = projections.reduce((sum, p) => sum + p.projectedCA, 0);
  const totalProjectedNet = projections.reduce((sum, p) => sum + p.projectedNet, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Calcul des projections...</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Projections" }]} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projections financières</h1>
          <p className="text-gray-400">Prévisions de revenus et cotisations basées sur vos données</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Période :</label>
          <select
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(Number(e.target.value))}
            className="px-3 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
          >
            <option value={3}>3 mois</option>
            <option value={6}>6 mois</option>
            <option value={12}>12 mois</option>
          </select>
        </div>
      </div>

      {/* Résumé */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" style={{ color: "#00D084" }} />
            <h3 className="text-lg font-semibold text-white">CA projeté</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalProjectedCA.toFixed(2)} €</p>
          <p className="text-sm text-gray-400 mt-1">Sur {monthsAhead} mois</p>
        </div>

        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6" style={{ color: "#2E6CF6" }} />
            <h3 className="text-lg font-semibold text-white">Revenu net projeté</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalProjectedNet.toFixed(2)} €</p>
          <p className="text-sm text-gray-400 mt-1">Après cotisations</p>
        </div>

        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6" style={{ color: "#f59e0b" }} />
            <h3 className="text-lg font-semibold text-white">Moyenne mensuelle</h3>
          </div>
          <p className="text-3xl font-bold text-white">{(totalProjectedCA / monthsAhead).toFixed(2)} €</p>
          <p className="text-sm text-gray-400 mt-1">CA mensuel moyen</p>
        </div>
      </div>

      {/* Graphique */}
      {projections.length > 0 && (
        <div
          className="rounded-xl p-6 border mb-8"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Évolution projetée</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3441" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e0f12",
                  border: "1px solid #2d3441",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="projectedCA"
                name="CA projeté"
                stroke="#00D084"
                strokeWidth={2}
                dot={{ fill: "#00D084" }}
              />
              <Line
                type="monotone"
                dataKey="projectedNet"
                name="Revenu net"
                stroke="#2E6CF6"
                strokeWidth={2}
                dot={{ fill: "#2E6CF6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tableau détaillé */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: "#14161b",
          borderColor: "#1f232b",
        }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Détail mensuel</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "#1f232b" }}>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Mois</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">CA projeté</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Cotisations</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Revenu net</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((projection, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-800/30 transition-colors"
                  style={{ borderColor: "#1f232b" }}
                >
                  <td className="py-3 px-4 text-white">{projection.month}</td>
                  <td className="py-3 px-4 text-right text-white font-medium">
                    {projection.projectedCA.toFixed(2)} €
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {(projection.projectedCA - projection.projectedNet).toFixed(2)} €
                  </td>
                  <td className="py-3 px-4 text-right" style={{ color: "#00D084" }}>
                    {projection.projectedNet.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note importante */}
      <div
        className="mt-6 rounded-xl p-4 border"
        style={{
          backgroundColor: "#f59e0b20",
          borderColor: "#f59e0b",
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#f59e0b" }} />
          <div>
            <p className="text-sm text-white font-medium mb-1">Note importante</p>
            <p className="text-xs text-gray-300">
              Ces projections sont basées sur vos données historiques et des calculs statistiques.
              Elles ne constituent pas une garantie et peuvent varier selon l'évolution réelle de votre activité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}







