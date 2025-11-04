"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import logo from "@/public/logo.png";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntent = searchParams.get("payment_intent");
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Vérifier que nous avons bien un identifiant de paiement
    if (sessionId || paymentIntent) {
      setLoading(false);
      setShowConfetti(true);
      
      // Animation de confettis
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setLoading(false);
    }
  }, [sessionId, paymentIntent]);

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center text-white relative overflow-hidden"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Effet de fond animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ 
            background: "radial-gradient(circle, #00D084 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite"
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ 
            background: "radial-gradient(circle, #2E6CF6 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite 2s"
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
        {loading ? (
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
        ) : (
          <div className="space-y-8">
            {/* Logo en haut */}
            <div className="mb-8">
              <Link href="/" className="inline-block">
                <Image
                  src={logo}
                  alt="Comptalyze"
                  width={180}
                  height={45}
                  className="h-10 w-auto mx-auto"
                  priority
                />
              </Link>
            </div>

            {/* Icône de succès avec animation */}
            <div className="relative inline-block">
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  boxShadow: "0 0 60px rgba(0, 208, 132, 0.4)",
                  animation: showConfetti ? "scaleIn 0.5s ease-out" : "none"
                }}
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              {showConfetti && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-8 -left-8 animate-ping" />
                  <Sparkles className="w-6 h-6 text-blue-400 absolute -top-6 -right-6 animate-ping" style={{ animationDelay: "0.2s" }} />
                  <Sparkles className="w-7 h-7 text-green-400 absolute -bottom-6 -left-10 animate-ping" style={{ animationDelay: "0.4s" }} />
                </div>
              )}
            </div>

            {/* Titre et message */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Paiement réussi !
              </h1>
              <p className="text-xl text-gray-300 mb-2">
                Merci pour votre confiance 🎉
              </p>
              <p className="text-base text-gray-400">
                Votre abonnement a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités.
              </p>
            </div>

            {/* Cartes d'informations */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <div 
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "#14161b",
                  border: "1px solid #1f232b",
                }}
              >
                <div className="text-2xl mb-2">✨</div>
                <div className="text-sm font-semibold text-white mb-1">Accès immédiat</div>
                <div className="text-xs text-gray-400">Profitez de toutes les fonctionnalités</div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "#14161b",
                  border: "1px solid #1f232b",
                }}
              >
                <div className="text-2xl mb-2">📧</div>
                <div className="text-sm font-semibold text-white mb-1">Email de confirmation</div>
                <div className="text-xs text-gray-400">Envoyé dans quelques instants</div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "#14161b",
                  border: "1px solid #1f232b",
                }}
              >
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm font-semibold text-white mb-1">Paiement sécurisé</div>
                <div className="text-xs text-gray-400">Par Stripe</div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-medium text-white transition-all duration-200 hover:scale-[1.02] shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                }}
              >
                Accéder au tableau de bord
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard/compte"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-medium text-gray-300 transition-all duration-200 hover:text-white hover:bg-opacity-80"
                style={{
                  border: "1px solid #2d3441",
                  backgroundColor: "#14161b",
                }}
              >
                Voir mon compte
              </Link>
            </div>

            {/* Note de bas de page */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: "#1f232b" }}>
              <p className="text-sm text-gray-500">
                Une question ? Contactez notre support à{" "}
                <a href="mailto:support@comptalyze.com" className="text-blue-400 hover:text-blue-300">
                  support@comptalyze.com
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.05);
          }
        }
      `}</style>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main
        className="min-h-screen w-full flex items-center justify-center text-white"
        style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
      >
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: "#2E6CF6 transparent transparent transparent",
            }}
          />
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}

