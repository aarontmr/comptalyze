"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getUserSubscription } from "@/lib/subscriptionUtils";
import { User } from "@supabase/supabase-js";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getCurrentUser();
    
    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartTrial = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      setTrialLoading(true);
      const res = await fetch("/api/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Erreur: ${data.error || "Une erreur est survenue"}`);
        return;
      }

      alert("🎉 Votre essai gratuit de 3 jours a commencé ! Profitez de toutes les fonctionnalités Premium.");
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors du démarrage de l'essai:", error);
      alert("Une erreur est survenue lors du démarrage de l'essai.");
    } finally {
      setTrialLoading(false);
    }
  };

  const handleCheckout = (plan: "pro" | "premium") => {
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Rediriger vers la page de checkout intégrée avec le cycle de facturation
    const planWithCycle = billingCycle === "yearly" ? `${plan}_yearly` : plan;
    window.location.href = `/checkout/${planWithCycle}`;
  };

  // Prix et économies
  const pricing = {
    pro: {
      monthly: 5.90,
      yearly: 56.90, // ~9.48€/mois (économie de 19%)
      yearlyMonthly: 4.74,
      savings: 13.90
    },
    premium: {
      monthly: 9.90,
      yearly: 94.90, // ~7.91€/mois (économie de 20%)
      yearlyMonthly: 7.91,
      savings: 24.90
    }
  };

  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">Des plans simples et transparents</h1>
          <p className="mt-3 text-gray-300">Commencez gratuitement, passez au Pro quand vous en avez besoin.</p>
          
          {/* Toggle Mensuel/Annuel */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl p-1.5" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === "monthly" 
                  ? "text-white shadow-md" 
                  : "text-gray-400 hover:text-gray-300"
              }`}
              style={billingCycle === "monthly" ? {
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              } : {}}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                billingCycle === "yearly" 
                  ? "text-white shadow-md" 
                  : "text-gray-400 hover:text-gray-300"
              }`}
              style={billingCycle === "yearly" ? {
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              } : {}}
            >
              Annuel
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ 
                backgroundColor: billingCycle === "yearly" ? "rgba(255,255,255,0.2)" : "#00D084",
                color: billingCycle === "yearly" ? "white" : "#0e0f12"
              }}>
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-0 sm:grid-cols-2 lg:grid-cols-3">
          {/* Gratuit */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <div className="mb-2 text-sm text-gray-400">Gratuit</div>
            <div className="mb-4">
              <span className="text-4xl font-bold">0 €</span>
              <span className="text-gray-400">/mois</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                <span>3 simulations par mois</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                <span>Accès au simulateur URSSAF</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                <span>Calcul des cotisations</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                <span>Projection annuelle</span>
              </li>
            </ul>
            <Link
              href="/signup"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm transition-transform duration-200 hover:scale-[1.02]"
              style={{ border: "1px solid #2b2f36", backgroundColor: "#0e0f12" }}
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Pro (highlighted) */}
          <div
            className="relative rounded-2xl p-6"
            style={{
              backgroundColor: "#161922",
              border: "1px solid rgba(46,108,246,0.55)",
              boxShadow: "0 0 40px rgba(46,108,246,0.18)",
            }}
          >
            <div className="absolute right-4 top-4 rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: "#2E6CF6" }}>
              Recommandé
            </div>
            <div className="mb-2 text-sm font-medium" style={{ color: "#60a5fa" }}>Pro</div>
            <div className="mb-4">
              {billingCycle === "monthly" ? (
                <>
                  <span className="text-4xl font-bold">5,90 €</span>
                  <span className="text-gray-400">/mois</span>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold">56,90 €</span>
                    <span className="text-gray-400">/an</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Soit <span className="text-white font-medium">4,74 €/mois</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                      Économisez 13,90 €
                    </span>
                  </div>
                </>
              )}
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Tout le plan Gratuit</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Simulations illimitées</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Simulateur de TVA</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Gestion des charges déductibles</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Export comptable (Excel/CSV/PDF)</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Sauvegarde en ligne illimitée</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Gestion des factures complète</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Génération PDF de factures</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Envoi de factures par e-mail</span>
              </li>
            </ul>
            {(() => {
              const subscription = getUserSubscription(user);
              
              // Si l'utilisateur est déjà Pro, rediriger vers le compte
              if (subscription.isPro && !subscription.isPremium) {
                return (
                  <a
                    href="/dashboard/compte"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white transition-transform duration-200 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                    }}
                  >
                    Gérer mon abonnement
                  </a>
                );
              }
              
              // Sinon, permettre de souscrire
              return (
                <button
                  onClick={() => handleCheckout("pro")}
                  disabled={loading !== null}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                  }}
                >
                  {loading === "pro" ? "Redirection..." : "Passer à Pro"}
                </button>
              );
            })()}
          </div>

          {/* Premium */}
          <div className="rounded-2xl p-6 relative" style={{ backgroundColor: "#14161b", border: "1px solid rgba(0,208,132,0.3)" }}>
            <div className="absolute right-4 top-4 rounded-md px-2 py-1 text-xs font-medium" style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}>
              Premium
            </div>
            <div className="mb-2 text-sm font-medium text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #00D084, #2E6CF6)" }}>
              Premium
            </div>
            <div className="mb-4">
              {billingCycle === "monthly" ? (
                <>
                  <span className="text-4xl font-bold">9,90 €</span>
                  <span className="text-gray-400">/mois</span>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold">94,90 €</span>
                    <span className="text-gray-400">/an</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Soit <span className="text-white font-medium">7,91 €/mois</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                      Économisez 24,90 €
                    </span>
                  </div>
                </>
              )}
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Tout le plan Pro</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Calendrier fiscal URSSAF intelligent</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Rappels automatiques par e-mail</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Assistant IA personnalisé</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Conseils IA basés sur vos données</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Graphiques d'évolution avancés</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Pré-remplissage automatique URSSAF</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Analyses et insights détaillés</span>
              </li>
              <li className="flex items-start gap-2 text-gray-200">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                <span>Support prioritaire</span>
              </li>
            </ul>
            {(() => {
              const subscription = getUserSubscription(user);
              const hasTrial = subscription.isTrial;
              const hasUsedTrial = user?.user_metadata?.premium_trial_started_at && !hasTrial;
              
              if (hasTrial) {
                const trialEnd = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
                const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                return (
                  <div className="mt-6 space-y-2">
                    <div className="text-center text-xs text-gray-400">
                      Essai gratuit actif • {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
                    </div>
                    <button
                      onClick={() => handleCheckout("premium")}
                      disabled={loading !== null}
                      className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                      }}
                    >
                      {loading === "premium" ? "Redirection..." : "S'abonner maintenant"}
                    </button>
                  </div>
                );
              }
              
              if (hasUsedTrial || subscription.isPremium) {
                // Si l'utilisateur est déjà Premium, afficher un lien vers le compte
                if (subscription.isPremium) {
                  return (
                    <a
                      href="/dashboard/compte"
                      className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white transition-transform duration-200 hover:scale-[1.02]"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                      }}
                    >
                      Gérer mon abonnement
                    </a>
                  );
                }
                
                // Sinon, permettre de souscrire
                return (
                  <button
                    onClick={() => handleCheckout("premium")}
                    disabled={loading !== null}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                    }}
                  >
                    {loading === "premium" ? "Redirection..." : "Passer à Premium"}
                  </button>
                );
              }
              
              return (
                <div className="mt-6 space-y-2">
                  <button
                    onClick={handleStartTrial}
                    disabled={trialLoading || loading !== null}
                    className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                    }}
                  >
                    {trialLoading ? "Chargement..." : "Essai gratuit 3 jours"}
                  </button>
                  <button
                    onClick={() => handleCheckout("premium")}
                    disabled={loading !== null || trialLoading}
                    className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                    style={{
                      border: "1px solid rgba(46,108,246,0.5)",
                      backgroundColor: "transparent",
                    }}
                  >
                    {loading === "premium" ? "Redirection..." : "S'abonner directement"}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    Sans carte bancaire • Annulable à tout moment
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* FAQ Tarifs */}
        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-center text-xl font-semibold">FAQ tarifs</h2>
          <div className="divide-y" style={{ borderColor: "#1f232b" }}>
            <div className="py-4">
              <div className="font-medium">Puis-je annuler à tout moment ?</div>
              <p className="mt-1 text-sm text-gray-400">Oui, vous pouvez annuler votre abonnement quand vous le souhaitez.</p>
            </div>
            <div className="py-4">
              <div className="font-medium">Une carte bancaire est-elle requise pour commencer ?</div>
              <p className="mt-1 text-sm text-gray-400">Non pour le plan Gratuit. Les plans payants passent par Stripe.</p>
            </div>
            <div className="py-4">
              <div className="font-medium">Les prix incluent-ils la TVA ?</div>
              <p className="mt-1 text-sm text-gray-400">Le paiement est géré par Stripe avec la taxe automatique activée.</p>
            </div>
            <div className="py-4">
              <div className="font-medium">Puis-je passer de Gratuit à Pro plus tard ?</div>
              <p className="mt-1 text-sm text-gray-400">Bien sûr, vous pouvez upgrader en un clic depuis cette page.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}