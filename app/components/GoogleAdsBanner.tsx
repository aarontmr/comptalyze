'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoogleAdsBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur vient de Google Ads via UTM
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign');
    
    // Afficher la bannière si c'est Google Ads ou par défaut (pour le moment)
    const shouldShow = utmSource === 'google' || !localStorage.getItem('googleAdsBannerDismissed');
    
    setIsVisible(shouldShow);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('googleAdsBannerDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          data-google-ads-banner
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[60] px-2 sm:px-4 py-2 sm:py-3"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 208, 132, 0.15) 0%, rgba(46, 108, 246, 0.15) 100%)',
            borderBottom: '1px solid rgba(0, 208, 132, 0.3)',
          }}
        >
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#00D084' }} />
              <p className="text-xs sm:text-sm text-white truncate sm:whitespace-normal">
                <span className="font-semibold hidden sm:inline">Nouveau :</span>
                <span className="font-semibold sm:hidden">Nouveau</span>
                <span className="hidden sm:inline"> Découvrez le plan gratuit Comptalyze – idéal pour démarrer votre micro-entreprise.</span>
                <span className="sm:hidden"> Plan gratuit disponible</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <Link
                href="/signup"
                className="px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-300 hover:scale-105 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                }}
              >
                <span className="hidden sm:inline">Essayer gratuitement</span>
                <span className="sm:hidden">Essayer</span>
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                style={{ color: '#9ca3af' }}
                aria-label="Fermer la bannière"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}







