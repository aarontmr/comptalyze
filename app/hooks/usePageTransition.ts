"use client";

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

export function usePageTransition() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateWithTransition = useCallback((href: string) => {
    setIsTransitioning(true);
    
    // Petit délai pour permettre l'animation de sortie
    setTimeout(() => {
      router.push(href);
      // Reset après la navigation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 150);
  }, [router]);

  return {
    navigateWithTransition,
    isTransitioning,
  };
}

