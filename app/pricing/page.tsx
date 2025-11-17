"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getUserSubscription } from "@/lib/subscriptionUtils";
import { User } from "@supabase/supabase-js";
import { Check, ArrowLeft } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
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

  const handleCheckout = (plan: "pro" | "premium") => {
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(plan);

    const planWithCycle = billingCycle === "yearly" ? `${plan}_yearly` : plan;
    router.push(`/checkout/${planWithCycle}`);
  };

  // Prix et économies - OFFRE BLACK FRIDAY 🚀
  const pricing = {
    pro: {
      monthly: 3.90,        // Offre Black Friday
      yearly: 37.90,        // ~3,16 €/mois (économie de 20%)
      yearlyMonthly: 3.16,
      savings: 8.90,
      originalMonthly: 9.90 // Prix barré pour afficher la réduction
    },
    premium: {
      monthly: 7.90,        // Offre Black Friday
      yearly: 75.90,        // ~6,33 €/mois (économie de 20%)
      yearlyMonthly: 6.33,
      savings: 18.90,
      originalMonthly: 17.90 // Prix barré pour afficher la réduction
    }
  };

  return (
    <>
      <main
        className="min-h-screen w-full text-white"
        style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
      >
      {/* Hero Section */}
      <section className="px-4 pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Bouton retour */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 group"
            style={{ 
              backgroundColor: "#14161b", 
              border: "1px solid #1f232b",
              color: "#a8b2d1"
            }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        <div className="mx-auto max-w-6xl text-center">
          {/* Badge Offre Black Friday */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full font-medium animate-pulse" style={{ backgroundColor: "rgba(0, 208, 132, 0.15)", color: "#00D084", border: "1px solid rgba(0, 208, 132, 0.3)" }}>
              🚀 Offre Black Friday exclusive - Jusqu'à -34% !
            </span>
          </div>
          
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-6 bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #ffffff 0%, #a8b2d1 100%)" }}>
            Des plans simples et transparents
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Commencez gratuitement sans carte bancaire, puis débloquez toute la puissance de Comptalyze avec Pro ou Premium quand vous êtes prêt.
          </p>
          
          {/* Badge de confiance */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ 
              backgroundColor: "rgba(0, 208, 132, 0.15)", 
              color: "#00D084", 
              border: "1px solid rgba(0, 208, 132, 0.3)" 
            }}>
              <span>✓</span>
              <span>Plan gratuit – sans carte bancaire</span>
            </div>
            <p className="text-sm text-gray-500">
              Créez votre compte en moins de 30 secondes
            </p>
          </div>
          
          {/* Toggle Mensuel/Annuel */}
          <div className="mt-12 inline-flex items-center gap-3 rounded-xl p-2" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                billingCycle === "monthly" 
                  ? "text-white shadow-lg scale-105" 
                  : "text-gray-400 hover:text-gray-300 hover:scale-105 hover:bg-gray-800/30"
              }`}
              style={billingCycle === "monthly" ? {
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              } : {}}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 relative cursor-pointer ${
                billingCycle === "yearly" 
                  ? "text-white shadow-lg scale-105" 
                  : "text-gray-400 hover:text-gray-300 hover:scale-105 hover:bg-gray-800/30"
              }`}
              style={billingCycle === "yearly" ? {
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              } : {}}
            >
              Annuel
              <span className="ml-2 text-xs px-2.5 py-1 rounded-full font-bold" style={{ 
                backgroundColor: billingCycle === "yearly" ? "rgba(255,255,255,0.2)" : "#00D084",
                color: billingCycle === "yearly" ? "white" : "#0e0f12"
              }}>
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="px-4 pb-16">
        <div className="mx-auto mt-0 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3" style={{ gridAutoRows: 'auto', alignItems: 'start' }}>
          {/* Gratuit */}
          <div className="rounded-2xl p-8 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <div className="mb-3">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">Gratuit</div>
              <div className="text-xs font-medium" style={{ color: "#00D084" }}>Free forever</div>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">0 €</span>
                <span className="text-gray-400 text-lg">/mois</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Parfait pour commencer à suivre vos charges URSSAF en quelques clics.</p>
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Fonctionnalités incluses</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                  <span>5 simulations URSSAF sauvegardées / mois</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                  <span>Calcul en temps réel des cotisations et revenu net</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                  <span>Dashboard basique : CA, cotisations, revenu net (30 derniers jours)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                  <span>1 graphique CA (3 derniers mois)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                  <span>1 facture / mois (PDF téléchargeable)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                  <span>Accès à tous les guides et tutoriels</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 space-y-2">
              <Link
                href="/signup?plan=free"
                className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-[1.05] hover:shadow-lg cursor-pointer"
                style={{ 
                  border: "1px solid rgba(0, 208, 132, 0.3)", 
                  backgroundColor: "rgba(0, 208, 132, 0.1)",
                  color: "#00D084"
                }}
              >
                Créer un compte gratuit
              </Link>
              <p className="text-xs text-center text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <span style={{ color: "#00D084" }}>✓</span>
                  Sans carte bancaire
                </span>
                {' • '}
                <span>Création en moins de 30 secondes</span>
              </p>
            </div>
          </div>

          {/* Pro (highlighted) */}
          <div
            className="relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: "#161922",
              border: "2px solid rgba(46,108,246,0.6)",
              boxShadow: "0 8px 40px rgba(46,108,246,0.25)",
            }}
          >
            <div className="absolute right-6 top-6 flex gap-2">
              <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                🚀 Offre Black Friday
              </span>
              <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: "#2E6CF6" }}>
                Recommandé
              </span>
            </div>
            <div className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: "#60a5fa" }}>Pro</div>
            <div className="mb-6">
              {billingCycle === "monthly" ? (
                <>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-5xl font-bold">{pricing.pro.monthly.toFixed(2)} €</span>
                    <span className="text-2xl text-gray-500 line-through">{pricing.pro.originalMonthly?.toFixed(2)} €</span>
                  </div>
                  <div className="text-gray-400 text-lg mb-2">/mois</div>
                  <div className="text-sm font-semibold" style={{ color: "#00D084" }}>
                    💰 Économisez 6 € par mois !
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">{pricing.pro.yearly.toFixed(2)} €</span>
                    <span className="text-gray-400 text-lg">/an</span>
                  </div>
                  <div className="text-base text-gray-400">
                    Soit <span className="text-white font-bold">{pricing.pro.yearlyMonthly.toFixed(2)} €/mois</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                      💰 Économisez {pricing.pro.savings.toFixed(2)} €
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Gestion complète</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <span><strong>Enregistrements illimités</strong></span>
                </li>
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <span>Calcul TVA automatique</span>
                </li>
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <span>Gestion charges déductibles</span>
                </li>
              </ul>
              
              <div className="text-xs font-semibold text-gray-400 mt-5 mb-3 uppercase tracking-wider">Documents & Exports</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <span>Factures complètes au format PDF</span>
                </li>
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <span>Export CSV/PDF (journal simple)</span>
                </li>
              </ul>
            </div>
            {(() => {
              const subscription = getUserSubscription(user);
              const hasStripeSubscription = user?.user_metadata?.stripe_subscription_id;
              const isPro = subscription.plan === "pro" || subscription.isPro;
              const isPremium = subscription.plan === "premium" || subscription.isPremium;
              
              if (isPremium) {
                return (
                  <div className="mt-6 space-y-2">
                    <div className="text-center text-xs font-medium px-3 py-2 rounded-lg" style={{ 
                      backgroundColor: "rgba(0, 208, 132, 0.1)", 
                      color: "#00D084",
                      border: "1px solid rgba(0, 208, 132, 0.3)"
                    }}>
                      ✨ Vous avez déjà Premium
                    </div>
                    <a
                      href="/dashboard/compte"
                      className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-all duration-300 hover:scale-[1.05] hover:bg-gray-800/30 hover:shadow-lg cursor-pointer"
                      style={{
                        border: "1px solid rgba(46,108,246,0.5)",
                        backgroundColor: "transparent",
                      }}
                    >
                      Gérer mon abonnement
                    </a>
                  </div>
                );
              }
              
              if (isPro && hasStripeSubscription) {
                return (
                  <a
                    href="/dashboard/compte"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white transition-all duration-300 hover:scale-[1.08] hover:brightness-110 hover:shadow-2xl cursor-pointer active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                    }}
                  >
                    Gérer mon abonnement
                  </a>
                );
              }
              
              if (isPro) {
                return (
                  <button
                    onClick={() => handleCheckout("pro")}
                    disabled={loading !== null}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.08] hover:brightness-110 hover:shadow-2xl cursor-pointer active:scale-95 disabled:hover:scale-100 disabled:hover:brightness-100"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                    }}
                  >
                    {loading === "pro" ? "Redirection..." : "Passer à Pro"}
                  </button>
                );
              }
              
              return (
                <button
                  onClick={() => handleCheckout("pro")}
                  disabled={loading !== null}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.08] hover:brightness-110 hover:shadow-2xl cursor-pointer active:scale-95 disabled:hover:scale-100 disabled:hover:brightness-100"
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
          <div className="rounded-2xl p-8 relative flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl" style={{ backgroundColor: "#14161b", border: "1px solid rgba(0,208,132,0.4)" }}>
            <div className="absolute right-6 top-6 flex gap-2">
              <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                🚀 Offre Black Friday
              </span>
              <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}>
                Premium
              </span>
            </div>
            <div className="mb-3 text-sm font-bold uppercase tracking-wide text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #00D084, #2E6CF6)" }}>
              Premium
            </div>
            <div className="mb-6">
              {billingCycle === "monthly" ? (
                <>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-5xl font-bold">{pricing.premium.monthly.toFixed(2)} €</span>
                    <span className="text-2xl text-gray-500 line-through">{pricing.premium.originalMonthly?.toFixed(2)} €</span>
                  </div>
                  <div className="text-gray-400 text-lg mb-2">/mois</div>
                  <div className="text-sm font-semibold" style={{ color: "#00D084" }}>
                    💰 Économisez 10 € par mois !
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">{pricing.premium.yearly.toFixed(2)} €</span>
                    <span className="text-gray-400 text-lg">/an</span>
                  </div>
                  <div className="text-base text-gray-400">
                    Soit <span className="text-white font-bold">{pricing.premium.yearlyMonthly.toFixed(2)} €/mois</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                      💰 Économisez {pricing.premium.savings.toFixed(2)} €
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Tout Pro +</div>
              
              {/* ROI Box */}
              <div className="mb-5 p-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(0, 208, 132, 0.1), rgba(46, 108, 246, 0.1))", border: "1px solid rgba(0, 208, 132, 0.3)" }}>
                <div className="text-xs font-bold text-white mb-2">💰 ÉCONOMISEZ 120H/AN</div>
                <div className="text-xs text-gray-300">
                  Valeur : <span className="text-white font-bold">3 000€/an</span> pour seulement <span className="text-[#00D084] font-bold">94,80€/an</span>
                </div>
              </div>
              
              <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">🤖 Automatisation Totale</div>
              <ul className="space-y-3 text-sm mb-5">
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <strong>Import automatique Shopify/Stripe</strong>
                    <div className="text-xs text-gray-400 mt-0.5">CA mensuel importé + email récap. Économie : 10h/mois</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <strong>Pré-remplissage URSSAF en 1 clic</strong>
                    <div className="text-xs text-gray-400 mt-0.5">Plus de saisie manuelle. Économie : 15 min/déclaration</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <strong>Calendrier fiscal intelligent</strong>
                    <div className="text-xs text-gray-400 mt-0.5">Rappels auto. Plus jamais de retard ni de pénalités</div>
                  </div>
                </li>
              </ul>
              
              <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">🧠 Intelligence Artificielle</div>
              <ul className="space-y-3 text-sm mb-5">
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <strong>ComptaBot personnalisé</strong>
                    <div className="text-xs text-gray-400 mt-0.5">Expert-comptable IA 24/7. Équivaut à 100€/h de conseil</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <strong>Optimisations fiscales sur-mesure</strong>
                    <div className="text-xs text-gray-400 mt-0.5">ACRE, IR, déductions... Peut vous faire économiser 1000€+/an</div>
                  </div>
                </li>
              </ul>
              
              <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">📊 Analytics Pro</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <strong>Tableaux de bord avancés + alertes</strong>
                    <div className="text-xs text-gray-400 mt-0.5">Anticipez vos seuils TVA, CFE, plafonds CA</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-gray-200">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <strong>Export comptable professionnel</strong>
                    <div className="text-xs text-gray-400 mt-0.5">Compatible expert-comptable. Économie : 200€/an de saisie</div>
                  </div>
                </li>
              </ul>
            </div>
            {(() => {
              const subscription = getUserSubscription(user);
              const hasStripeSubscription = user?.user_metadata?.stripe_subscription_id;
              const isPremium = subscription.plan === "premium" || subscription.isPremium;
              const isPro = subscription.plan === "pro" || subscription.isPro;
              
              // CAS 1 : Utilisateur Premium payant (avec abonnement Stripe actif)
              if (subscription.isPremium && hasStripeSubscription) {
                return (
                  <a
                    href="/dashboard/compte"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white transition-all duration-300 hover:scale-[1.08] hover:brightness-110 hover:shadow-2xl cursor-pointer active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                    }}
                  >
                    Gérer mon abonnement
                  </a>
                );
              }
              
              if (isPremium) {
                return (
                  <div className="mt-6 space-y-2">
                    <div className="text-center text-xs font-medium px-3 py-2 rounded-lg" style={{ 
                      backgroundColor: "rgba(0, 208, 132, 0.1)", 
                      color: "#00D084",
                      border: "1px solid rgba(0, 208, 132, 0.3)"
                    }}>
                      ✨ Vous profitez déjà de Premium
                    </div>
                    <a
                      href="/dashboard/compte"
                      className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-all duration-300 hover:scale-[1.05] hover:bg-gray-800/30 hover:shadow-lg cursor-pointer"
                      style={{
                        border: "1px solid rgba(46,108,246,0.5)",
                        backgroundColor: "transparent",
                      }}
                    >
                      Gérer mon abonnement
                    </a>
                  </div>
                );
              }
              
              const ctaLabel = isPro ? "Passer à Premium" : "S'abonner maintenant";
              
              return (
                <button
                  onClick={() => handleCheckout("premium")}
                  disabled={loading !== null}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.08] hover:brightness-110 hover:shadow-2xl cursor-pointer active:scale-95 disabled:hover:scale-100 disabled:hover:brightness-100"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                  }}
                >
                  {loading === "premium" ? "Redirection..." : ctaLabel}
                </button>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Tableau de comparaison des plans */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-3">Comparer les plans</h2>
            <p className="text-sm sm:text-base text-gray-400">
              Choisissez le niveau qui correspond à votre activité de micro-entrepreneur.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse" style={{ borderColor: "#1f232b" }}>
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-400"></th>
                  <th className="px-4 py-3 text-gray-200 font-semibold">Free</th>
                  <th className="px-4 py-3 text-gray-200 font-semibold">Pro</th>
                  <th className="px-4 py-3 text-gray-200 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Simulations URSSAF", free: "5 / mois", pro: "Illimitées", premium: "Illimitées" },
                  { label: "Pré-remplissage URSSAF", free: "—", pro: "—", premium: "✔" },
                  { label: "Dashboard basique (30 jours)", free: "✔", pro: "Illimité", premium: "Illimité" },
                  { label: "Graphiques CA (3 mois)", free: "✔", pro: "Illimité", premium: "Illimité" },
                  { label: "Factures PDF", free: "1 / mois", pro: "Illimitées", premium: "Illimitées" },
                  { label: "Envoi factures par email", free: "—", pro: "✔", premium: "✔" },
                  { label: "Personnalisation factures (logo/couleurs)", free: "—", pro: "✔", premium: "✔" },
                  { label: "Simulateur TVA", free: "—", pro: "✔", premium: "✔" },
                  { label: "Exports comptables (Excel/CSV/PDF)", free: "—", pro: "✔", premium: "✔" },
                  { label: "Statistiques avancées & IA", free: "—", pro: "—", premium: "✔" },
                  { label: "Calendrier fiscal intelligent", free: "—", pro: "—", premium: "✔" },
                  { label: "ComptaBot (assistant IA)", free: "—", pro: "—", premium: "✔" },
                  { label: "Alertes & rappels automatiques", free: "—", pro: "—", premium: "✔" },
                ].map((row) => (
                  <tr key={row.label} className="border-t" style={{ borderColor: "#1f232b" }}>
                    <td className="px-4 py-3 text-gray-300">{row.label}</td>
                    <td className="px-4 py-3 text-gray-200">{row.free}</td>
                    <td className="px-4 py-3 text-gray-200">{row.pro}</td>
                    <td className="px-4 py-3 text-gray-200">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Séparateur visuel */}
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #1f232b 50%, transparent)" }}></div>
        </div>
      </div>

      {/* Section Fonctionnalités */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(46,108,246,0.15)", color: "#60a5fa", border: "1px solid rgba(46,108,246,0.3)" }}>
                Découvrez
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Fonctionnalités principales</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Tous les outils dont vous avez besoin pour gérer votre micro-entreprise en toute simplicité
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Factures PDF */}
            <div 
              className="rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: "#14161b", 
                border: "1px solid #1f232b"
              }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Document principal */}
                  <rect x="25" y="15" width="70" height="90" rx="4" fill="#1a1d24" stroke="#2E6CF6" strokeWidth="2"/>
                  
                  {/* En-tête facture */}
                  <rect x="32" y="22" width="56" height="8" rx="2" fill="#2E6CF6" opacity="0.3"/>
                  
                  {/* Lignes de texte */}
                  <rect x="32" y="35" width="40" height="3" rx="1.5" fill="#60a5fa" opacity="0.6"/>
                  <rect x="32" y="42" width="35" height="3" rx="1.5" fill="#60a5fa" opacity="0.4"/>
                  
                  {/* Tableau lignes */}
                  <rect x="32" y="52" width="56" height="2" fill="#2E6CF6" opacity="0.2"/>
                  <rect x="32" y="58" width="45" height="2" rx="1" fill="#60a5fa" opacity="0.3"/>
                  <rect x="32" y="63" width="50" height="2" rx="1" fill="#60a5fa" opacity="0.3"/>
                  <rect x="32" y="68" width="42" height="2" rx="1" fill="#60a5fa" opacity="0.3"/>
                  
                  {/* Total */}
                  <rect x="32" y="78" width="56" height="10" rx="2" fill="#2E6CF6" opacity="0.2"/>
                  <rect x="60" y="81" width="25" height="4" rx="2" fill="#2E6CF6"/>
                  
                  {/* Effet PDF */}
                  <path d="M85 95 L95 95 L95 105" stroke="#00D084" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="90" cy="100" r="8" fill="#00D084" opacity="0.2"/>
                  <text x="90" y="103" fontSize="8" fill="#00D084" textAnchor="middle" fontWeight="bold">PDF</text>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Factures professionnelles</h3>
              <p className="text-sm text-gray-400 text-center">
                Créez et envoyez des factures conformes aux normes légales en quelques clics. Export PDF automatique avec votre branding.
              </p>
            </div>

            {/* Calcul TVA */}
            <div 
              className="rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: "#14161b", 
                border: "1px solid #1f232b"
              }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Calculatrice */}
                  <rect x="30" y="20" width="60" height="80" rx="6" fill="#1a1d24" stroke="#00D084" strokeWidth="2"/>
                  
                  {/* Écran */}
                  <rect x="37" y="27" width="46" height="18" rx="3" fill="#0a0b0e"/>
                  <text x="80" y="40" fontSize="10" fill="#00D084" textAnchor="end" fontWeight="bold">20%</text>
                  
                  {/* Boutons */}
                  <circle cx="45" cy="55" r="5" fill="#00D084" opacity="0.3"/>
                  <circle cx="60" cy="55" r="5" fill="#00D084" opacity="0.3"/>
                  <circle cx="75" cy="55" r="5" fill="#00D084" opacity="0.3"/>
                  
                  <circle cx="45" cy="67" r="5" fill="#00D084" opacity="0.3"/>
                  <circle cx="60" cy="67" r="5" fill="#00D084" opacity="0.3"/>
                  <circle cx="75" cy="67" r="5" fill="#00D084" opacity="0.3"/>
                  
                  <circle cx="45" cy="79" r="5" fill="#00D084" opacity="0.3"/>
                  <circle cx="60" cy="79" r="5" fill="#00D084" opacity="0.3"/>
                  <circle cx="75" cy="79" r="5" fill="#00D084" opacity="0.3"/>
                  
                  {/* Bouton égal (grand) */}
                  <rect x="38" y="88" width="44" height="8" rx="4" fill="#00D084"/>
                  
                  {/* Symboles TVA */}
                  <text x="60" y="93" fontSize="6" fill="#0a0b0e" textAnchor="middle" fontWeight="bold">=</text>
                  
                  {/* Effet brillance */}
                  <path d="M35 25 Q40 30 35 35" stroke="#00D084" strokeWidth="1" opacity="0.3" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Gestion TVA automatique</h3>
              <p className="text-sm text-gray-400 text-center">
                Calcul automatique de la TVA collectée et déductible. Préparez vos déclarations en toute sérénité avec un suivi en temps réel.
              </p>
            </div>

            {/* Simulateur URSSAF */}
            <div 
              className="rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: "#14161b", 
                border: "1px solid #1f232b"
              }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Graphique en barre */}
                  <line x1="25" y1="85" x2="95" y2="85" stroke="#8B5CF6" strokeWidth="2"/>
                  <line x1="25" y1="85" x2="25" y2="25" stroke="#8B5CF6" strokeWidth="2"/>
                  
                  {/* Barres croissantes */}
                  <rect x="32" y="70" width="10" height="15" rx="2" fill="#8B5CF6" opacity="0.4"/>
                  <rect x="47" y="60" width="10" height="25" rx="2" fill="#8B5CF6" opacity="0.5"/>
                  <rect x="62" y="45" width="10" height="40" rx="2" fill="#8B5CF6" opacity="0.7"/>
                  <rect x="77" y="35" width="10" height="50" rx="2" fill="#8B5CF6"/>
                  
                  {/* Ligne de tendance */}
                  <path d="M32 75 L47 65 L62 50 L82 35" stroke="#a78bfa" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round"/>
                  
                  {/* Points sur la ligne */}
                  <circle cx="37" cy="75" r="3" fill="#c4b5fd"/>
                  <circle cx="52" cy="65" r="3" fill="#c4b5fd"/>
                  <circle cx="67" cy="50" r="3" fill="#c4b5fd"/>
                  <circle cx="82" cy="35" r="3" fill="#c4b5fd"/>
                  
                  {/* Flèche montante */}
                  <path d="M88 40 L93 30 L98 40" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="93" y1="30" x2="93" y2="50" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
                  
                  {/* Symbole € */}
                  <text x="60" y="20" fontSize="14" fill="#8B5CF6" textAnchor="middle" fontWeight="bold">€</text>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Simulateur URSSAF</h3>
              <p className="text-sm text-gray-400 text-center">
                Estimez vos cotisations sociales en temps réel et projetez votre activité. Pré-remplissage automatique des déclarations (Premium).
              </p>
            </div>

            {/* Export comptable */}
            <div 
              className="rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: "#14161b", 
                border: "1px solid #1f232b"
              }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Document arrière */}
                  <rect x="42" y="30" width="50" height="60" rx="4" fill="#1a1d24" stroke="#EAB308" strokeWidth="1.5" opacity="0.5"/>
                  
                  {/* Document avant */}
                  <rect x="28" y="35" width="50" height="60" rx="4" fill="#1a1d24" stroke="#EAB308" strokeWidth="2"/>
                  
                  {/* Icône fichier */}
                  <rect x="35" y="42" width="36" height="4" rx="2" fill="#EAB308" opacity="0.4"/>
                  <rect x="35" y="50" width="30" height="3" rx="1.5" fill="#fbbf24" opacity="0.3"/>
                  <rect x="35" y="57" width="32" height="3" rx="1.5" fill="#fbbf24" opacity="0.3"/>
                  <rect x="35" y="64" width="28" height="3" rx="1.5" fill="#fbbf24" opacity="0.3"/>
                  
                  {/* Excel/CSV badges */}
                  <rect x="35" y="72" width="14" height="8" rx="2" fill="#EAB308" opacity="0.3"/>
                  <text x="42" y="78" fontSize="5" fill="#EAB308" textAnchor="middle" fontWeight="bold">XLS</text>
                  
                  <rect x="52" y="72" width="14" height="8" rx="2" fill="#EAB308" opacity="0.3"/>
                  <text x="59" y="78" fontSize="5" fill="#EAB308" textAnchor="middle" fontWeight="bold">CSV</text>
                  
                  {/* Flèche de téléchargement */}
                  <circle cx="80" cy="75" r="15" fill="#EAB308" opacity="0.2"/>
                  <path d="M80 65 L80 82" stroke="#EAB308" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M73 75 L80 82 L87 75" stroke="#EAB308" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  
                  {/* Effet de mouvement */}
                  <path d="M75 90 Q80 88 85 90" stroke="#fbbf24" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Exports comptables</h3>
              <p className="text-sm text-gray-400 text-center">
                Exportez vos données en CSV ou Excel. Journal comptable enrichi pour votre expert-comptable ou l'administration fiscale.
              </p>
            </div>

            {/* Assistant IA */}
            <div 
              className="rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: "#14161b", 
                border: "1px solid #1f232b"
              }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Tête du robot */}
                  <rect x="40" y="35" width="40" height="45" rx="8" fill="#1a1d24" stroke="url(#gradient1)" strokeWidth="2.5"/>
                  
                  {/* Antenne */}
                  <line x1="60" y1="35" x2="60" y2="25" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="60" cy="22" r="3" fill="#00D084"/>
                  
                  {/* Yeux */}
                  <circle cx="50" cy="50" r="5" fill="#00D084" opacity="0.3"/>
                  <circle cx="50" cy="50" r="3" fill="#00D084"/>
                  
                  <circle cx="70" cy="50" r="5" fill="#2E6CF6" opacity="0.3"/>
                  <circle cx="70" cy="50" r="3" fill="#2E6CF6"/>
                  
                  {/* Bouche souriante */}
                  <path d="M48 65 Q60 72 72 65" stroke="url(#gradient1)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  
                  {/* Corps */}
                  <rect x="45" y="80" width="30" height="25" rx="6" fill="#1a1d24" stroke="url(#gradient1)" strokeWidth="2"/>
                  
                  {/* Bras gauche */}
                  <rect x="32" y="85" width="10" height="18" rx="5" fill="url(#gradient1)" opacity="0.6"/>
                  
                  {/* Bras droit */}
                  <rect x="78" y="85" width="10" height="18" rx="5" fill="url(#gradient1)" opacity="0.6"/>
                  
                  {/* Détails corps */}
                  <circle cx="55" cy="90" r="2" fill="#00D084" opacity="0.5"/>
                  <circle cx="65" cy="90" r="2" fill="#2E6CF6" opacity="0.5"/>
                  <rect x="52" y="96" width="16" height="3" rx="1.5" fill="url(#gradient1)" opacity="0.3"/>
                  
                  {/* Bulle de dialogue */}
                  <ellipse cx="88" cy="45" rx="18" ry="15" fill="#00D084" opacity="0.1" stroke="#00D084" strokeWidth="1.5"/>
                  <text x="88" y="49" fontSize="14" fill="#00D084" textAnchor="middle">?</text>
                  <path d="M75 48 L80 45" stroke="#00D084" strokeWidth="1.5" fill="none"/>
                  
                  {/* Dégradé */}
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00D084"/>
                      <stop offset="100%" stopColor="#2E6CF6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">
                Assistant IA ComptaBot
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2E6CF6", color: "white" }}>
                  Premium
                </span>
              </h3>
              <p className="text-sm text-gray-400 text-center">
                Posez vos questions comptables et fiscales à votre assistant IA personnalisé. Conseils adaptés à votre situation 24/7.
              </p>
            </div>

            {/* Alertes & Rappels */}
            <div 
              className="rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ 
                backgroundColor: "#14161b", 
                border: "1px solid #1f232b"
              }}
            >
              <div className="mb-4 flex justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grande cloche */}
                  <path d="M45 50 Q45 35 60 35 Q75 35 75 50 L75 70 Q75 75 70 78 L50 78 Q45 75 45 70 Z" fill="#1a1d24" stroke="#EF4444" strokeWidth="2.5"/>
                  
                  {/* Haut de la cloche */}
                  <rect x="57" y="28" width="6" height="8" rx="2" fill="#EF4444"/>
                  <circle cx="60" cy="27" r="3" fill="#fca5a5"/>
                  
                  {/* Battant */}
                  <circle cx="60" cy="78" r="4" fill="#EF4444"/>
                  <line x1="60" y1="74" x2="60" y2="70" stroke="#EF4444" strokeWidth="2"/>
                  
                  {/* Décoration intérieure */}
                  <path d="M50 55 Q60 58 70 55" stroke="#EF4444" strokeWidth="1" opacity="0.3" fill="none"/>
                  
                  {/* Ondes sonores gauche */}
                  <path d="M35 50 Q30 50 28 48" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
                  <path d="M32 58 Q27 60 24 58" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
                  <path d="M30 42 Q25 40 22 40" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
                  
                  {/* Ondes sonores droite */}
                  <path d="M85 50 Q90 50 92 48" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
                  <path d="M88 58 Q93 60 96 58" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
                  <path d="M90 42 Q95 40 98 40" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
                  
                  {/* Notifications badges */}
                  <circle cx="80" cy="40" r="10" fill="#EF4444"/>
                  <text x="80" y="44" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">3</text>
                  
                  {/* Calendrier */}
                  <rect x="45" y="85" width="30" height="25" rx="3" fill="#1a1d24" stroke="#EF4444" strokeWidth="2" opacity="0.8"/>
                  <rect x="45" y="85" width="30" height="7" rx="3" fill="#EF4444"/>
                  <line x1="52" y1="85" x2="52" y2="82" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="68" y1="85" x2="68" y2="82" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                  
                  {/* Date sur calendrier */}
                  <text x="60" y="103" fontSize="10" fill="#fca5a5" textAnchor="middle" fontWeight="bold">15</text>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">
                Alertes intelligentes
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2E6CF6", color: "white" }}>
                  Premium
                </span>
              </h3>
              <p className="text-sm text-gray-400 text-center">
                Ne ratez plus aucune échéance fiscale. Rappels automatiques pour vos déclarations, paiements et seuils de franchise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Séparateur visuel */}
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #1f232b 50%, transparent)" }}></div>
        </div>
      </div>

      {/* FAQ Tarifs */}
      <section className="px-4 py-20 pb-32">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(0,208,132,0.15)", color: "#00D084", border: "1px solid rgba(0,208,132,0.3)" }}>
                Questions fréquentes
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">FAQ tarifs</h2>
            <p className="text-lg text-gray-400">
              Tout ce que vous devez savoir sur nos tarifs et abonnements
            </p>
          </div>
          <div className="divide-y rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161b", borderColor: "#1f232b", border: "1px solid #1f232b" }}>
            <div className="px-8 py-6 hover:bg-gray-900/30 transition-colors">
              <div className="font-bold text-lg mb-2 flex items-center gap-2">
                <span style={{ color: "#00D084" }}>•</span>
                Puis-je annuler à tout moment ?
              </div>
              <p className="text-base text-gray-400 pl-5">Oui, vous pouvez annuler votre abonnement quand vous le souhaitez, sans frais ni engagement.</p>
            </div>
            <div className="px-8 py-6 hover:bg-gray-900/30 transition-colors">
              <div className="font-bold text-lg mb-2 flex items-center gap-2">
                <span style={{ color: "#00D084" }}>•</span>
                Une carte bancaire est-elle requise pour commencer ?
              </div>
              <p className="text-base text-gray-400 pl-5">Non pour le plan Free. Les plans payants nécessitent un paiement sécurisé via Stripe.</p>
            </div>
            <div className="px-8 py-6 hover:bg-gray-900/30 transition-colors">
              <div className="font-bold text-lg mb-2 flex items-center gap-2">
                <span style={{ color: "#00D084" }}>•</span>
                Les prix incluent-ils la TVA ?
              </div>
              <p className="text-base text-gray-400 pl-5">Le paiement est géré par Stripe avec la taxe automatique activée selon votre pays de résidence.</p>
            </div>
            <div className="px-8 py-6 hover:bg-gray-900/30 transition-colors">
              <div className="font-bold text-lg mb-2 flex items-center gap-2">
                <span style={{ color: "#00D084" }}>•</span>
                Puis-je passer de Free à Pro plus tard ?
              </div>
              <p className="text-base text-gray-400 pl-5">Bien sûr, vous pouvez upgrader en un clic depuis cette page à tout moment.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}