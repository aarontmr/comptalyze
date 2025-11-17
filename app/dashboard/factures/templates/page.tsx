"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Plus, FileText, Edit2, Trash2, Star } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface InvoiceTemplate {
  id: string;
  name: string;
  template_data: any;
  is_default: boolean;
}

export default function InvoiceTemplatesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    primary_color: "#00D084",
    secondary_color: "#2E6CF6",
    footer_text: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadTemplates(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadTemplates = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("invoice_templates")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const templateData = {
        logo_url: formData.logo_url,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        footer_text: formData.footer_text,
      };

      const { error } = await supabase
        .from("invoice_templates")
        .insert({
          user_id: user.id,
          name: formData.name,
          template_data: templateData,
          is_default: templates.length === 0,
        });

      if (error) throw error;
      await loadTemplates(user.id);
      setShowAddModal(false);
      setFormData({
        name: "",
        logo_url: "",
        primary_color: "#00D084",
        secondary_color: "#2E6CF6",
        footer_text: "",
      });
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Erreur lors de la création du template");
    }
  };

  const handleSetDefault = async (templateId: string) => {
    if (!user) return;

    try {
      // Désactiver tous les autres templates par défaut
      await supabase
        .from("invoice_templates")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Activer celui-ci
      await supabase
        .from("invoice_templates")
        .update({ is_default: true })
        .eq("id", templateId)
        .eq("user_id", user.id);

      await loadTemplates(user.id);
    } catch (error) {
      console.error("Error setting default:", error);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!user || !confirm("Supprimer ce template ?")) return;

    try {
      await supabase
        .from("invoice_templates")
        .delete()
        .eq("id", templateId)
        .eq("user_id", user.id);

      await loadTemplates(user.id);
    } catch (error) {
      console.error("Error deleting template:", error);
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
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Factures", href: "/dashboard/factures" }, { label: "Templates" }]} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Templates de factures</h1>
          <p className="text-gray-400">Personnalisez l'apparence de vos factures</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
          }}
        >
          <Plus className="w-5 h-5" />
          Nouveau template
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <div
            className="col-span-full rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400 mb-4">Aucun template personnalisé</p>
            <p className="text-sm text-gray-500">
              Créez votre premier template pour personnaliser vos factures
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl p-6 border relative"
              style={{
                backgroundColor: "#14161b",
                borderColor: template.is_default ? "#00D084" : "#1f232b",
              }}
            >
              {template.is_default && (
                <div className="absolute top-4 right-4">
                  <Star className="w-5 h-5" style={{ color: "#00D084" }} fill="#00D084" />
                </div>
              )}

              <div className="mb-4">
                <FileText className="w-8 h-8 mb-2" style={{ color: "#00D084" }} />
                <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                {template.is_default && (
                  <p className="text-xs text-gray-400 mt-1">Template par défaut</p>
                )}
              </div>

              {/* Aperçu visuel */}
              <div
                className="mb-4 p-4 rounded-lg border"
                style={{
                  backgroundColor: "#0e0f12",
                  borderColor: "#2d3441",
                }}
              >
                <div
                  className="h-2 rounded mb-2"
                  style={{ backgroundColor: template.template_data?.primary_color || "#00D084" }}
                />
                <div className="h-1 rounded" style={{ backgroundColor: template.template_data?.secondary_color || "#2E6CF6" }} />
              </div>

              <div className="flex items-center gap-2">
                {!template.is_default && (
                  <button
                    onClick={() => handleSetDefault(template.id)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: "#0e0f12",
                      border: "1px solid #2d3441",
                      color: "#9ca3af",
                    }}
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  onClick={() => handleDelete(template.id)}
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
            <h2 className="text-xl font-semibold text-white mb-4">Nouveau template</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du template *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="Ex: Template entreprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL du logo (optionnel)
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Couleur principale
                  </label>
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Couleur secondaire
                  </label>
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Texte de pied de page (optionnel)
                </label>
                <textarea
                  value={formData.footer_text}
                  onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="Ex: Merci pour votre confiance"
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





