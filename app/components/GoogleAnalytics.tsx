'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-DSQDZHGDLQ';

export default function GoogleAnalytics() {
  useEffect(() => {
    // Vérifier le consentement des cookies
    const consent = localStorage.getItem('cookie-consent');
    
    if (consent === 'accepted') {
      // Initialiser GA seulement si consentement accepté
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
    }
  }, []);

  // Vérifier le consentement avant de charger le script
  if (typeof window !== 'undefined') {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') {
      return null; // Ne charge pas GA si pas de consentement
    }
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
            // Google Ads conversion tracking
            gtag('config', 'AW-17719086824');
          `,
        }}
      />
    </>
  );
}

// Helper pour tracker des événements personnalisés
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Déclarations TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

