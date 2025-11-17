"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
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
        {/* Layout en deux colonnes : Image à gauche, Texte à droite */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Colonne gauche - Image */}
          <FadeIn delay={0.1} y={20} duration={0.6}>
            <div className="relative order-2 lg:order-1">
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 700px"
                />
              </div>
            </div>
          </FadeIn>

          {/* Colonne droite - Texte */}
          <FadeIn delay={0} y={12} duration={0.5}>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" 
                style={{
                  backgroundColor: "rgba(0, 208, 132, 0.1)",
                  border: "1px solid rgba(0, 208, 132, 0.3)"
                }}
              >
                <span className="text-sm font-medium" style={{ color: "#00D084" }}>
                  ✨ PLUS DE 30 FONCTIONNALITÉS
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 lg:text-left text-center">
                Une solution complète{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  pour votre comptabilité
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 mb-8 leading-relaxed lg:text-left text-center">
                Avec plus de <strong className="text-white">30 fonctionnalités incluses</strong> dans le plan Premium, gérez toute votre comptabilité depuis une seule plateforme intuitive et puissante.
              </p>
              
              {/* Points clés */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)" }}>
                    <Check className="w-4 h-4" style={{ color: "#00D084" }} />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Toutes les fonctionnalités essentielles</p>
                    <p className="text-sm text-gray-400">
                      Calculs automatiques, factures, projections, analytics, ComptaBot IA, export FEC, intégrations bancaires et bien plus encore
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)" }}>
                    <Check className="w-4 h-4" style={{ color: "#2E6CF6" }} />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Interface responsive et moderne</p>
                    <p className="text-sm text-gray-400">
                      Accédez à toutes vos fonctionnalités depuis n'importe quel appareil : mobile, tablette ou ordinateur
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)" }}>
                    <Check className="w-4 h-4" style={{ color: "#00D084" }} />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Mises à jour régulières</p>
                    <p className="text-sm text-gray-400">
                      De nouvelles fonctionnalités sont ajoutées régulièrement pour améliorer votre expérience comptable
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Badge avec nombre de fonctionnalités */}
              <div className="mb-8 p-4 rounded-xl" style={{ 
                background: "linear-gradient(135deg, rgba(0, 208, 132, 0.1), rgba(46, 108, 246, 0.1))",
                border: "1px solid rgba(0, 208, 132, 0.3)"
              }}>
                <p className="text-center text-sm text-gray-300">
                  <span className="text-2xl font-bold text-white">30+</span> fonctionnalités Premium incluses pour{" "}
                  <span className="text-white font-semibold">7,90€/mois</span>
                </p>
              </div>

              {/* Call to action */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
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

      </div>
    </section>
  );
}
