"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Plus, Target, TrendingUp, AlertTriangle } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface Budget {
  id: string;
  name: string;
  category?: string;
  period_type: string;
  period_start: string;
  period_end: string;
  budget_amount: number;
  spent_amount: number;
}

export default function BudgetsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    period_type: "monthly",
    period_start: "",
    period_end: "",
    budget_amount: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadBudgets(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadBudgets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error("Error loading budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (budget: Budget) => {
    return Math.min((budget.spent_amount / budget.budget_amount) * 100, 100);
  };

  const getStatus = (budget: Budget) => {
    const progress = getProgress(budget);
    if (progress >= 100) return "exceeded";
    if (progress >= 80) return "warning";
    return "ok";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Calculer les dates selon le type de période
      let startDate = formData.period_start;
      let endDate = formData.period_end;

      if (!startDate || !endDate) {
        const now = new Date();
        if (formData.period_type === "monthly") {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        } else if (formData.period_type === "quarterly") {
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
        } else if (formData.period_type === "yearly") {
          startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        }
      }

      const { error } = await supabase
        .from("budgets")
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category || null,
          period_type: formData.period_type,
          period_start: startDate,
          period_end: endDate,
          budget_amount: Number(formData.budget_amount),
          spent_amount: 0,
        });

      if (error) throw error;

      await loadBudgets(user.id);
      setShowModal(false);
      setFormData({
        name: "",
        category: "",
        period_type: "monthly",
        period_start: "",
        period_end: "",
        budget_amount: 0,
      });
    } catch (error) {
      console.error("Error creating budget:", error);
      alert("Erreur lors de la création du budget");
    } finally {
      setSaving(false);
    }
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
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Budgets" }]} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Budgets</h1>
          <p className="text-gray-400">Planifiez et suivez vos dépenses par catégorie</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
          }}
        >
          <Plus className="w-5 h-5" />
          Nouveau budget
        </button>
      </div>

      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <Target className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400 mb-4">Aucun budget défini</p>
            <p className="text-sm text-gray-500">
              Créez votre premier budget pour suivre vos dépenses
            </p>
          </div>
        ) : (
          budgets.map((budget) => {
            const progress = getProgress(budget);
            const status = getStatus(budget);
            const remaining = budget.budget_amount - budget.spent_amount;

            return (
              <div
                key={budget.id}
                className="rounded-xl p-6 border"
                style={{
                  backgroundColor: "#14161b",
                  borderColor:
                    status === "exceeded"
                      ? "#ef4444"
                      : status === "warning"
                      ? "#f59e0b"
                      : "#1f232b",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-6 h-6" style={{ color: "#00D084" }} />
                      <h3 className="text-xl font-semibold text-white">{budget.name}</h3>
                      {status === "exceeded" && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    {budget.category && (
                      <p className="text-sm text-gray-400">Catégorie : {budget.category}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {budget.spent_amount.toFixed(2)} €
                    </p>
                    <p className="text-sm text-gray-400">
                      / {budget.budget_amount.toFixed(2)} €
                    </p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Progression</span>
                    <span
                      className={`font-semibold ${
                        status === "exceeded"
                          ? "text-red-500"
                          : status === "warning"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#0e0f12" }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor:
                          status === "exceeded"
                            ? "#ef4444"
                            : status === "warning"
                            ? "#f59e0b"
                            : "#00D084",
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Restant : <span className="text-white font-semibold">{remaining.toFixed(2)} €</span>
                  </span>
                  <span className="text-gray-400">
                    {budget.period_type} • {new Date(budget.period_start).toLocaleDateString("fr-FR")} - {new Date(budget.period_end).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal création budget */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Créer un nouveau budget</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du budget *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="Ex: Marketing, Matériel, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Catégorie (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="Ex: Marketing, Matériel, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de période *
                </label>
                <select
                  value={formData.period_type}
                  onChange={(e) => setFormData({ ...formData, period_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  <option value="monthly">Mensuel</option>
                  <option value="quarterly">Trimestriel</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Montant du budget (€) *
                </label>
                <input
                  type="number"
                  value={formData.budget_amount}
                  onChange={(e) => setFormData({ ...formData, budget_amount: Number(e.target.value) })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                  style={{
                    background: saving
                      ? "#6b7280"
                      : "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  {saving ? "Création..." : "Créer le budget"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-300 font-medium transition-colors hover:bg-gray-800"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




