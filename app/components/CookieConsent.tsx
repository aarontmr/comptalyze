/**
 * Bannière de consentement cookies conforme ePrivacy/RGPD
 * Version complète avec personnalisation et expiration 13 mois
 */

'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'comptalyze_cookie_consent';
const COOKIE_CONSENT_EXPIRY = 13 * 30 * 24 * 60 * 60 * 1000; // 13 mois

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  timestamp: number;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    timestamp: Date.now(),
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (stored) {
      try {
        const consent: CookieConsent = JSON.parse(stored);
        const isExpired = Date.now() - consent.timestamp > COOKIE_CONSENT_EXPIRY;
        
        if (isExpired) {
          localStorage.removeItem(COOKIE_CONSENT_KEY);
          setTimeout(() => setShowBanner(true), 1000);
        } else {
          applyConsent(consent);
        }
      } catch {
        setTimeout(() => setShowBanner(true), 1000);
      }
    } else {
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const applyConsent = (consent: CookieConsent) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: consent.analytics ? 'granted' : 'denied',
      });
    }
  };

  const saveConsent = (consent: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    applyConsent(consent);
    setShowBanner(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      timestamp: Date.now(),
    });
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      timestamp: Date.now(),
    });
  };

  const savePreferences = () => {
    saveConsent({ ...preferences, timestamp: Date.now() });
  };

  if (!showBanner) return null;

  return (
    <>
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="w-8 h-8 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    🍪 Nous utilisons des cookies
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies analytiques (anonymisés) pour améliorer votre expérience.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={acceptAll}
                      className="px-6 py-2.5 rounded-lg font-medium text-white transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)' }}
                    >
                      Tout accepter
                    </button>
                    
                    <button
                      onClick={rejectAll}
                      className="px-6 py-2.5 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      Tout refuser
                    </button>
                    
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-2.5 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-600 transition-all flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Personnaliser
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    <Link href="/legal/politique-de-confidentialite" className="underline hover:text-blue-600">
                      Politique de confidentialité
                    </Link>
                    {' • '}
                    <Link href="/legal/cgv" className="underline hover:text-blue-600">
                      CGV
                    </Link>
                  </p>
                </div>
                
                <button onClick={rejectAll} className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Paramètres des cookies
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Cookies nécessaires
                    </h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                    Toujours actifs
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Essentiels pour le fonctionnement du site (authentification, sécurité).
                </p>
              </div>
              
              <div className="mb-6 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Cookies analytiques
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nous aident à améliorer le site (anonymisés).
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={savePreferences}
                  className="flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)' }}
                >
                  Enregistrer
                </button>
                
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

