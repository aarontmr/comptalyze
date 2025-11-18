"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ComparisonData {
  period: string;
  ca: number;
  net: number;
  contrib: number;
  growth?: number;
}

export default function ComparaisonsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [comparisonType, setComparisonType] = useState<"monthly" | "yearly">("monthly");
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadComparisonData(session.user.id);
      }
    };
    fetchUser();
  }, [comparisonType]);

  const loadComparisonData = async (userId: string) => {
    setLoading(true);
    try {
      const { data: records } = await supabase
        .from("ca_records")
        .select("year, month, amount_eur, computed_contrib_eur, computed_net_eur")
        .eq("user_id", userId)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (!records || records.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const comparisonData: ComparisonData[] = [];
      const now = new Date();

      if (comparisonType === "monthly") {
        // Comparaison des 6 derniers mois
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthRecords = records.filter(
            (r) => r.year === date.getFullYear() && r.month === date.getMonth() + 1
          );

          const ca = monthRecords.reduce((sum, r) => sum + Number(r.amount_eur), 0);
          const contrib = monthRecords.reduce((sum, r) => sum + Number(r.computed_contrib_eur || 0), 0);
          const net = monthRecords.reduce((sum, r) => sum + Number(r.computed_net_eur || 0), 0);

          const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
          comparisonData.push({
            period: `${months[date.getMonth()]} ${date.getFullYear()}`,
            ca,
            net,
            contrib,
          });
        }

        // Calculer la croissance
        for (let i = 1; i < comparisonData.length; i++) {
          const prevCA = comparisonData[i - 1].ca;
          const currentCA = comparisonData[i].ca;
          if (prevCA > 0) {
            comparisonData[i].growth = ((currentCA - prevCA) / prevCA) * 100;
          }
        }
      } else {
        // Comparaison année/année
        const currentYear = now.getFullYear();
        const lastYear = currentYear - 1;

        const currentYearRecords = records.filter((r) => r.year === currentYear);
        const lastYearRecords = records.filter((r) => r.year === lastYear);

        const currentCA = currentYearRecords.reduce((sum, r) => sum + Number(r.amount_eur), 0);
        const currentContrib = currentYearRecords.reduce((sum, r) => sum + Number(r.computed_contrib_eur || 0), 0);
        const currentNet = currentYearRecords.reduce((sum, r) => sum + Number(r.computed_net_eur || 0), 0);

        const lastCA = lastYearRecords.reduce((sum, r) => sum + Number(r.amount_eur), 0);
        const lastContrib = lastYearRecords.reduce((sum, r) => sum + Number(r.computed_contrib_eur || 0), 0);
        const lastNet = lastYearRecords.reduce((sum, r) => sum + Number(r.computed_net_eur || 0), 0);

        comparisonData.push({
          period: `${lastYear}`,
          ca: lastCA,
          net: lastNet,
          contrib: lastContrib,
        });

        comparisonData.push({
          period: `${currentYear}`,
          ca: currentCA,
          net: currentNet,
          contrib: currentContrib,
          growth: lastCA > 0 ? ((currentCA - lastCA) / lastCA) * 100 : 0,
        });
      }

      setData(comparisonData);
    } catch (error) {
      console.error("Error loading comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth?: number) => {
    if (!growth) return <Minus className="w-4 h-4 text-gray-500" />;
    if (growth > 0) return <TrendingUp className="w-4 h-4" style={{ color: "#00D084" }} />;
    return <TrendingDown className="w-4 h-4" style={{ color: "#ef4444" }} />;
  };

  const getGrowthColor = (growth?: number) => {
    if (!growth) return "text-gray-400";
    if (growth > 0) return "text-green-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Comparaisons" }]} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Comparaisons</h1>
          <p className="text-gray-400">Comparez vos performances mois/mois et année/année</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setComparisonType("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              comparisonType === "monthly"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
            style={{
              backgroundColor: comparisonType === "monthly" ? "#00D08420" : "#0e0f12",
              border: `1px solid ${comparisonType === "monthly" ? "#00D084" : "#2d3441"}`,
            }}
          >
            Mois/mois
          </button>
          <button
            onClick={() => setComparisonType("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              comparisonType === "yearly"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
            style={{
              backgroundColor: comparisonType === "yearly" ? "#00D08420" : "#0e0f12",
              border: `1px solid ${comparisonType === "yearly" ? "#00D084" : "#2d3441"}`,
            }}
          >
            Année/année
          </button>
        </div>
      </div>

      {/* Graphique */}
      {data.length > 0 && (
        <div
          className="rounded-xl p-6 border mb-8"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Évolution du CA</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3441" />
              <XAxis dataKey="period" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e0f12",
                  border: "1px solid #2d3441",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="ca" name="Chiffre d'affaires" fill="#00D084" />
              <Bar dataKey="net" name="Revenu net" fill="#2E6CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tableau de comparaison */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: "#14161b",
          borderColor: "#1f232b",
        }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Détail par période</h2>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b" style={{ borderColor: "#1f232b" }}>
                <th className="text-left py-3 px-2 sm:px-4 text-sm font-semibold text-gray-400 whitespace-nowrap">Période</th>
                <th className="text-right py-3 px-2 sm:px-4 text-sm font-semibold text-gray-400 whitespace-nowrap">CA</th>
                <th className="text-right py-3 px-2 sm:px-4 text-sm font-semibold text-gray-400 whitespace-nowrap">Revenu net</th>
                <th className="text-right py-3 px-2 sm:px-4 text-sm font-semibold text-gray-400 whitespace-nowrap">Croissance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-800/30 transition-colors"
                  style={{ borderColor: "#1f232b" }}
                >
                  <td className="py-3 px-2 sm:px-4 text-white font-medium whitespace-nowrap">{item.period}</td>
                  <td className="py-3 px-2 sm:px-4 text-right text-white whitespace-nowrap">{Math.round(item.ca * 100) / 100} €</td>
                  <td className="py-3 px-2 sm:px-4 text-right text-white whitespace-nowrap">{Math.round(item.net * 100) / 100} €</td>
                  <td className="py-3 px-2 sm:px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {getGrowthIcon(item.growth)}
                      <span className={getGrowthColor(item.growth)}>
                        {item.growth !== undefined
                          ? `${item.growth > 0 ? "+" : ""}${item.growth.toFixed(1)}%`
                          : "-"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques résumées */}
      {data.length >= 2 && (
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "#14161b",
              borderColor: "#1f232b",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6" style={{ color: "#00D084" }} />
              <h3 className="text-lg font-semibold text-white">CA moyen</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {(data.reduce((sum, d) => sum + d.ca, 0) / data.length).toFixed(2)} €
            </p>
            <p className="text-sm text-gray-400 mt-1">Par période</p>
          </div>

          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "#14161b",
              borderColor: "#1f232b",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" style={{ color: "#2E6CF6" }} />
              <h3 className="text-lg font-semibold text-white">Croissance moyenne</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {data
                .filter((d) => d.growth !== undefined)
                .reduce((sum, d) => sum + (d.growth || 0), 0) /
                data.filter((d) => d.growth !== undefined).length >
              0
                ? `+${(
                    data
                      .filter((d) => d.growth !== undefined)
                      .reduce((sum, d) => sum + (d.growth || 0), 0) /
                    data.filter((d) => d.growth !== undefined).length
                  ).toFixed(1)}%`
                : "0%"}
            </p>
            <p className="text-sm text-gray-400 mt-1">Tendance</p>
          </div>

          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "#14161b",
              borderColor: "#1f232b",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" style={{ color: "#f59e0b" }} />
              <h3 className="text-lg font-semibold text-white">Meilleure période</h3>
            </div>
            <p className="text-xl font-bold text-white">
              {data.reduce((max, d) => (d.ca > max.ca ? d : max), data[0])?.period || "-"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {data.reduce((max, d) => (d.ca > max.ca ? d : max), data[0])?.ca.toFixed(2) || "0"} €
            </p>
          </div>
        </div>
      )}
    </div>
  );
}







