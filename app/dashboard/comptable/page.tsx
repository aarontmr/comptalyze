"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Plus, Users, Mail, Eye, Trash2, Copy, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface AccountantShare {
  id: string;
  accountant_email: string;
  shared_data_types: string[];
  access_level: string;
  status: string;
  token: string;
  expires_at?: string;
}

export default function ComptablePage() {
  const [user, setUser] = useState<User | null>(null);
  const [shares, setShares] = useState<AccountantShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accountant_email: "",
    shared_data_types: [] as string[],
    access_level: "read",
    expires_in_days: 90,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadShares(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadShares = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("accountant_shares")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error("Error loading shares:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Générer un token unique
      const token = `COMPTALYZE-${user.id.substring(0, 8)}-${Date.now().toString(36).toUpperCase()}`;
      
      // Calculer la date d'expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expires_in_days);

      const { error } = await supabase
        .from("accountant_shares")
        .insert({
          user_id: user.id,
          accountant_email: formData.accountant_email,
          shared_data_types: formData.shared_data_types,
          access_level: formData.access_level,
          token: token,
          expires_at: expiresAt.toISOString(),
          status: "pending",
        });

      if (error) throw error;
      await loadShares(user.id);
      setShowAddModal(false);
      setFormData({
        accountant_email: "",
        shared_data_types: [],
        access_level: "read",
        expires_in_days: 90,
      });
    } catch (error) {
      console.error("Error creating share:", error);
      alert("Erreur lors de la création du partage");
    }
  };

  const handleToggleDataType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      shared_data_types: prev.shared_data_types.includes(type)
        ? prev.shared_data_types.filter((t) => t !== type)
        : [...prev.shared_data_types, type],
    }));
  };

  const handleCopyToken = (token: string) => {
    const shareUrl = `${window.location.origin}/comptable/access?token=${token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDelete = async (shareId: string) => {
    if (!user || !confirm("Révoquer l'accès de ce comptable ?")) return;

    try {
      const { error } = await supabase
        .from("accountant_shares")
        .delete()
        .eq("id", shareId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting share:", error);
        alert("Erreur lors de la révocation de l'accès");
        return;
      }

      // Recharger la liste des partages pour mettre à jour l'affichage
      await loadShares(user.id);
    } catch (error) {
      console.error("Error deleting share:", error);
      alert("Erreur lors de la révocation de l'accès");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  const dataTypes = [
    { id: "invoices", label: "Factures" },
    { id: "ca_records", label: "Enregistrements CA" },
    { id: "charges", label: "Charges" },
    { id: "statistics", label: "Statistiques" },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Mode comptable" }]} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mode comptable</h1>
          <p className="text-gray-400">Partagez vos données avec votre expert-comptable</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
          }}
        >
          <Plus className="w-5 h-5" />
          Inviter un comptable
        </button>
      </div>

      <div className="grid gap-4">
        {shares.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400 mb-4">Aucun comptable invité</p>
            <p className="text-sm text-gray-500">
              Invitez votre expert-comptable pour lui donner accès à vos données
            </p>
          </div>
        ) : (
          shares.map((share) => (
            <div
              key={share.id}
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: "#14161b",
                borderColor: share.status === "accepted" ? "#00D084" : "#1f232b",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6" style={{ color: "#00D084" }} />
                    <h3 className="text-xl font-semibold text-white">{share.accountant_email}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        share.status === "accepted"
                          ? "bg-green-500/20 text-green-400"
                          : share.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {share.status === "accepted" ? "Accepté" : share.status === "pending" ? "En attente" : "Révoqué"}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>
                      Accès : <span className="text-white">
                        {share.access_level === "read" ? "Lecture seule" : "Lecture + Commentaires"}
                      </span>
                    </p>
                    <p>
                      Données partagées : <span className="text-white">{share.shared_data_types.length} type(s)</span>
                    </p>
                    {share.expires_at && (
                      <p>
                        Expire le : <span className="text-white">
                          {new Date(share.expires_at).toLocaleDateString("fr-FR")}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/comptable/access?token=${share.token}`}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg text-sm text-white"
                        style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                      />
                      <button
                        onClick={() => handleCopyToken(share.token)}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                        style={{ color: copiedToken === share.token ? "#00D084" : "#9ca3af" }}
                      >
                        {copiedToken === share.token ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(share.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  style={{ color: "#ef4444" }}
                  title="Révoquer l'accès"
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
            <h2 className="text-xl font-semibold text-white mb-4">Inviter un comptable</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email du comptable *
                </label>
                <input
                  type="email"
                  value={formData.accountant_email}
                  onChange={(e) => setFormData({ ...formData, accountant_email: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="comptable@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Données à partager *
                </label>
                <div className="space-y-2">
                  {dataTypes.map((type) => (
                    <label
                      key={type.id}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-800/30 transition-colors"
                      style={{ backgroundColor: "#0e0f12" }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.shared_data_types.includes(type.id)}
                        onChange={() => handleToggleDataType(type.id)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#00D084" }}
                      />
                      <span className="text-white text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Niveau d'accès *
                </label>
                <select
                  value={formData.access_level}
                  onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  <option value="read">Lecture seule</option>
                  <option value="comment">Lecture + Commentaires</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Durée d'accès (jours) *
                </label>
                <input
                  type="number"
                  value={formData.expires_in_days}
                  onChange={(e) => setFormData({ ...formData, expires_in_days: Number(e.target.value) })}
                  required
                  min={1}
                  max={365}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
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
                  Créer l'invitation
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


