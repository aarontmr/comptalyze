"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else if (consent === "accepted") {
      // User has accepted, update consent
      updateConsent(true);
    }
  }, []);

  const updateConsent = (granted: boolean) => {
    if (typeof window === "undefined") return;

    // Update Consent Mode v2 for GA4
    if ((window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied",
        analytics_storage: granted ? "granted" : "denied",
      });
    }

    // Push event to GTM
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "consent_update",
        consent_status: granted ? "granted" : "denied",
      });
    }
  };

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    updateConsent(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    updateConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up"
      style={{
        backgroundColor: "rgba(14, 15, 18, 0.98)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(46, 108, 246, 0.2)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Cookie className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: "#00D084" }} />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                🍪 Cookies et confidentialité
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience, analyser notre trafic et mesurer l'efficacité de nos campagnes publicitaires. 
                En acceptant, vous nous aidez à améliorer Comptalyze.{" "}
                <a
                  href="/legal/politique-de-confidentialite"
                  target="_blank"
                  className="underline hover:text-white transition-colors"
                  style={{ color: "#2E6CF6" }}
                >
                  En savoir plus
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-opacity-80 border"
              style={{
                backgroundColor: "transparent",
                color: "#9ca3af",
                borderColor: "#2d3441",
              }}
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-6 py-3 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 4px 15px rgba(46, 108, 246, 0.3)",
              }}
            >
              Accepter
            </button>
          </div>

          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
