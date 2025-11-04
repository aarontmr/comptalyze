"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import CheckoutForm from "@/app/components/CheckoutForm";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";

// Initialisation de Stripe avec vérification
const initStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  console.log("🔑 Clé publique Stripe:", publishableKey ? "✅ Définie" : "❌ Non définie");
  
  if (!publishableKey) {
    console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n'est pas définie");
    return null;
  }
  
  return loadStripe(publishableKey);
};

const stripePromise = initStripe();

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const plan = params.plan as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [autoRenew, setAutoRenew] = useState(true); // Par défaut activé

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log("❌ Utilisateur non connecté, redirection vers /login");
        router.push("/login");
        return;
      }
      console.log("✅ Utilisateur connecté:", session.user.email);
      setUser(session.user);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const fetchClientSecret = useCallback(async () => {
    if (!user) {
      console.log("❌ Pas d'utilisateur connecté");
      return "";
    }

    console.log("🔄 Création de la session Stripe pour:", { plan, userId: user.id, autoRenew });

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id, autoRenew }),
      });

      const data = await res.json();
      console.log("📥 Réponse API:", data);

      if (!res.ok) {
        console.error("❌ Erreur API:", data);
        setError(data.error || "Une erreur est survenue");
        return "";
      }

      if (!data.clientSecret) {
        console.error("❌ Pas de clientSecret dans la réponse");
        setError("Impossible de créer la session de paiement");
        return "";
      }

      console.log("✅ ClientSecret reçu");
      return data.clientSecret;
    } catch (err) {
      console.error("❌ Erreur lors de l'appel API:", err);
      setError("Impossible de charger le formulaire de paiement");
      return "";
    }
  }, [plan, user, autoRenew]);

  // Configuration de l'apparence Stripe
  const options = { 
    fetchClientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#2E6CF6',
        colorBackground: '#0e0f12',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Poppins, sans-serif',
        borderRadius: '12px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#14161b',
          border: '1px solid #2d3441',
          color: '#ffffff',
        },
        '.Input:focus': {
          border: '1px solid #2E6CF6',
          boxShadow: '0 0 0 2px rgba(46, 108, 246, 0.2)',
        },
        '.Label': {
          color: '#9ca3af',
        },
      },
    },
  };
  
  console.log("⚙️ Options Stripe configurées:", options);

  const planDetails = {
    pro: {
      name: "Pro",
      price: "5,90 €",
      billingPeriod: "mois",
      color: "#2E6CF6",
      features: [
        "Simulations illimitées",
        "Export PDF par e-mail",
        "Sauvegarde en ligne illimitée",
        "Gestion des factures",
        "Génération PDF de factures",
        "Envoi de factures par e-mail",
      ],
    },
    pro_yearly: {
      name: "Pro",
      price: "56,90 €",
      pricePerMonth: "4,74 €",
      billingPeriod: "an",
      savings: "13,90 €",
      color: "#2E6CF6",
      features: [
        "Simulations illimitées",
        "Export PDF par e-mail",
        "Sauvegarde en ligne illimitée",
        "Gestion des factures",
        "Génération PDF de factures",
        "Envoi de factures par e-mail",
      ],
    },
    premium: {
      name: "Premium",
      price: "9,90 €",
      billingPeriod: "mois",
      gradient: "linear-gradient(90deg, #00D084, #2E6CF6)",
      features: [
        "Tout le plan Pro",
        "Rappels URSSAF automatiques",
        "Assistant IA personnalisé",
        "Conseils IA basés sur vos données",
        "Graphiques d'évolution du CA",
        "Pré-remplissage automatique URSSAF",
        "Support prioritaire",
        "Historique complet et analyses",
      ],
    },
    premium_yearly: {
      name: "Premium",
      price: "94,90 €",
      pricePerMonth: "7,91 €",
      billingPeriod: "an",
      savings: "24,90 €",
      gradient: "linear-gradient(90deg, #00D084, #2E6CF6)",
      features: [
        "Tout le plan Pro",
        "Rappels URSSAF automatiques",
        "Assistant IA personnalisé",
        "Conseils IA basés sur vos données",
        "Graphiques d'évolution du CA",
        "Pré-remplissage automatique URSSAF",
        "Support prioritaire",
        "Historique complet et analyses",
      ],
    },
  };

  // Vérifier que le plan est défini
  if (!plan || typeof plan !== 'string') {
    return (
      <main
        className="min-h-screen w-full flex items-center justify-center text-white"
        style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Plan non spécifié</h1>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux tarifs
          </Link>
        </div>
      </main>
    );
  }

  const currentPlan = planDetails[plan as keyof typeof planDetails];

  if (!currentPlan) {
    return (
      <main
        className="min-h-screen w-full flex items-center justify-center text-white"
        style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Plan invalide</h1>
          <p className="text-gray-400 mb-4">Le plan "{plan}" n'existe pas.</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux tarifs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header avec retour */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux tarifs
        </Link>

        {/* Titre principal */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-3">
            Finalisez votre abonnement
          </h1>
          <p className="text-gray-400">
            Paiement sécurisé par Stripe • Annulable à tout moment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Récapitulatif du plan */}
          <div
            className="rounded-2xl p-6 sm:p-8 h-fit"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Récapitulatif</h2>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>

            <div className="mb-6">
              <div
                className="text-lg font-semibold mb-1"
                style={
                  plan.includes("premium")
                    ? {
                        background: currentPlan.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }
                    : { color: currentPlan.color }
                }
              >
                Plan {currentPlan.name}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">{currentPlan.price}</span>
                <span className="text-gray-400">/{currentPlan.billingPeriod}</span>
              </div>
              {currentPlan.pricePerMonth && (
                <div className="text-sm text-gray-400">
                  Soit <span className="text-white font-medium">{currentPlan.pricePerMonth}/mois</span>
                </div>
              )}
              {currentPlan.savings && (
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                    Économisez {currentPlan.savings}/an
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: "#00D084" }}
                  />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-4 space-y-2"
              style={{
                backgroundColor: "#0e0f12",
                border: "1px solid #1f232b",
              }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sous-total</span>
                <span className="text-white">{currentPlan.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">TVA</span>
                <span className="text-white">Calculée automatiquement</span>
              </div>
              {currentPlan.billingPeriod === "an" && (
                <div className="flex justify-between text-sm" style={{ color: "#00D084" }}>
                  <span>Économies annuelles</span>
                  <span>-{currentPlan.savings}</span>
                </div>
              )}
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{currentPlan.price}</span>
              </div>
            </div>

            {/* Option de renouvellement automatique pour les plans annuels */}
            {currentPlan.billingPeriod === "an" && (
              <div 
                className="mt-6 rounded-xl p-4"
                style={{
                  backgroundColor: "#0e0f12",
                  border: "1px solid #1f232b",
                }}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded cursor-pointer"
                    style={{
                      accentColor: "#2E6CF6",
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-1">
                      Renouveler automatiquement tous les ans
                    </div>
                    <div className="text-xs text-gray-400">
                      {autoRenew 
                        ? "Votre abonnement sera automatiquement renouvelé chaque année. Vous pouvez l'annuler à tout moment depuis votre tableau de bord."
                        : "Votre abonnement prendra fin au bout d'un an. Vous devrez le renouveler manuellement si vous souhaitez continuer."
                      }
                    </div>
                  </div>
                </label>
              </div>
            )}

            <div className="mt-6 space-y-2 text-xs text-gray-500">
              <p>✓ Paiement sécurisé avec Stripe</p>
              <p>✓ Annulation possible à tout moment</p>
              {currentPlan.billingPeriod === "mois" && <p>✓ Renouvellement automatique mensuel</p>}
              {currentPlan.billingPeriod === "an" && !autoRenew && <p>✓ Pas de renouvellement automatique</p>}
              {currentPlan.billingPeriod === "an" && autoRenew && <p>✓ Renouvellement automatique annuel</p>}
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Informations de paiement</h2>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="relative w-16 h-16">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                    style={{
                      borderColor: "#2E6CF6 transparent transparent transparent",
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div
                className="rounded-lg p-4 mb-6"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {!loading && !error && user && !stripePromise && (
              <div
                className="rounded-lg p-4 mb-6"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <p className="text-sm text-red-400 font-medium mb-2">Configuration Stripe manquante</p>
                <p className="text-xs text-gray-400">
                  La clé publique Stripe (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) n'est pas configurée.
                  Vérifiez votre fichier .env.local
                </p>
              </div>
            )}

            {!loading && !error && user && stripePromise && (
              <>
                <div className="text-xs text-gray-500 mb-4">
                  🔄 Chargement du formulaire Stripe...
                </div>
                <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                  <CheckoutForm plan={plan} />
                </EmbeddedCheckoutProvider>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

