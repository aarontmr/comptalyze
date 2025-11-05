'use client';

import { motion } from 'framer-motion';
import { Clock, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface TrialBannerProps {
  trialEndsAt: string;
  plan: 'pro' | 'premium';
}

export default function TrialBanner({ trialEndsAt, plan }: TrialBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(trialEndsAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  const isPremium = plan === 'premium';
  const totalDays = timeLeft.days;
  const isUrgent = totalDays <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{
        background: isPremium
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(0, 208, 132, 0.15) 0%, rgba(46, 108, 246, 0.15) 100%)',
        border: isUrgent 
          ? '2px solid rgba(245, 158, 11, 0.5)'
          : `1px solid ${isPremium ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 208, 132, 0.3)'}`,
        boxShadow: isUrgent
          ? '0 8px 32px rgba(245, 158, 11, 0.2)'
          : `0 4px 20px ${isPremium ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 208, 132, 0.2)'}`,
      }}
    >
      {/* Effet de fond animé */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: isPremium
              ? 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)'
              : 'radial-gradient(circle, #00D084 0%, transparent 70%)',
            top: '-50%',
            left: '-25%',
          }}
        />
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Icône et titre */}
          <div className="flex items-start gap-4 flex-1">
            <motion.div
              animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className="p-3 rounded-xl flex-shrink-0"
              style={{
                background: isPremium
                  ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                  : 'linear-gradient(135deg, #00D084, #2E6CF6)',
                boxShadow: isPremium
                  ? '0 4px 20px rgba(139, 92, 246, 0.4)'
                  : '0 4px 20px rgba(0, 208, 132, 0.4)',
              }}
            >
              {isUrgent ? (
                <Clock className="w-6 h-6 text-white" />
              ) : (
                <Sparkles className="w-6 h-6 text-white" />
              )}
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">
                  Essai gratuit {isPremium ? 'Premium' : 'Pro'}
                </h3>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: isPremium
                      ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                      : 'linear-gradient(135deg, #00D084, #2E6CF6)',
                    color: 'white',
                  }}
                >
                  ACTIF
                </span>
              </div>

              {/* Compte à rebours */}
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-gray-300" />
                <div>
                  {totalDays > 0 ? (
                    <p className={`text-lg font-semibold ${isUrgent ? 'text-yellow-400' : 'text-white'}`}>
                      {totalDays} jour{totalDays > 1 ? 's' : ''} restant{totalDays > 1 ? 's' : ''}
                      {timeLeft.hours > 0 && ` et ${timeLeft.hours}h`}
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-yellow-400">
                      Expire aujourd'hui ! ({timeLeft.hours}h {timeLeft.minutes}min restantes)
                    </p>
                  )}
                  <p className="text-sm text-gray-400">
                    Expire le {new Date(trialEndsAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalDays / 14) * 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: isUrgent
                        ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                        : isPremium
                        ? 'linear-gradient(90deg, #8B5CF6, #3B82F6)'
                        : 'linear-gradient(90deg, #00D084, #2E6CF6)',
                    }}
                  />
                </div>
              </div>

              {isUrgent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg mb-3"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <p className="text-sm text-yellow-300 font-medium">
                    ⚠️ Votre essai se termine bientôt ! Abonnez-vous maintenant pour continuer à profiter de toutes les fonctionnalités {isPremium ? 'Premium' : 'Pro'}.
                  </p>
                </motion.div>
              )}

              {/* Avantages */}
              <p className="text-sm text-gray-300 mb-4">
                Profitez de toutes les fonctionnalités {isPremium ? 'Premium' : 'Pro'} gratuitement pendant votre essai :
              </p>
              <ul className="text-sm text-gray-300 space-y-2 mb-4">
                {isPremium ? (
                  <>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Assistant IA personnalisé
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Rappels URSSAF automatiques
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Statistiques avancées
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      Factures illimitées
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      Export comptable
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      Calculs illimités
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 hover:shadow-xl cursor-pointer whitespace-nowrap"
              style={{
                background: isPremium
                  ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                  : 'linear-gradient(135deg, #00D084, #2E6CF6)',
                boxShadow: isPremium
                  ? '0 4px 20px rgba(139, 92, 246, 0.4)'
                  : '0 4px 20px rgba(0, 208, 132, 0.4)',
              }}
            >
              <Sparkles className="w-5 h-5" />
              S'abonner maintenant
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

