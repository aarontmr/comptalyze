'use client';

import { motion } from 'framer-motion';
import { Sparkles, Check, Zap, TrendingUp, Bot, ArrowRight } from 'lucide-react';

interface Step1WelcomeProps {
  onNext: () => void;
}

export default function Step1Welcome({ onNext }: Step1WelcomeProps) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-8 md:p-10"
      style={{
        backgroundColor: '#14161b',
        border: '1px solid rgba(46, 108, 246, 0.3)',
      }}
    >
      {/* Gradient top bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)' }}
      />

      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-6"
          style={{
            background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            boxShadow: '0 0 40px rgba(46, 108, 246, 0.4)',
          }}
        >
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
          Bienvenue dans Premium ! 🎉
        </h1>
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
          Configurons votre compte pour une expérience <span className="text-white font-semibold">sur-mesure</span> et un gain de temps maximal.
        </p>
      </div>

      {/* Bénéfices */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
            <Check className="w-5 h-5" style={{ color: '#00D084' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Calculs ultra-précis</h3>
            <p className="text-xs text-gray-400">ACRE, régime IR, tout est pris en compte automatiquement</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
            <Zap className="w-5 h-5" style={{ color: '#2E6CF6' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Sync automatique</h3>
            <p className="text-xs text-gray-400">Connectez Shopify/Stripe, votre CA se remplit tout seul</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)' }}>
            <Bot className="w-5 h-5" style={{ color: '#00D084' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">ComptaBot personnalisé</h3>
            <p className="text-xs text-gray-400">Conseils fiscaux adaptés à votre situation réelle</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        >
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(46, 108, 246, 0.1)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#2E6CF6' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Pré-remplissage URSSAF</h3>
            <p className="text-xs text-gray-400">Gagnez 10 min chaque mois sur vos déclarations</p>
          </div>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgba(0, 208, 132, 0.05)', border: '1px solid rgba(0, 208, 132, 0.2)' }}>
        <p className="text-sm text-gray-300 text-center">
          ⏱️ <span className="font-medium">3-5 minutes</span> pour une configuration optimale<br />
          <span className="text-xs text-gray-400">Vous pourrez modifier ces paramètres plus tard dans les réglages</span>
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all hover:scale-105 hover:brightness-110 w-full sm:w-auto min-h-[48px]"
          style={{
            background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            boxShadow: '0 4px 20px rgba(46, 108, 246, 0.4)',
          }}
        >
          <span>Commencer la configuration</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <a
          href="/dashboard"
          className="flex items-center justify-center px-6 py-4 rounded-xl text-gray-400 hover:text-white font-medium transition-colors border border-gray-800 hover:border-gray-700 w-full sm:w-auto min-h-[48px]"
        >
          Passer pour le moment
        </a>
      </div>
    </div>
  );
}

