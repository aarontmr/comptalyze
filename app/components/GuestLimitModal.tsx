"use client";

import { useState } from "react";
import { UserPlus, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { getAttributionQueryString } from "@/lib/attributionUtils";

interface GuestLimitModalProps {
  onClose: () => void;
  remaining: number;
}

export default function GuestLimitModal({ onClose, remaining }: GuestLimitModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Ajouter les paramètres UTM à l'URL de signup
  const signupUrl = `/signup?${getAttributionQueryString()}`;

  if (remaining > 0) {
    // Warning modal
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        onClick={handleClose}
      >
        <div
          className="relative rounded-2xl max-w-md w-full p-8 animate-scale-in"
          style={{
            backgroundColor: "#14161b",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <span className="text-4xl">⚠️</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              Attention : {remaining} simulation{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
            </h2>

            <p className="text-gray-300 mb-6">
              Vous approchez de la limite de simulations gratuites. Créez un compte pour profiter de{" "}
              <strong className="text-white">simulations illimitées</strong> et de toutes les fonctionnalités.
            </p>

            <div className="space-y-3">
              <Link
                href={signupUrl}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  boxShadow: "0 4px 15px rgba(46, 108, 246, 0.3)",
                }}
              >
                <UserPlus className="w-5 h-5" />
                Créer mon compte gratuitement
              </Link>

              <button
                onClick={handleClose}
                className="w-full px-6 py-3 rounded-xl text-gray-300 font-medium transition-colors hover:text-white"
                style={{ border: "1px solid #2d3441" }}
              >
                Continuer ({remaining} restante{remaining > 1 ? "s" : ""})
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fade-out {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          @keyframes scale-in {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          .animate-fade-out {
            animation: fade-out 0.2s ease-out;
          }
          .animate-scale-in {
            animation: scale-in 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // Limit reached modal
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative rounded-2xl max-w-md w-full p-8 animate-scale-in"
        style={{
          background: "linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)",
          border: "1px solid rgba(46,108,246,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Limite atteinte !
          </h2>

          <p className="text-gray-300 mb-6">
            Vous avez utilisé vos <strong className="text-white">3 simulations gratuites</strong>. 
            Créez votre compte pour enregistrer vos calculs et continuer.
          </p>

          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)" }}>
            <p className="text-sm text-gray-300 mb-3">
              <strong className="text-white">En créant un compte, vous débloquez :</strong>
            </p>
            <ul className="text-left text-sm text-gray-300 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Simulations illimitées
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Sauvegarde de vos calculs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Export PDF/Excel
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Factures professionnelles
              </li>
            </ul>
          </div>

          <Link
            href={signupUrl}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold transition-all hover:scale-[1.05]"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              boxShadow: "0 8px 28px rgba(46, 108, 246, 0.35)",
            }}
          >
            <UserPlus className="w-5 h-5" />
            Découvrir les formules Premium
          </Link>

          <p className="mt-4 text-xs text-gray-500">
            Paiement sécurisé • Annulable à tout moment
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-fade-out {
          animation: fade-out 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

