'use client';

import { useEffect } from 'react';
import { initializeAnalytics } from '@/lib/analytics';

/**
 * Composant pour initialiser le système d'analytics
 * À placer dans le layout principal
 */
export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialiser l'analytics au montage
    initializeAnalytics();
  }, []);

  return <>{children}</>;
}

