"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, TrendingUp, BarChart3, Sparkles, Smartphone, Laptop } from "lucide-react";
import { FadeIn } from "@/app/components/anim/Motion";

export default function LandingPreviewsSection() {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(0,208,132,0.3) 0%, rgba(46,108,246,0.3) 50%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <FadeIn delay={0} y={12} duration={0.5}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Votre comptabilité,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                }}
              >
                partout et en temps réel
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Une interface intuitive qui s'adapte à tous vos appareils. Consultez vos métriques sur mobile, analysez vos projections sur desktop.
            </p>
          </div>
        </FadeIn>

        {/* Image du mockup */}
        <FadeIn delay={0.1} y={20} duration={0.6}>
          <div className="relative mb-12 sm:mb-16">
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                border: "1px solid rgba(0, 208, 132, 0.2)",
                boxShadow: "0 20px 80px rgba(0, 208, 132, 0.15), 0 0 0 1px rgba(46, 108, 246, 0.1)",
              }}
            >
              <Image
                src="/mockups/devices-mockup.png"
                alt="Comptalyze - Dashboard sur tablette et ordinateur portable montrant les métriques financières et projections"
                width={1400}
                height={900}
                className="w-full h-auto"
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, 1400px"
              />
            </div>
          </div>
        </FadeIn>

        {/* Features grid autour de l'image */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Feature 1 - Vue d'ensemble mobile */}
          <FadeIn delay={0.2} y={12}>
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)" }}>
                <Smartphone className="w-6 h-6" style={{ color: "#00D084" }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Vue d'ensemble mobile</h3>
              <p className="text-sm text-gray-400">
                Consultez votre CA, cotisations et revenu net en un coup d'œil, même en déplacement.
              </p>
            </div>
          </FadeIn>

          {/* Feature 2 - Projections avancées */}
          <FadeIn delay={0.3} y={12}>
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)" }}>
                <TrendingUp className="w-6 h-6" style={{ color: "#2E6CF6" }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Projections financières</h3>
              <p className="text-sm text-gray-400">
                Anticipez vos revenus et cotisations sur 6 mois avec des graphiques clairs et précis.
              </p>
            </div>
          </FadeIn>

          {/* Feature 3 - ComptaBot IA */}
          <FadeIn delay={0.4} y={12}>
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)" }}>
                <Sparkles className="w-6 h-6" style={{ color: "#00D084" }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">ComptaBot Premium</h3>
              <p className="text-sm text-gray-400">
                Votre assistant IA répond à toutes vos questions comptables en temps réel.
              </p>
            </div>
          </FadeIn>

          {/* Feature 4 - Analytics détaillés */}
          <FadeIn delay={0.5} y={12}>
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid #1f232b",
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)" }}>
                <BarChart3 className="w-6 h-6" style={{ color: "#2E6CF6" }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics en temps réel</h3>
              <p className="text-sm text-gray-400">
                Suivez votre croissance avec des métriques précises et des graphiques interactifs.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Points clés détaillés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Colonne gauche - Tablette/Mobile */}
          <FadeIn delay={0.2} y={12}>
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid rgba(0, 208, 132, 0.2)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)" }}>
                  <Smartphone className="w-6 h-6" style={{ color: "#00D084" }} />
                </div>
                <h3 className="text-xl font-semibold text-white">Sur mobile et tablette</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <p className="text-white font-medium mb-1">Métriques essentielles</p>
                    <p className="text-sm text-gray-400">
                      CA du mois, cotisations estimées, revenu net et taux de croissance visibles en un instant
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <p className="text-white font-medium mb-1">Historique des transactions</p>
                    <p className="text-sm text-gray-400">
                      Accédez rapidement à vos derniers enregistrements avec dates et montants
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                  <div>
                    <p className="text-white font-medium mb-1">ComptaBot toujours disponible</p>
                    <p className="text-sm text-gray-400">
                      Posez vos questions comptables où que vous soyez, votre assistant IA vous répond
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </FadeIn>

          {/* Colonne droite - Desktop */}
          <FadeIn delay={0.3} y={12}>
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                backgroundColor: "#14161b",
                border: "1px solid rgba(46, 108, 246, 0.2)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)" }}>
                  <Laptop className="w-6 h-6" style={{ color: "#2E6CF6" }} />
                </div>
                <h3 className="text-xl font-semibold text-white">Sur ordinateur</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#2E6CF6" }} />
                  <div>
                    <p className="text-white font-medium mb-1">Projections financières avancées</p>
                    <p className="text-sm text-gray-400">
                      Visualisez l'évolution de votre CA et revenu net sur 6 mois avec des graphiques détaillés
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#2E6CF6" }} />
                  <div>
                    <p className="text-white font-medium mb-1">Métriques projetées</p>
                    <p className="text-sm text-gray-400">
                      CA projeté, revenu net projeté et moyenne mensuelle calculés automatiquement
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#2E6CF6" }} />
                  <div>
                    <p className="text-white font-medium mb-1">Analyse approfondie</p>
                    <p className="text-sm text-gray-400">
                      Explorez vos données avec des outils d'analyse complets et des rapports détaillés
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* Call to action */}
        <FadeIn delay={0.4} y={12}>
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-6">
              <strong className="text-white">100% responsive</strong> — Votre comptabilité vous suit partout, sur tous vos appareils
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  boxShadow: "0 8px 32px rgba(46, 108, 246, 0.3)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Essayer gratuitement</span>
              </motion.a>
              <motion.a
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-medium text-gray-300 transition-all duration-300 hover:text-white"
                style={{
                  border: "1px solid #2b2f36",
                  backgroundColor: "#0e0f12",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Voir une démo</span>
              </motion.a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
