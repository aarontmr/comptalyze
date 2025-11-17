"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Download, FileText, Info } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export default function ExportFECPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportPeriod, setExportPeriod] = useState<"year" | "custom">("year");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Définir les dates par défaut pour l'année en cours
        const year = new Date().getFullYear();
        setStartDate(`${year}-01-01`);
        setEndDate(`${year}-12-31`);
      }
    };
    fetchUser();
  }, []);

  const generateFEC = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Récupérer les données selon la période
      let query = supabase
        .from("ca_records")
        .select("*")
        .eq("user_id", user.id);

      if (exportPeriod === "year") {
        query = query.eq("year", selectedYear);
      } else {
        if (!startDate || !endDate) {
          alert("Veuillez sélectionner une période");
          setLoading(false);
          return;
        }
        query = query.gte("created_at", startDate).lte("created_at", endDate);
      }

      const { data: records, error } = await query.order("year", { ascending: true }).order("month", { ascending: true });

      if (error) throw error;

      // Format FEC (Fichier des Écritures Comptables)
      // Structure : JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise
      const fecLines: string[] = [];
      
      // En-tête (optionnel selon le format)
      fecLines.push("JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise");

      // Générer les lignes FEC
      records?.forEach((record, index) => {
        const date = new Date(record.year, record.month - 1, 1);
        const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
        
        // Ligne CA (Crédit)
        fecLines.push(
          `OD|Opérations diverses|${String(index + 1).padStart(4, "0")}|${dateStr}|706000|Chiffre d'affaires|||||CA ${record.month}/${record.year}||${Number(record.amount_eur).toFixed(2).replace(".", ",")}|||${dateStr}||EUR`
        );
        
        // Ligne Cotisations (Débit)
        fecLines.push(
          `OD|Opérations diverses|${String(index + 1).padStart(4, "0")}|${dateStr}|641000|Cotisations URSSAF|||||Cotisations ${record.month}/${record.year}|${Number(record.computed_contrib_eur || 0).toFixed(2).replace(".", ",")}|||${dateStr}||EUR`
        );
      });

      // Créer le fichier
      const fecContent = fecLines.join("\n");
      const blob = new Blob([fecContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FEC_${exportPeriod === "year" ? selectedYear : "custom"}_${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating FEC:", error);
      alert("Erreur lors de la génération du fichier FEC");
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Export FEC" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Export FEC</h1>
        <p className="text-gray-400">Générez un fichier FEC (Fichier des Écritures Comptables) pour votre expert-comptable</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Paramètres d'export</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Période d'export *
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setExportPeriod("year")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    exportPeriod === "year" ? "text-white" : "text-gray-400"
                  }`}
                  style={{
                    backgroundColor: exportPeriod === "year" ? "#00D08420" : "#0e0f12",
                    border: `1px solid ${exportPeriod === "year" ? "#00D084" : "#2d3441"}`,
                  }}
                >
                  Année complète
                </button>
                <button
                  onClick={() => setExportPeriod("custom")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    exportPeriod === "custom" ? "text-white" : "text-gray-400"
                  }`}
                  style={{
                    backgroundColor: exportPeriod === "custom" ? "#00D08420" : "#0e0f12",
                    border: `1px solid ${exportPeriod === "custom" ? "#00D084" : "#2d3441"}`,
                  }}
                >
                  Période personnalisée
                </button>
              </div>

              {exportPeriod === "year" ? (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Date de début</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: "#0e0f12", border: "1px solid #2d3441" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={generateFEC}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50"
              style={{
                background: loading
                  ? "#6b7280"
                  : "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              }}
            >
              <Download className="w-5 h-5" />
              {loading ? "Génération..." : "Générer le fichier FEC"}
            </button>
          </div>
        </div>

        {/* Informations */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6" style={{ color: "#2E6CF6" }} />
            <h2 className="text-xl font-semibold text-white">À propos du format FEC</h2>
          </div>

          <div className="space-y-4 text-sm text-gray-400">
            <p>
              Le <strong className="text-white">Fichier des Écritures Comptables (FEC)</strong> est un format standardisé
              requis par l'administration fiscale française pour la transmission des données comptables.
            </p>

            <div>
              <h3 className="text-white font-medium mb-2">Caractéristiques :</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Format texte délimité par des pipes (|)</li>
                <li>Encodage UTF-8</li>
                <li>Compatible avec tous les logiciels comptables</li>
                <li>Conforme aux exigences fiscales</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Contenu exporté :</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tous vos enregistrements de CA</li>
                <li>Les cotisations URSSAF calculées</li>
                <li>Les dates et montants</li>
                <li>Les références de pièces</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: "#f59e0b20", border: "1px solid #f59e0b" }}>
              <p className="text-xs text-gray-300">
                <strong className="text-white">Note :</strong> Ce fichier peut être transmis directement à votre expert-comptable
                ou importé dans votre logiciel comptable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




