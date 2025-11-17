"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Plus, Settings, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_condition: any;
  action_type: string;
  action_config: any;
  enabled: boolean;
}

export default function AutomationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    trigger_type: "ca_threshold",
    trigger_condition: { threshold: 0 },
    action_type: "send_notification",
    action_config: { message: "" },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadRules(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadRules = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Error loading rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("automation_rules")
        .insert({
          user_id: user.id,
          ...formData,
        });

      if (error) throw error;
      await loadRules(user.id);
      setShowAddModal(false);
      setFormData({
        name: "",
        trigger_type: "ca_threshold",
        trigger_condition: { threshold: 0 },
        action_type: "send_notification",
        action_config: { message: "" },
      });
    } catch (error) {
      console.error("Error creating rule:", error);
      alert("Erreur lors de la création de la règle");
    }
  };

  const handleToggle = async (ruleId: string, enabled: boolean) => {
    if (!user) return;

    try {
      await supabase
        .from("automation_rules")
        .update({ enabled: !enabled })
        .eq("id", ruleId)
        .eq("user_id", user.id);

      await loadRules(user.id);
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!user || !confirm("Supprimer cette règle ?")) return;

    try {
      await supabase
        .from("automation_rules")
        .delete()
        .eq("id", ruleId)
        .eq("user_id", user.id);

      await loadRules(user.id);
    } catch (error) {
      console.error("Error deleting rule:", error);
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
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Règles automatiques" }]} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Règles automatiques</h1>
          <p className="text-gray-400">Automatisez vos actions selon des conditions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
          }}
        >
          <Plus className="w-5 h-5" />
          Nouvelle règle
        </button>
      </div>

      <div className="grid gap-4">
        {rules.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <Settings className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400 mb-4">Aucune règle automatique</p>
            <p className="text-sm text-gray-500">
              Créez votre première règle pour automatiser vos tâches
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: "#14161b",
                borderColor: rule.enabled ? "#00D084" : "#1f232b",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-6 h-6" style={{ color: "#00D084" }} />
                    <h3 className="text-xl font-semibold text-white">{rule.name}</h3>
                    <button
                      onClick={() => handleToggle(rule.id, rule.enabled)}
                      className="ml-2"
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-6 h-6" style={{ color: "#00D084" }} />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>
                      Déclencheur : <span className="text-white">{rule.trigger_type}</span>
                    </p>
                    <p>
                      Action : <span className="text-white">{rule.action_type}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Nouvelle règle</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de la règle *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="Ex: Alerte CA élevé"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Déclencheur *
                </label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  <option value="ca_threshold">CA dépasse un seuil</option>
                  <option value="date">Date spécifique</option>
                  <option value="record_created">Enregistrement créé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Action *
                </label>
                <select
                  value={formData.action_type}
                  onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  <option value="send_notification">Envoyer une notification</option>
                  <option value="create_invoice">Créer une facture</option>
                  <option value="categorize">Catégoriser automatiquement</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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





