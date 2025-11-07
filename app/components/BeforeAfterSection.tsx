"use client";

import { X, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BeforeAfterSection() {
  const beforeItems = [
    "3h par mois sur la compta",
    "Erreurs de calcul URSSAF",
    "Stress avant chaque déclaration",
    "Excel complexe et fastidieux",
    "Peur de dépasser les seuils",
    "Oubli des échéances fiscales"
  ];

  const afterItems = [
    "10 min par mois en automatique",
    "Calculs précis et vérifiés",
    "Déclarations pré-remplies",
    "Interface simple et intuitive",
    "Alertes proactives",
    "Rappels automatiques"
  ];

  return (
    <section className="relative px-4 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Badge et titre */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(46,108,246,0.15)", color: "#60a5fa", border: "1px solid rgba(46,108,246,0.3)" }}>
                Transformation
              </span>
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
              Votre compta avant & après Comptalyze
            </h2>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
              Découvrez comment Comptalyze transforme votre gestion comptable au quotidien
            </p>
          </motion.div>
        </div>

        {/* Comparaison Avant / Après */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 relative">
          {/* Flèche centrale (desktop uniquement) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              // @ts-ignore
              transition={{
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <ArrowRight className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* AVANT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              backgroundColor: '#14161b',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {/* Badge AVANT */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                ❌ AVANT
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-6 text-white">
              Sans Comptalyze
            </h3>

            <ul className="space-y-4">
              {beforeItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)" }}>
                    <X className="w-4 h-4" style={{ color: "#EF4444" }} />
                  </div>
                  <span className="text-gray-300 text-base">{item}</span>
                </motion.li>
              ))}
            </ul>

            {/* Effet visuel */}
            <div
              className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl opacity-10"
              style={{ background: "radial-gradient(circle, #EF4444 0%, transparent 70%)" }}
            />
          </motion.div>

          {/* APRÈS */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              backgroundColor: '#14161b',
              border: '1px solid rgba(0, 208, 132, 0.4)',
              boxShadow: '0 0 40px rgba(0, 208, 132, 0.1)'
            }}
          >
            {/* Badge APRÈS */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: "rgba(0, 208, 132, 0.15)", color: "#00D084", border: "1px solid rgba(0, 208, 132, 0.3)" }}>
                ✓ APRÈS
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-6 text-white">
              Avec Comptalyze
            </h3>

            <ul className="space-y-4">
              {afterItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: "rgba(0, 208, 132, 0.15)" }}>
                    <Check className="w-4 h-4" style={{ color: "#00D084" }} />
                  </div>
                  <span className="text-gray-200 text-base font-medium">{item}</span>
                </motion.li>
              ))}
            </ul>

            {/* Effet visuel */}
            <div
              className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, #00D084 0%, transparent 70%)" }}
            />
          </motion.div>
        </div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-block">
            <div className="mb-6">
              <div className="text-lg sm:text-xl text-gray-300 mb-2">
                Prêt à simplifier votre comptabilité ?
              </div>
              <div className="text-sm text-gray-500">
                Rejoignez 847+ micro-entrepreneurs qui ont fait le choix de la simplicité
              </div>
            </div>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 hover:scale-110 hover:brightness-110 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 12px 40px rgba(46,108,246,0.4)",
              }}
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="mt-4 text-sm text-gray-500">
              Sans carte bancaire • 3 simulations offertes • Annulable à tout moment
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

