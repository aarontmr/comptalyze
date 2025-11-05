"use client";

import { useState } from "react";
import { Calculator, TrendingUp, AlertCircle, Info } from "lucide-react";

export default function TVASimulatorPage() {
  const [revenue, setRevenue] = useState<number>(0);
  const [activityType, setActivityType] = useState<"service" | "commerce">("service");
  const [withTVA, setWithTVA] = useState(false);

  // Seuils de franchise de TVA
  const TVA_THRESHOLDS = {
    service: {
      base: 37500,
      majore: 39100,
    },
    commerce: {
      base: 85800,
      majore: 94300,
    },
  };

  const currentThreshold = TVA_THRESHOLDS[activityType];
  const isAboveThreshold = revenue > currentThreshold.base;
  const isAboveMajore = revenue > currentThreshold.majore;

  // Calcul avec TVA
  const tvaRate = activityType === "service" ? 0.2 : 0.2; // 20% dans les deux cas
  const revenueHT = withTVA ? revenue / (1 + tvaRate) : revenue;
  const tvaMontant = withTVA ? revenue - revenueHT : 0;

  // Calcul des cotisations (taux simplifié)
  const cotisationRate = activityType === "service" ? 0.215 : 0.128;
  const cotisations = revenueHT * cotisationRate;
  const revenuNet = revenueHT - cotisations;

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calculator className="w-8 h-8" style={{ color: "#00D084" }} />
            Simulateur de TVA
          </h1>
          <p className="text-gray-400">
            Simulez l'impact de la TVA sur votre activité de micro-entrepreneur
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Paramètres</h2>

            {/* Type d'activité */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Type d'activité
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActivityType("service")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activityType === "service"
                      ? "text-white shadow-md"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  style={
                    activityType === "service"
                      ? {
                          background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        }
                      : { backgroundColor: "#0e0f12", border: "1px solid #2d3441" }
                  }
                >
                  Prestations de services
                </button>
                <button
                  onClick={() => setActivityType("commerce")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activityType === "commerce"
                      ? "text-white shadow-md"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  style={
                    activityType === "commerce"
                      ? {
                          background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        }
                      : { backgroundColor: "#0e0f12", border: "1px solid #2d3441" }
                  }
                >
                  Vente de marchandises
                </button>
              </div>
            </div>

            {/* Chiffre d'affaires */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chiffre d'affaires annuel (€)
              </label>
              <input
                type="number"
                value={revenue || ""}
                onChange={(e) => setRevenue(Number(e.target.value))}
                placeholder="Ex: 50000"
                className="w-full px-4 py-3 rounded-lg text-white text-lg"
                style={{
                  backgroundColor: "#0e0f12",
                  border: "1px solid #2d3441",
                }}
              />
            </div>

            {/* Assujetti à la TVA */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg transition-colors hover:bg-opacity-50"
                style={{ backgroundColor: "#0e0f12" }}
              >
                <input
                  type="checkbox"
                  checked={withTVA}
                  onChange={(e) => setWithTVA(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded cursor-pointer"
                  style={{ accentColor: "#2E6CF6" }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white mb-1">
                    Je suis assujetti à la TVA
                  </div>
                  <div className="text-xs text-gray-400">
                    Cochez si vous facturez avec TVA (dépassement de seuil ou option volontaire)
                  </div>
                </div>
              </label>
            </div>

            {/* Info seuils */}
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: isAboveThreshold ? "rgba(239, 68, 68, 0.1)" : "rgba(46, 108, 246, 0.1)",
                border: isAboveThreshold ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(46, 108, 246, 0.3)",
              }}
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: isAboveThreshold ? "#ef4444" : "#2E6CF6" }} 
                />
                <div className="text-sm">
                  <div className="font-semibold mb-1" style={{ color: isAboveThreshold ? "#ef4444" : "#2E6CF6" }}>
                    {isAboveMajore
                      ? "⚠️ Seuil majoré dépassé"
                      : isAboveThreshold
                      ? "⚠️ Seuil de base dépassé"
                      : "✓ En dessous du seuil"}
                  </div>
                  <div className="text-gray-300">
                    Seuil de franchise : <span className="font-medium">{currentThreshold.base.toLocaleString()} €</span>
                    <br />
                    Seuil majoré : <span className="font-medium">{currentThreshold.majore.toLocaleString()} €</span>
                  </div>
                  {isAboveMajore && (
                    <div className="mt-2 text-red-400 text-xs">
                      Vous devez obligatoirement facturer avec TVA dès le 1er jour du mois de dépassement.
                    </div>
                  )}
                  {isAboveThreshold && !isAboveMajore && (
                    <div className="mt-2 text-orange-400 text-xs">
                      Vous avez dépassé le seuil de base. Si vous dépassez le seuil majoré, vous devrez facturer avec TVA.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="space-y-4">
            {/* Résumé */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <h2 className="text-xl font-semibold text-white mb-6">Résultats</h2>

              <div className="space-y-4">
                {withTVA && (
                  <>
                    <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: "#2d3441" }}>
                      <span className="text-gray-400">CA TTC (avec TVA)</span>
                      <span className="text-xl font-bold text-white">{revenue.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: "#2d3441" }}>
                      <span className="text-gray-400">CA HT (hors TVA)</span>
                      <span className="text-xl font-bold text-white">{revenueHT.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: "#2d3441" }}>
                      <span className="text-gray-400">TVA collectée (20%)</span>
                      <span className="text-lg font-semibold" style={{ color: "#ef4444" }}>
                        {tvaMontant.toFixed(2)} €
                      </span>
                    </div>
                  </>
                )}
                {!withTVA && (
                  <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: "#2d3441" }}>
                    <span className="text-gray-400">Chiffre d'affaires</span>
                    <span className="text-xl font-bold text-white">{revenue.toLocaleString()} €</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: "#2d3441" }}>
                  <span className="text-gray-400">Cotisations URSSAF ({(cotisationRate * 100).toFixed(1)}%)</span>
                  <span className="text-lg font-semibold" style={{ color: "#ef4444" }}>
                    {cotisations.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-white">Revenu net</span>
                  <span className="text-2xl font-bold" style={{ color: "#00D084" }}>
                    {revenuNet.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>

            {/* Comparaison avec/sans TVA */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: "#00D084" }} />
                Conseil
              </h3>
              
              {!isAboveThreshold && (
                <div className="text-sm text-gray-300 space-y-2">
                  <p>✓ Vous êtes en franchise de TVA, continuez sans TVA.</p>
                  <p className="text-gray-400">
                    Restez vigilant : il vous reste {(currentThreshold.base - revenue).toLocaleString()} € de marge avant le seuil.
                  </p>
                </div>
              )}

              {isAboveThreshold && !isAboveMajore && (
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="text-orange-400">⚠️ Attention : vous avez dépassé le seuil de base.</p>
                  <p>
                    Vous pouvez encore bénéficier de la franchise cette année, mais soyez prudent pour l'année suivante.
                  </p>
                </div>
              )}

              {isAboveMajore && (
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="text-red-400">❌ Vous devez obligatoirement facturer avec TVA.</p>
                  <p>
                    Pensez à vous immatriculer à la TVA et à modifier vos factures dès le 1er jour du mois de dépassement.
                  </p>
                </div>
              )}
            </div>

            {/* Impact sur le prix de vente */}
            {withTVA && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(0,208,132,0.08) 0%, rgba(46,108,246,0.08) 100%)",
                  border: "1px solid rgba(46,108,246,0.2)",
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-3">💡 Impact sur vos prix</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    Pour maintenir le même revenu net, vous devez augmenter vos prix de <span className="font-bold text-white">20%</span> (TVA).
                  </p>
                  <p className="text-gray-400">
                    Exemple : Si vous facturiez 100€, facturez maintenant 120€ TTC (100€ HT + 20€ de TVA).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

