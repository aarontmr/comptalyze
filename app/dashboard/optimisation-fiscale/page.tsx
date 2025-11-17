"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Lightbulb, TrendingUp, Calculator, AlertCircle } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface TaxOptimization {
  id: string;
  type: string;
  title: string;
  description: string;
  potentialSavings: number;
  priority: "high" | "medium" | "low";
}

export default function OptimisationFiscalePage() {
  const [user, setUser] = useState<User | null>(null);
  const [suggestions, setSuggestions] = useState<TaxOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCA, setCurrentCA] = useState(0);
  const [activityType, setActivityType] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadData(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
      // Récupérer le CA de l'année en cours
      const currentYear = new Date().getFullYear();
      const { data: records } = await supabase
        .from("ca_records")
        .select("amount_eur, activity_type")
        .eq("user_id", userId)
        .eq("year", currentYear);

      let totalCA = 0;
      let userActivityType = "";

      if (records && records.length > 0) {
        totalCA = records.reduce((sum, r) => sum + Number(r.amount_eur), 0);
        userActivityType = records[0].activity_type || "";
        setCurrentCA(totalCA);
        setActivityType(userActivityType);
      }

      // Générer des suggestions basées sur les données (passer totalCA et userActivityType directement)
      await generateSuggestions(userId, records || [], totalCA, userActivityType);
      
      // Scroll vers les suggestions après le chargement si elles existent
      setTimeout(() => {
        const suggestionsSection = document.getElementById("suggestions-section");
        if (suggestionsSection) {
          suggestionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async (userId: string, records: any[], ca: number, activityType: string) => {
    const suggestionsList: TaxOptimization[] = [];

    // Suggestion 1: Seuil de franchise TVA
    if (ca > 0 && ca < 50000) {
      const remaining = 50000 - ca;
      suggestionsList.push({
        id: "tva_threshold",
        type: "tva",
        title: "Optimisation du seuil de franchise TVA",
        description: `Vous êtes en dessous du seuil de franchise TVA (50 000 €). Vous avez encore ${remaining.toFixed(0)} € de marge avant de devoir facturer avec TVA.`,
        potentialSavings: remaining * 0.20, // 20% de TVA économisée
        priority: "high",
      });
    }

    // Suggestion 2: Plafond micro-entreprise
    const microThreshold = activityType.includes("Vente") ? 188700 : 77700;
    if (ca > 0 && ca < microThreshold) {
      const remaining = microThreshold - ca;
      suggestionsList.push({
        id: "micro_threshold",
        type: "regime",
        title: "Surveillance du plafond micro-entreprise",
        description: `Vous êtes en dessous du plafond (${microThreshold.toFixed(0)} €). Attention à ne pas le dépasser pour rester en micro-entreprise.`,
        potentialSavings: 0,
        priority: "medium",
      });
    }

    // Suggestion 3: Charges déductibles
    let charges: any[] = [];
    try {
      const { data } = await supabase
        .from("charges_deductibles")
        .select("amount_eur")
        .eq("user_id", userId);
      charges = data || [];
    } catch (error) {
      // Table peut ne pas exister encore, ce n'est pas bloquant
      console.warn("Table charges_deductibles non disponible:", error);
    }

    if (!charges || charges.length === 0) {
      suggestionsList.push({
        id: "track_charges",
        type: "charges",
        title: "Suivre vos charges déductibles",
        description: "Enregistrez vos charges pour un meilleur suivi, même si elles ne sont pas déductibles en micro-entreprise. Utile pour une éventuelle évolution vers un autre régime.",
        potentialSavings: 0,
        priority: "low",
      });
    }

    // Suggestion 4: Optimisation des déclarations
    suggestionsList.push({
      id: "auto_declarations",
      type: "declarations",
      title: "Déclarations automatisées",
      description: "Utilisez le pré-remplissage automatique URSSAF pour gagner du temps et éviter les erreurs.",
      potentialSavings: 0,
      priority: "medium",
    });

    setSuggestions(suggestionsList);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Analyse en cours...</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Optimisation fiscale" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Optimisation fiscale IA</h1>
        <p className="text-gray-400">Suggestions personnalisées pour optimiser votre situation fiscale</p>
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
            <Calculator className="w-6 h-6" style={{ color: "#00D084" }} />
            <h3 className="text-lg font-semibold text-white">CA annuel</h3>
          </div>
          <p className="text-3xl font-bold text-white">{currentCA.toFixed(2)} €</p>
          <p className="text-sm text-gray-400 mt-1">Année en cours</p>
        </div>

        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-6 h-6" style={{ color: "#2E6CF6" }} />
            <h3 className="text-lg font-semibold text-white">Suggestions</h3>
          </div>
          <p className="text-3xl font-bold text-white">{suggestions.length}</p>
          <p className="text-sm text-gray-400 mt-1">Optimisations disponibles</p>
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
            <h3 className="text-lg font-semibold text-white">Économies potentielles</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {suggestions.reduce((sum, s) => sum + s.potentialSavings, 0).toFixed(2)} €
          </p>
          <p className="text-sm text-gray-400 mt-1">Par an</p>
        </div>
      </div>

      {/* Suggestions */}
      <div id="suggestions-section" className="space-y-4">
        {suggestions.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <Lightbulb className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400">Aucune suggestion pour le moment</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              id={`suggestion-${suggestion.id}`}
              className="rounded-xl p-6 border transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: "#14161b",
                borderColor: getPriorityColor(suggestion.priority),
                borderWidth: suggestion.priority === "high" ? "2px" : "1px",
              }}
              onClick={() => {
                // Scroll vers la suggestion si elle n'est pas visible
                const element = document.getElementById(`suggestion-${suggestion.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Lightbulb className="w-6 h-6 flex-shrink-0" style={{ color: "#00D084" }} />
                    <h3 className="text-xl font-semibold text-white">{suggestion.title}</h3>
                    <span
                      className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${getPriorityColor(suggestion.priority)}20`,
                        color: getPriorityColor(suggestion.priority),
                      }}
                    >
                      {suggestion.priority === "high" ? "Priorité haute" : suggestion.priority === "medium" ? "Priorité moyenne" : "Priorité basse"}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3 leading-relaxed">{suggestion.description}</p>
                  {suggestion.potentialSavings > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: "#00D084" }} />
                      <span className="text-sm font-medium" style={{ color: "#00D084" }}>
                        Économie potentielle : {suggestion.potentialSavings.toFixed(2)} €
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note importante */}
      <div
        className="mt-6 rounded-xl p-4 border"
        style={{
          backgroundColor: "#2E6CF620",
          borderColor: "#2E6CF6",
        }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#2E6CF6" }} />
          <div>
            <p className="text-sm text-white font-medium mb-1">Note importante</p>
            <p className="text-xs text-gray-300">
              Ces suggestions sont basées sur vos données et des règles générales. Pour des conseils personnalisés,
              consultez un expert-comptable ou un conseiller fiscal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

