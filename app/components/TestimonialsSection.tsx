"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Quote, Star, TrendingUp, CheckCircle2, Users, Clock, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: number;
  firstName: string;
  job: string;
  location: string;
  quote: string;
  benefit: string;
  avatar: string;
  rating: number;
  verified: boolean;
  featured: boolean;
}

interface TestimonialsData {
  stats: {
    users: number;
    declarationsGenerated: number;
    timeSaved: number;
    satisfactionRate: number;
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

  // Prendre seulement les témoignages featured pour la landing
  const displayedTestimonials = data.testimonials.filter(t => t.featured);

  return (
    <section className="relative px-4 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Badge et titre de la section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(0,208,132,0.15)", color: "#00D084", border: "1px solid rgba(0,208,132,0.3)" }}>
                <Award className="w-4 h-4" />
                Témoignages vérifiés
              </span>
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
              Ils ont simplifié leur compta
            </h2>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
              Rejoignez <span className="text-white font-bold">{formatNumber(data.stats.users)}+ micro-entrepreneurs</span> qui gagnent du temps chaque mois
            </p>
          </motion.div>
        </div>

        {/* Stats Grid - Nouvelle section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16"
        >
          {/* Stat 1 - Utilisateurs */}
          <div className="rounded-2xl p-6 text-center transition-all hover:scale-105" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <Users className="w-8 h-8 mx-auto mb-3" style={{ color: "#00D084" }} />
            <div className="text-3xl font-bold text-white mb-1">{formatNumber(data.stats.users)}+</div>
            <div className="text-sm text-gray-400">Utilisateurs actifs</div>
          </div>

          {/* Stat 2 - Déclarations */}
          <div className="rounded-2xl p-6 text-center transition-all hover:scale-105" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3" style={{ color: "#2E6CF6" }} />
            <div className="text-3xl font-bold text-white mb-1">{formatNumber(data.stats.declarationsGenerated)}</div>
            <div className="text-sm text-gray-400">Déclarations générées</div>
          </div>

          {/* Stat 3 - Temps gagné */}
          <div className="rounded-2xl p-6 text-center transition-all hover:scale-105" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: "#8B5CF6" }} />
            <div className="text-3xl font-bold text-white mb-1">{formatNumber(data.stats.timeSaved)}h</div>
            <div className="text-sm text-gray-400">Heures économisées</div>
          </div>

          {/* Stat 4 - Satisfaction */}
          <div className="rounded-2xl p-6 text-center transition-all hover:scale-105" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
            <Star className="w-8 h-8 mx-auto mb-3 fill-current" style={{ color: "#fbbf24" }} />
            <div className="text-3xl font-bold text-white mb-1">{data.stats.satisfactionRate}/5</div>
            <div className="text-sm text-gray-400">Note moyenne</div>
          </div>
        </motion.div>

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
                className="rounded-2xl p-8 transition-all h-full flex flex-col hover:scale-[1.02] duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: '#16181d',
                  border: '1px solid #2d3441',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                {/* Badge vérifié */}
                {testimonial.verified && (
                  <div className="absolute top-4 right-4">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'rgba(0, 208, 132, 0.15)',
                        border: '1px solid rgba(0, 208, 132, 0.4)',
                        color: '#00D084'
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Vérifié</span>
                    </div>
                  </div>
                )}

                {/* Étoiles */}
                <div className="flex items-center gap-1 mb-5" role="img" aria-label={`${testimonial.rating} étoiles sur 5`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-current"
                      style={{ color: '#fbbf24' }}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Citation */}
                <div className="flex-1 mb-6">
                  <Quote className="w-10 h-10 mb-4 opacity-20" style={{ color: '#00D084' }} aria-hidden="true" />
                  <p className="text-gray-300 text-base leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Badge bénéfice */}
                <div className="mb-6">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: 'rgba(0, 208, 132, 0.1)',
                      border: '1px solid rgba(0, 208, 132, 0.3)',
                      color: '#00D084'
                    }}
                  >
                    <Zap className="w-4 h-4" aria-hidden="true" />
                    <span>{testimonial.benefit}</span>
                  </div>
                </div>

                {/* Profil utilisateur */}
                <div className="flex items-center gap-4 pt-6 border-t" style={{ borderColor: '#2d3441' }}>
                  <div
                    className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                    style={{ 
                      backgroundColor: '#2d3441',
                      boxShadow: '0 0 0 2px rgba(0, 208, 132, 0.3)'
                    }}
                  >
                    {/* Avatar avec fallback */}
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                      style={{
                        background: `linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)`
                      }}
                      aria-label={`Photo de ${testimonial.firstName}`}
                    >
                      {testimonial.firstName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-base truncate mb-1">
                      {testimonial.firstName}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {testimonial.job}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      📍 {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 text-lg mb-6">
            Prêt à rejoindre ces micro-entrepreneurs satisfaits ?
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 hover:scale-110 hover:brightness-110 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              boxShadow: "0 12px 40px rgba(46,108,246,0.4)",
            }}
          >
            <Zap className="w-5 h-5" />
            Commencer gratuitement
          </a>
          <p className="mt-4 text-sm text-gray-500">
            Sans carte bancaire • 3 simulations offertes • Annulable à tout moment
          </p>
        </motion.div>
      </div>
    </section>
  );
}





