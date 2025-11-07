"use client";

import { Shield, Lock, CheckCircle2, Award, Zap, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "100% Conforme",
      subtitle: "Normes URSSAF & fiscales",
      color: "#00D084"
    },
    {
      icon: Lock,
      title: "Données sécurisées",
      subtitle: "Hébergement France RGPD",
      color: "#2E6CF6"
    },
    {
      icon: CheckCircle2,
      title: "Paiement sécurisé",
      subtitle: "Stripe certifié PCI-DSS",
      color: "#8B5CF6"
    },
    {
      icon: Zap,
      title: "Support réactif",
      subtitle: "Réponse sous 24h",
      color: "#EAB308"
    },
    {
      icon: Award,
      title: "Note 4.9/5",
      subtitle: "847+ utilisateurs actifs",
      color: "#fbbf24"
    },
    {
      icon: HeartHandshake,
      title: "Sans engagement",
      subtitle: "Annulation à tout moment",
      color: "#00D084"
    }
  ];

  return (
    <section className="relative px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-8">
            Pourquoi faire confiance à Comptalyze ?
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="rounded-xl p-4 sm:p-5 text-center transition-all hover:scale-105 duration-300"
                style={{
                  backgroundColor: '#14161b',
                  border: '1px solid #1f232b'
                }}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${badge.color}15`,
                    border: `1px solid ${badge.color}30`
                  }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: badge.color }} />
                </div>
                <div className="font-semibold text-white text-xs sm:text-sm mb-1">
                  {badge.title}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {badge.subtitle}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

