"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

function FadeCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return <div>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPreviewsSection() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const cards = [
    { 
      src: "/previews/preremp et ca.PNG", 
      alt: "Simulateur de cotisations URSSAF", 
      caption: "Simulateur URSSAF — Calculez vos cotisations instantanément" 
    },
    { 
      src: "/previews/Dashboard.PNG", 
      alt: "Dashboard Comptalyze", 
      caption: "Dashboard — Suivez vos revenus et vos charges" 
    },
    { 
      src: "/previews/Statistiques.PNG", 
      alt: "Statistiques Comptalyze", 
      caption: "Statistiques — Visualisez l'évolution de votre activité" 
    },
    { 
      src: "/previews/tx de cr.PNG", 
      alt: "Facturation Comptalyze", 
      caption: "Facturation — Créez vos factures en quelques clics" 
    },
  ];

  const handleImageError = (src: string) => {
    setImageErrors((prev) => ({ ...prev, [src]: true }));
  };

  return (
    <section className="py-20 bg-[#0e0f12]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          Découvrez Comptalyze en action
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-10">
          Un aperçu du simulateur URSSAF, du tableau de bord et des outils de gestion intégrés.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((c, i) => (
            <FadeCard key={c.src} delay={i * 0.08}>
              <div className="group rounded-xl overflow-hidden border border-gray-800 bg-[#111317] shadow-lg transition-all duration-300 hover:shadow-[0_0_0_2px_rgba(0,208,132,0.1),0_8px_24px_rgba(46,108,246,0.15)] hover:border-gray-700">
                {imageErrors[c.src] ? (
                  <div 
                    className="w-full aspect-video flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)",
                    }}
                  >
                    <div className="text-center px-4">
                      <p className="text-gray-500 text-sm">Image en cours de chargement...</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="relative w-full aspect-video overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor: "#0e0f12",
                    }}
                  >
                    <Image
                      src={c.src}
                      alt={c.alt}
                      width={1280}
                      height={800}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      priority={i < 2}
                      onError={() => handleImageError(c.src)}
                    />
                  </div>
                )}
                <div className="px-4 py-3 border-t border-gray-800">
                  <p className="text-gray-400 text-sm text-center">
                    {c.caption}
                  </p>
                </div>
              </div>
            </FadeCard>
          ))}
        </div>
      </div>
    </section>
  );
}

