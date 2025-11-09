'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain, Bell, TrendingUp, FileText, Calendar, BarChart3 } from 'lucide-react';
import PlanBadge from './PlanBadge';

interface UpgradeTeaserProps {
  currentPlan: 'free' | 'pro' | 'premium';
}

export default function UpgradeTeaser({ currentPlan }: UpgradeTeaserProps) {
  // Ne rien afficher si l'utilisateur est déjà Premium
  if (currentPlan === 'premium') {
    return null;
  }

  const targetPlan = currentPlan === 'free' ? 'pro' : 'premium';
  const targetPrice = currentPlan === 'free' ? '3,90€' : '7,90€';
  const targetFeatures = currentPlan === 'free' ? [
    {
      icon: FileText,
      title: 'Factures professionnelles',
      description: 'Créez et envoyez des factures PDF en un clic',
      color: '#00D084',
    },
    {
      icon: BarChart3,
      title: 'Statistiques illimitées',
      description: 'Graphiques détaillés et historique complet',
      color: '#2E6CF6',
    },
    {
      icon: Calendar,
      title: 'Calendrier fiscal',
      description: 'Ne manquez plus aucune échéance importante',
      color: '#8B5CF6',
    },
  ] : [
    {
      icon: Brain,
      title: 'ComptaBot - Assistant IA',
      description: 'Conseils en temps réel adaptés à votre activité',
      color: '#8B5CF6',
    },
    {
      icon: Bell,
      title: 'Rappels automatiques',
      description: 'Notifications URSSAF et fiscales par email',
      color: '#F59E0B',
    },
    {
      icon: TrendingUp,
      title: 'Analyses avancées',
      description: 'Prévisions et recommandations IA pour optimiser',
      color: '#00D084',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">
            Découvrez {targetPlan === 'premium' ? 'Premium' : 'Pro'}
          </h2>
          <PlanBadge plan={targetPlan} size="sm" />
        </div>
        <Link
          href={`/pricing?upgrade=${targetPlan}`}
          className="text-sm font-medium hover:underline"
          style={{ color: targetPlan === 'premium' ? '#8B5CF6' : '#00D084' }}
        >
          Voir tous les avantages →
        </Link>
      </div>

      {/* Carte principale avec gradient */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: targetPlan === 'premium' 
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(0, 208, 132, 0.1) 0%, rgba(46, 108, 246, 0.1) 100%)',
          border: '1px solid #2d3441',
        }}
      >
        <div className="p-6">
          {/* Grid des features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {targetFeatures.map((feature, index) => (
              <motion.div
                key={`upgrade-feature-${index}-${feature.title.substring(0, 15)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: 'rgba(26, 29, 36, 0.6)',
                  border: '1px solid rgba(45, 52, 65, 0.5)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{
                      backgroundColor: `${feature.color}15`,
                    }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl"
            style={{
              background: targetPlan === 'premium'
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))'
                : 'linear-gradient(135deg, rgba(0, 208, 132, 0.15), rgba(46, 108, 246, 0.15))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                {targetPlan === 'premium' ? (
                  <Sparkles className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                ) : (
                  <Zap className="w-5 h-5" style={{ color: '#00D084' }} />
                )}
                <span className="font-semibold text-white">
                  Offre de lancement
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Seulement <span className="font-bold text-white">{targetPrice}/mois</span>
                {' '}• Sans engagement
              </p>
            </div>
            <Link
              href={`/pricing?upgrade=${targetPlan}`}
              className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 hover:shadow-xl whitespace-nowrap cursor-pointer"
              style={{
                background: targetPlan === 'premium'
                  ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                  : 'linear-gradient(135deg, #00D084, #2E6CF6)',
                boxShadow: targetPlan === 'premium'
                  ? '0 4px 20px rgba(139, 92, 246, 0.3)'
                  : '0 4px 20px rgba(0, 208, 132, 0.3)',
              }}
            >
              Passer à {targetPlan === 'premium' ? 'Premium' : 'Pro'}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}


