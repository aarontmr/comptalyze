'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Afficher la bannière après 1 seconde
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // Recharger la page pour activer GA
    window.location.reload();
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up"
      style={{
        backgroundColor: 'rgba(26, 29, 36, 0.98)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #2d3441',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Texte */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍪</span>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Nous utilisons des cookies
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Nous utilisons des cookies pour analyser le trafic et améliorer votre expérience. 
                  En cliquant sur "Accepter", vous consentez à l'utilisation de Google Analytics.{' '}
                  <Link 
                    href="/legal/politique-de-confidentialite" 
                    className="text-[#00D084] hover:underline"
                  >
                    En savoir plus
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleReject}
              className="px-6 py-2.5 rounded-lg text-white font-medium transition-all hover:bg-gray-700"
              style={{ backgroundColor: '#2d3441' }}
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2.5 rounded-lg text-white font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00D084, #2E6CF6)',
                boxShadow: '0 4px 15px rgba(0, 208, 132, 0.3)',
              }}
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

