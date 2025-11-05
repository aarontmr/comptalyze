'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';

interface FeaturePreviewProps {
  children?: ReactNode;
  title: string;
  description: string;
  benefits?: string[];
  plan: 'pro' | 'premium';
  ctaText?: string;
  ctaHref?: string;
  showPreview?: boolean;
  previewOpacity?: number;
}

export default function FeaturePreview({ 
  children,
  title,
  description,
  benefits = [],
  plan,
  ctaText,
  ctaHref,
  showPreview = true,
  previewOpacity = 0.3
}: FeaturePreviewProps) {
  const planText = plan === 'premium' ? 'Premium' : 'Pro';
  const planColor = plan === 'premium' ? 'from-purple-500 to-blue-500' : 'from-green-500 to-blue-500';
  const defaultCtaText = ctaText || `Passer au plan ${planText}`;
  const defaultCtaHref = ctaHref || `/pricing?upgrade=${plan}`;

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid #2d3441' }}>
      {/* Preview du contenu en arrière-plan */}
      {children && showPreview && (
        <div 
          className="pointer-events-none select-none"
          style={{ 
            opacity: previewOpacity,
            filter: 'blur(4px)',
          }}
        >
          {children}
        </div>
      )}
      
      {/* Overlay avec informations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 15, 18, 0.97) 0%, rgba(26, 29, 36, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="text-center max-w-md">
          {/* Badge plan */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: `linear-gradient(135deg, ${plan === 'premium' ? '#8B5CF6, #3B82F6' : '#00D084, #2E6CF6'})`,
              boxShadow: '0 4px 20px rgba(46, 108, 246, 0.3)',
            }}
          >
            {plan === 'premium' ? (
              <Sparkles className="w-4 h-4 text-white" />
            ) : (
              <Zap className="w-4 h-4 text-white" />
            )}
            <span className="text-white font-semibold text-sm">
              {planText}
            </span>
          </motion.div>

          {/* Titre */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 mb-6 text-sm sm:text-base"
          >
            {description}
          </motion.p>

          {/* Bénéfices */}
          {benefits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 space-y-2"
            >
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-left justify-center"
                >
                  <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#00D084' }} />
                  <span className="text-gray-300 text-sm">{benefit}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            <Link
              href={defaultCtaHref}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${plan === 'premium' ? '#8B5CF6, #3B82F6' : '#00D084, #2E6CF6'})`,
                boxShadow: '0 8px 32px rgba(46, 108, 246, 0.4)',
              }}
            >
              <Lock className="w-5 h-5" />
              {defaultCtaText}
            </Link>
          </motion.div>

          {/* Prix indicatif */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-gray-400 text-xs sm:text-sm"
          >
            À partir de{' '}
            <span className="font-semibold text-white">
              {plan === 'premium' ? '7,90€' : '3,90€'}/mois
            </span>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}


