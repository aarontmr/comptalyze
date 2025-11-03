"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-6 text-6xl">❌</div>
        <h1 className="text-3xl font-semibold mb-4">Paiement annulé</h1>
        <p className="text-lg text-gray-300 mb-8">
          Vous avez annulé le processus de paiement. Aucun montant n'a été débité.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
            }}
          >
            Retour aux tarifs
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors"
            style={{ border: "1px solid #2b2f36", backgroundColor: "#14161b" }}
          >
            Tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}

