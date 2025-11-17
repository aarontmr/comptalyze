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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 208, 132, 0.15) 0%, rgba(46, 108, 246, 0.15) 100%)',
            borderBottom: '1px solid rgba(0, 208, 132, 0.3)',
          }}
        >
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: '#00D084' }} />
              <p className="text-sm text-white">
                <span className="font-semibold">Nouveau :</span> Découvrez le plan gratuit Comptalyze – idéal pour démarrer votre micro-entreprise.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                }}
              >
                Essayer gratuitement
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: '#9ca3af' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


