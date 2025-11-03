"use client";

import Link from "next/link";

const PRICE_ID_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "price_pro_placeholder";
const PRICE_ID_PREMIUM = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM ?? "price_premium_placeholder";

export default function PricingPage() {
  const goCheckout = async (priceId: string) => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, mode: "subscription" }),
    });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
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
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-0 sm:grid-cols-2 lg:grid-cols-3">
          {/* Gratuit */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <div className="mb-2 text-sm text-gray-400">Gratuit</div>
            <div className="mb-4">
              <span className="text-4xl font-bold">0 €</span>
              <span className="text-gray-400">/mois</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>3 simulations / mois</li>
              <li>Accès au simulateur</li>
            </ul>
            <Link
              href="/signup"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm"
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
            <div className="absolute right-4 top-4 rounded-md px-2 py-1 text-xs" style={{ backgroundColor: "#2E6CF6" }}>
              Recommandé
            </div>
            <div className="mb-2 text-sm text-blue-300">Pro</div>
            <div className="mb-4">
              <span className="text-4xl font-bold">5,90 €</span>
              <span className="text-gray-400">/mois</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>Simulations illimitées</li>
              <li>Export PDF</li>
              <li>Sauvegarde en ligne</li>
            </ul>
            <button
              onClick={() => goCheckout(PRICE_ID_PRO)}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white"
              style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}
            >
              Passer au Pro
            </button>
          </div>

          {/* Premium */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <div className="mb-2 text-sm text-gray-400">Premium</div>
            <div className="mb-4">
              <span className="text-4xl font-bold">9,90 €</span>
              <span className="text-gray-400">/mois</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Tout le plan Pro</li>
              <li>Rappels URSSAF automatiques</li>
              <li>Support prioritaire</li>
            </ul>
            <button
              onClick={() => goCheckout(PRICE_ID_PREMIUM)}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white"
              style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}
            >
              Choisir Premium
            </button>
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