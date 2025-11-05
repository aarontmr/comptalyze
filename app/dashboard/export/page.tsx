"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Download, FileSpreadsheet, FileText, Calendar } from "lucide-react";
import { User } from "@supabase/supabase-js";

export default function ExportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "csv" | "pdf">("excel");
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  const handleExport = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/export-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          exportType,
          period,
          date: selectedDate,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `comptalyze_export_${period}_${selectedDate}.${exportType === "excel" ? "xlsx" : exportType}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Erreur export:", error);
      alert("Erreur lors de l'export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Download className="w-8 h-8" style={{ color: "#00D084" }} />
            Export comptable
          </h1>
          <p className="text-gray-400">
            Exportez vos données pour votre expert-comptable ou vos archives
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Configuration de l'export</h2>

            {/* Type d'export */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Format d'export
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setExportType("excel")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    exportType === "excel" ? "text-white" : "text-gray-400"
                  }`}
                  style={
                    exportType === "excel"
                      ? { background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }
                      : { backgroundColor: "#0e0f12", border: "1px solid #2d3441" }
                  }
                >
                  <FileSpreadsheet className="w-4 h-4 mx-auto mb-1" />
                  Excel
                </button>
                <button
                  onClick={() => setExportType("csv")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    exportType === "csv" ? "text-white" : "text-gray-400"
                  }`}
                  style={
                    exportType === "csv"
                      ? { background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }
                      : { backgroundColor: "#0e0f12", border: "1px solid #2d3441" }
                  }
                >
                  <FileText className="w-4 h-4 mx-auto mb-1" />
                  CSV
                </button>
                <button
                  onClick={() => setExportType("pdf")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    exportType === "pdf" ? "text-white" : "text-gray-400"
                  }`}
                  style={
                    exportType === "pdf"
                      ? { background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }
                      : { backgroundColor: "#0e0f12", border: "1px solid #2d3441" }
                  }
                >
                  <FileText className="w-4 h-4 mx-auto mb-1" />
                  PDF
                </button>
              </div>
            </div>

            {/* Période */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Période
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPeriod("month")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    period === "month" ? "text-white" : "text-gray-400"
                  }`}
                  style={
                    period === "month"
                      ? { background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }
                      : { backgroundColor: "#0e0f12", border: "1px solid #2d3441" }
                  }
                >
                  Mois
                </button>
                <button
                  onClick={() => setPeriod("quarter")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    period === "quarter" ? "text-white" : "text-gray-400"
                  }`}
                  style={
                    period === "quarter"
                      ? { background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }
                      : { backgroundColor: "#0e0f12", border: "1px solid #2d3441" }
                  }
                >
                  Trimestre
                </button>
                <button
                  onClick={() => setPeriod("year")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    period === "year" ? "text-white" : "text-gray-400"
                  }`}
                  style={
                    period === "year"
                      ? { background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }
                      : { backgroundColor: "#0e0f12", border: "1px solid #2d3441" }
                  }
                >
                  Année
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de référence
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white"
                style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
              />
            </div>

            {/* Bouton export */}
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full px-6 py-4 rounded-lg text-white font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
              }}
            >
              <Download className="w-5 h-5" />
              {loading ? "Export en cours..." : "Télécharger l'export"}
            </button>
          </div>

          {/* Aperçu */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Contenu de l'export</h2>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00D084" }} />
                <span>Toutes vos simulations URSSAF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00D084" }} />
                <span>Vos factures émises et reçues</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00D084" }} />
                <span>Récapitulatif des cotisations payées</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00D084" }} />
                <span>Statistiques de revenus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00D084" }} />
                <span>Graphiques d'évolution</span>
              </div>
            </div>

            {/* Formats disponibles */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "#2d3441" }}>
              <h3 className="text-sm font-semibold text-white mb-4">Formats disponibles</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: "#0e0f12" }}>
                  <FileSpreadsheet className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <div className="text-sm font-medium text-white">Excel (.xlsx)</div>
                    <div className="text-xs text-gray-400">Idéal pour les analyses et tableaux croisés</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: "#0e0f12" }}>
                  <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <div className="text-sm font-medium text-white">CSV (.csv)</div>
                    <div className="text-xs text-gray-400">Compatible avec tous les logiciels comptables</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: "#0e0f12" }}>
                  <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <div className="text-sm font-medium text-white">PDF (.pdf)</div>
                    <div className="text-xs text-gray-400">Pour l'archivage et les justificatifs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

