"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CancelPage() {
  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header avec retour */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux tarifs
        </Link>

        {/* Contenu principal */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div
            className="max-w-md w-full mx-auto rounded-2xl p-8 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <span className="text-3xl">❌</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-3">Paiement annulé</h1>
            <p className="text-base text-gray-300 mb-8">
              Vous avez annulé le processus de paiement. Aucun montant n'a été débité de votre compte.
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
                Voir les tarifs
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors hover:bg-opacity-80"
                style={{ border: "1px solid #2b2f36", backgroundColor: "#0e0f12" }}
              >
                Tableau de bord
              </Link>
            </div>
            
            <div className="mt-8 pt-6 border-t" style={{ borderColor: "#1f232b" }}>
              <p className="text-xs text-gray-500">
                Besoin d'aide ? Contactez notre support à support@comptalyze.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

