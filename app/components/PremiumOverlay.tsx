'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { ReactNode } from 'react';

interface PremiumOverlayProps {
  children?: ReactNode;
  message: string;
  ctaText?: string;
  ctaHref?: string;
  requiresPremium?: boolean;
}

export default function PremiumOverlay({ 
  children,
  message, 
  ctaText = "Passer au plan Premium", 
  ctaHref = "/pricing?upgrade=premium",
  requiresPremium = true
}: PremiumOverlayProps) {
  const planText = requiresPremium ? 'Premium' : 'Pro';

  return (
    <div className="relative">
      {children && (
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6 z-10"
        style={{
          backgroundColor: 'rgba(14, 15, 18, 0.95)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: '#00D084' }} />
          <p className="text-gray-300 mb-4 text-lg">
            {message}
          </p>
          <p className="text-gray-400 mb-6 text-sm">
            Fonctionnalité disponible avec le plan{' '}
            <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}>
              {planText}
            </span>
          </p>
          <Link
            href={ctaHref}
            className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 hover:scale-105"
            style={{ background: 'linear-gradient(90deg, #00D084, #2E6CF6)' }}
          >
            {ctaText}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

