'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'urssaf' | 'invoice';
  currentCount: number;
  limit: number;
}

export default function LimitReachedModal({
  isOpen,
  onClose,
  limitType,
  currentCount,
  limit,
}: LimitReachedModalProps) {
  if (!isOpen) return null;

  const isUrssaf = limitType === 'urssaf';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: '#16181d',
                border: '1px solid rgba(0, 208, 132, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                style={{ color: '#9ca3af' }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className="p-4 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}
                >
                  {isUrssaf ? (
                    <TrendingUp className="w-8 h-8" style={{ color: '#00D084' }} />
                  ) : (
                    <Zap className="w-8 h-8" style={{ color: '#00D084' }} />
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Limite du plan gratuit atteinte
              </h2>

              {/* Description */}
              <p className="text-gray-400 text-center mb-6">
                {isUrssaf
                  ? `Vous avez utilisé vos ${limit} simulations URSSAF ce mois. Passez à Pro pour des enregistrements illimités !`
                  : `Vous avez créé votre ${limit} facture${limit > 1 ? 's' : ''} ce mois. Passez à Pro pour créer des factures illimitées !`}
              </p>

              {/* Benefits */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.05)' }}>
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00D084' }} />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">
                      {isUrssaf ? 'Enregistrements illimités' : 'Factures illimitées'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {isUrssaf
                        ? 'Plus de limite mensuelle, enregistrez autant que vous voulez'
                        : 'Créez autant de factures que nécessaire chaque mois'}
                    </div>
                  </div>
                </div>

                {isUrssaf && (
                  <>
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(46, 108, 246, 0.05)' }}>
                      <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2E6CF6' }} />
                      <div>
                        <div className="text-sm font-semibold text-white mb-1">
                          Pré-remplissage URSSAF automatique
                        </div>
                        <div className="text-xs text-gray-400">
                          Remplissez vos déclarations en 1 clic (Premium)
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 208, 132, 0.05)' }}>
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00D084' }} />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">
                      Statistiques avancées & IA
                    </div>
                    <div className="text-xs text-gray-400">
                      Analyses détaillées, graphiques complets et conseils personnalisés
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-2">
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="block w-full text-center rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                    boxShadow: '0 8px 28px rgba(46,108,246,0.35)',
                  }}
                >
                  Voir les offres Pro & Premium
                </Link>
                <button
                  onClick={onClose}
                  className="block w-full text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800/50"
                  style={{ color: '#9ca3af' }}
                >
                  Plus tard
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}



