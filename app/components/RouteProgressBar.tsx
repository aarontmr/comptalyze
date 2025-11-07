"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function RouteProgressBar() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Démarrer l'animation de chargement
    setIsLoading(true);

    // Terminer l'animation après un court délai
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ 
            scaleX: [0, 0.3, 0.7, 1],
            opacity: [1, 1, 1, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)',
            transformOrigin: 'left',
            zIndex: 9999,
          }}
        />
      )}
    </AnimatePresence>
  );
}

