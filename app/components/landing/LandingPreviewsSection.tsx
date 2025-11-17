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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cards = [
    { 
      src: "/previews/hero-control.jpg", 
      alt: "Contrôle des cotisations URSSAF"
    },
    { 
      src: "/previews/hero-errors.jpg", 
      alt: "Calcul automatique des cotisations"
    },
    { 
      src: "/previews/hero-ai.jpg", 
      alt: "Comptabilité simplifiée par l'IA"
    }
  ];

  const handleImageError = (src: string) => {
    setImageErrors((prev) => ({ ...prev, [src]: true }));
  };

  return (
    <section className="py-20 bg-[#0e0f12] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Container avec effet de pile de cartes */}
          <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 min-h-[600px]">
            {cards.map((card, index) => {
              // Calcul de la rotation et position pour l'effet de cartes distribuées
              const rotation = (index - cards.length / 2) * 3;
              const yOffset = Math.abs(index - cards.length / 2) * 8;
              const zIndex = cards.length - index;
              
              return (
                <FadeCard key={card.src} delay={index * 0.1}>
                  <motion.div
                    className="relative"
                    style={{
                      zIndex: hoveredIndex === index ? 100 : zIndex,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    whileHover={{ 
                      scale: 1.05,
                      rotate: 0,
                      y: -20,
                      transition: { duration: 0.3 }
                    }}
                    initial={{ 
                      rotate: rotation,
                      y: yOffset
                    }}
                    animate={{ 
                      rotate: hoveredIndex === index ? 0 : rotation,
                      y: hoveredIndex === index ? -20 : yOffset,
                      scale: hoveredIndex === index ? 1.05 : 1
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  >
                    <div 
                      className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50 bg-[#111317]"
                      style={{
                        boxShadow: hoveredIndex === index 
                          ? "0 20px 60px rgba(0, 208, 132, 0.3), 0 0 0 1px rgba(0, 208, 132, 0.2)"
                          : "0 10px 40px rgba(0, 0, 0, 0.5)"
                      }}
                    >
                      {imageErrors[card.src] ? (
                        <div 
                          className="w-[400px] h-[500px] sm:w-[450px] sm:h-[550px] flex items-center justify-center"
                          style={{
                            background: "linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)",
                          }}
                        >
                          <div className="text-center px-4">
                            <p className="text-gray-500 text-sm">Image en cours de chargement...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-[400px] h-[500px] sm:w-[450px] sm:h-[550px]">
                          <Image
                            src={card.src}
                            alt={card.alt}
                            fill
                            className="object-contain"
                            loading={index < 3 ? "eager" : "lazy"}
                            priority={index === 0}
                            quality={90}
                            sizes="(max-width: 768px) 400px, 450px"
                            onError={() => handleImageError(card.src)}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </FadeCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
