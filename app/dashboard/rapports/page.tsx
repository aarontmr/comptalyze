"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Plus, FileText, Mail, Calendar, Download, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface AutomatedReport {
  id: string;
  report_type: string;
  frequency: string;
  format: string;
  recipients: string[];
  enabled: boolean;
  last_sent_at?: string;
  next_send_at?: string;
}

export default function RapportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<AutomatedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    report_type: "monthly",
    frequency: "monthly",
    format: "pdf",
    recipients: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadReports(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadReports = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("automated_reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const recipients = formData.recipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      // Calculer la prochaine date d'envoi
      const now = new Date();
      let nextSendAt = new Date();
      if (formData.frequency === "monthly") {
        nextSendAt.setMonth(nextSendAt.getMonth() + 1);
        nextSendAt.setDate(1);
      } else if (formData.frequency === "quarterly") {
        nextSendAt.setMonth(nextSendAt.getMonth() + 3);
        nextSendAt.setDate(1);
      } else {
        nextSendAt.setFullYear(nextSendAt.getFullYear() + 1);
        nextSendAt.setMonth(0);
        nextSendAt.setDate(1);
      }

      const { error } = await supabase
        .from("automated_reports")
        .insert({
          user_id: user.id,
          report_type: formData.report_type,
          frequency: formData.frequency,
          format: formData.format,
          recipients: recipients,
          next_send_at: nextSendAt.toISOString(),
          enabled: true,
        });

      if (error) throw error;
      await loadReports(user.id);
      setShowAddModal(false);
      setFormData({
        report_type: "monthly",
        frequency: "monthly",
        format: "pdf",
        recipients: "",
      });
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Erreur lors de la création du rapport");
    }
  };

  const handleToggle = async (reportId: string, enabled: boolean) => {
    if (!user) return;

    try {
      await supabase
        .from("automated_reports")
        .update({ enabled: !enabled })
        .eq("id", reportId)
        .eq("user_id", user.id);

      await loadReports(user.id);
    } catch (error) {
      console.error("Error toggling report:", error);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!user || !confirm("Supprimer ce rapport automatisé ?")) return;

    try {
      await supabase
        .from("automated_reports")
        .delete()
        .eq("id", reportId)
        .eq("user_id", user.id);

      await loadReports(user.id);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleGenerateNow = async (reportId: string) => {
    if (!user) return;
    // TODO: Implémenter la génération immédiate du rapport
    alert("Génération du rapport en cours...");
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
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Rapports automatisés" }]} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rapports automatisés</h1>
          <p className="text-gray-400">Générez et envoyez automatiquement vos rapports comptables</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
          }}
        >
          <Plus className="w-5 h-5" />
          Nouveau rapport
        </button>
      </div>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400 mb-4">Aucun rapport automatisé</p>
            <p className="text-sm text-gray-500">
              Créez votre premier rapport pour recevoir automatiquement vos statistiques
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: "#14161b",
                borderColor: report.enabled ? "#00D084" : "#1f232b",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6" style={{ color: "#00D084" }} />
                    <h3 className="text-xl font-semibold text-white">
                      Rapport {report.report_type === "monthly" ? "mensuel" : report.report_type === "quarterly" ? "trimestriel" : "annuel"}
                    </h3>
                    <button
                      onClick={() => handleToggle(report.id, report.enabled)}
                      className="ml-2"
                    >
                      {report.enabled ? (
                        <ToggleRight className="w-6 h-6" style={{ color: "#00D084" }} />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>
                      Format : <span className="text-white">{report.format.toUpperCase()}</span>
                    </p>
                    <p>
                      Fréquence : <span className="text-white">
                        {report.frequency === "monthly" ? "Mensuel" : report.frequency === "quarterly" ? "Trimestriel" : "Annuel"}
                      </span>
                    </p>
                    <p>
                      Destinataires : <span className="text-white">{report.recipients.length} email(s)</span>
                    </p>
                    {report.last_sent_at && (
                      <p>
                        Dernier envoi : <span className="text-white">
                          {new Date(report.last_sent_at).toLocaleDateString("fr-FR")}
                        </span>
                      </p>
                    )}
                    {report.next_send_at && report.enabled && (
                      <p>
                        Prochain envoi : <span className="text-white">
                          {new Date(report.next_send_at).toLocaleDateString("fr-FR")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateNow(report.id)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    style={{ color: "#9ca3af" }}
                    title="Générer maintenant"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    style={{ color: "#ef4444" }}
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
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
            <h2 className="text-xl font-semibold text-white mb-4">Nouveau rapport automatisé</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de rapport *
                </label>
                <select
                  value={formData.report_type}
                  onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  <option value="monthly">Mensuel</option>
                  <option value="quarterly">Trimestriel</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fréquence *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  <option value="monthly">Mensuel</option>
                  <option value="quarterly">Trimestriel</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Format *
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Destinataires (emails séparés par des virgules) *
                </label>
                <textarea
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                  placeholder="email1@example.com, email2@example.com"
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




