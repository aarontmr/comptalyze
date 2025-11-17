"use client";

import { Settings, Eye, EyeOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPreferences } from '@/app/hooks/useUserPreferences';

export default function QuickSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { preferences, toggleHelperTexts, isLoaded } = useUserPreferences();

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 288; // w-72 = 288px
      const menuHeight = 200; // Estimation
      const padding = 16;
      
      let right = window.innerWidth - rect.right;
      let top = rect.bottom + 8;
      
      // Ajuster si le menu dépasse à droite
      if (right < padding) {
        right = padding;
      }
      
      // Ajuster si le menu dépasse en bas
      if (top + menuHeight > window.innerHeight - padding) {
        top = rect.top - menuHeight - 8;
        // Si ça dépasse en haut aussi, mettre en bas avec scroll
        if (top < padding) {
          top = window.innerHeight - menuHeight - padding;
        }
      }
      
      setPosition({ top, right });
    }
  }, [isOpen]);

  if (!isLoaded) return null;

  return (
    <div className="relative">
      {/* Bouton paramètres */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 w-full"
        title="Paramètres d'affichage"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Affichage</span>
      </button>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer */}
            <div
              className="fixed inset-0 z-[45]"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed w-72 p-4 rounded-xl shadow-2xl z-[50]"
              style={{
                backgroundColor: '#1a1d24',
                border: '1px solid #2d3441',
                top: `${position.top}px`,
                right: `${position.right}px`,
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-white mb-3">
                Préférences d&apos;affichage
              </p>

              {/* Toggle conseils */}
              <div 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/30 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHelperTexts();
                }}
              >
                <div className="flex items-center gap-2">
                  {preferences.showHelperTexts ? (
                    <Eye className="w-4 h-4 text-[#00D084]" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm text-gray-300">Afficher les conseils</p>
                    <p className="text-xs text-gray-500">Explications et exemples</p>
                  </div>
                </div>
                <div
                  className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                  style={{
                    backgroundColor: preferences.showHelperTexts ? '#00D084' : '#374151',
                  }}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{
                      left: preferences.showHelperTexts ? '22px' : '2px',
                    }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500 text-center">
                {preferences.showHelperTexts
                  ? '✨ Mode débutant : Conseils affichés'
                  : '⚡ Mode expert : Interface simplifiée'}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

