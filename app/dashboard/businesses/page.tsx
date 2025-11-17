"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Plus, Building2, Check, X, Edit2, Trash2 } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface Business {
  id: string;
  name: string;
  activity_type: string;
  siret?: string;
  is_primary: boolean;
}

export default function BusinessesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    activity_type: "",
    siret: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadBusinesses(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadBusinesses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_businesses")
        .select("*")
        .eq("user_id", userId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingBusiness) {
        // Mise à jour
        const { error } = await supabase
          .from("user_businesses")
          .update({
            name: formData.name,
            activity_type: formData.activity_type,
            siret: formData.siret || null,
          })
          .eq("id", editingBusiness.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Création
        const isFirstBusiness = businesses.length === 0;
        const { error } = await supabase
          .from("user_businesses")
          .insert({
            user_id: user.id,
            name: formData.name,
            activity_type: formData.activity_type,
            siret: formData.siret || null,
            is_primary: isFirstBusiness,
          });

        if (error) throw error;
      }

      await loadBusinesses(user.id);
      setShowAddModal(false);
      setEditingBusiness(null);
      setFormData({ name: "", activity_type: "", siret: "" });
    } catch (error) {
      console.error("Error saving business:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleSetPrimary = async (businessId: string) => {
    if (!user) return;

    try {
      // Désactiver toutes les autres entreprises primaires
      await supabase
        .from("user_businesses")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      // Activer celle-ci
      await supabase
        .from("user_businesses")
        .update({ is_primary: true })
        .eq("id", businessId)
        .eq("user_id", user.id);

      await loadBusinesses(user.id);
    } catch (error) {
      console.error("Error setting primary:", error);
    }
  };

  const handleDelete = async (businessId: string) => {
    if (!user || !confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;

    try {
      const { error } = await supabase
        .from("user_businesses")
        .delete()
        .eq("id", businessId)
        .eq("user_id", user.id);

      if (error) throw error;
      await loadBusinesses(user.id);
    } catch (error) {
      console.error("Error deleting business:", error);
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
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Mes entreprises" }]} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mes entreprises</h1>
          <p className="text-gray-400">Gérez plusieurs micro-entreprises dans un seul compte</p>
        </div>
        <button
          onClick={() => {
            setEditingBusiness(null);
            setFormData({ name: "", activity_type: "", siret: "" });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
          }}
        >
          <Plus className="w-5 h-5" />
          Ajouter une entreprise
        </button>
      </div>

      <div className="grid gap-4">
        {businesses.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400 mb-4">Aucune entreprise enregistrée</p>
            <p className="text-sm text-gray-500">
              Ajoutez votre première entreprise pour commencer
            </p>
          </div>
        ) : (
          businesses.map((business) => (
            <div
              key={business.id}
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: "#14161b",
                borderColor: business.is_primary ? "#00D084" : "#1f232b",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-6 h-6" style={{ color: "#00D084" }} />
                    <h3 className="text-xl font-semibold text-white">{business.name}</h3>
                    {business.is_primary && (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#00D08420", color: "#00D084" }}>
                        Principale
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Type d'activité : <span className="text-white">{business.activity_type}</span></p>
                    {business.siret && (
                      <p>SIRET : <span className="text-white">{business.siret}</span></p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!business.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(business.id)}
                      className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                      style={{ color: "#9ca3af" }}
                      title="Définir comme principale"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingBusiness(business);
                      setFormData({
                        name: business.name,
                        activity_type: business.activity_type,
                        siret: business.siret || "",
                      });
                      setShowAddModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    style={{ color: "#9ca3af" }}
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {!business.is_primary && (
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      style={{ color: "#ef4444" }}
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowAddModal(false);
            setEditingBusiness(null);
          }}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingBusiness ? "Modifier l'entreprise" : "Nouvelle entreprise"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="Ex: Mon activité freelance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type d'activité *
                </label>
                <select
                  value={formData.activity_type}
                  onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  <option value="">Sélectionnez...</option>
                  <option value="Vente de marchandises">Vente de marchandises</option>
                  <option value="Prestation de services">Prestation de services</option>
                  <option value="Activité libérale">Activité libérale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SIRET (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="14 chiffres"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  {editingBusiness ? "Enregistrer" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBusiness(null);
                  }}
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







