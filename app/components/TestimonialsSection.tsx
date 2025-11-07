"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Quote, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: number;
  firstName: string;
  job: string;
  quote: string;
  benefit: string;
  avatar: string;
  rating: number;
}

interface TestimonialsData {
  stats: {
    declarationsGenerated: number;
    lastUpdated: string;
  };
  testimonials: Testimonial[];
}

export default function TestimonialsSection() {
  const [data, setData] = useState<TestimonialsData | null>(null);

  useEffect(() => {
    // Charger les données depuis le fichier JSON
    fetch('/data/testimonials.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Error loading testimonials:', err));
  }, []);

  if (!data) {
    return null; // Éviter le CLS en ne rendant rien pendant le chargement
  }

  // Formater le nombre avec des espaces (12 340)
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Prendre seulement les 3 premiers témoignages pour la landing
  const displayedTestimonials = data.testimonials.slice(0, 3);

  return (
    <section className="relative px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Titre de la section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold sm:text-3xl mb-3 text-white">
              Ils utilisent déjà Comptalyze
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Rejoignez des centaines de micro-entrepreneurs qui simplifient leur comptabilité
            </p>
          </motion.div>
        </div>

        {/* Grille de témoignages */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className="rounded-2xl p-6 transition-all h-full flex flex-col hover:scale-[1.02] duration-300"
                style={{
                  backgroundColor: '#16181d',
                  border: '1px solid #2d3441',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Étoiles */}
                <div className="flex items-center gap-1 mb-4" role="img" aria-label={`${testimonial.rating} étoiles sur 5`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-current"
                      style={{ color: '#fbbf24' }}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Citation */}
                <div className="flex-1 mb-5">
                  <Quote className="w-8 h-8 mb-3 opacity-20" style={{ color: '#00D084' }} aria-hidden="true" />
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {testimonial.quote}
                  </p>
                </div>

                {/* Badge bénéfice */}
                <div className="mb-4">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(0, 208, 132, 0.1)',
                      border: '1px solid rgba(0, 208, 132, 0.3)',
                      color: '#00D084'
                    }}
                  >
                    <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{testimonial.benefit}</span>
                  </div>
                </div>

                {/* Profil utilisateur */}
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: '#2d3441' }}>
                  <div
                    className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: '#2d3441' }}
                  >
                    {/* Avatar avec fallback */}
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-semibold text-lg"
                      style={{
                        background: `linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)`
                      }}
                      aria-label={`Photo de ${testimonial.firstName}`}
                    >
                      {testimonial.firstName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {testimonial.firstName}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {testimonial.job}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compteur de déclarations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div
            className="inline-block rounded-2xl px-8 py-6 relative overflow-hidden"
            style={{
              backgroundColor: '#16181d',
              border: '1px solid rgba(0, 208, 132, 0.2)',
            }}
          >
            {/* Effet de brillance subtil */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)'
              }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#00D084' }}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  En temps réel
                </span>
              </div>

              <div className="flex items-baseline justify-center gap-2 flex-wrap">
                <span className="text-gray-400 text-sm sm:text-base">
                  Déjà
                </span>
                <span
                  className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)'
                  }}
                  aria-label={`${data.stats.declarationsGenerated} déclarations générées`}
                >
                  {formatNumber(data.stats.declarationsGenerated)}
                </span>
                <span className="text-gray-400 text-sm sm:text-base">
                  déclarations générées
                </span>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Mis à jour le {new Date(data.stats.lastUpdated).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}




