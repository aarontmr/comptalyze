"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "Comment déclarer mon chiffre d'affaires à l'URSSAF ?",
    answer: "Pour déclarer votre CA à l'URSSAF en tant que micro-entrepreneur, connectez-vous sur autoentrepreneur.urssaf.fr chaque mois ou trimestre (selon votre choix). Indiquez simplement votre chiffre d'affaires encaissé, même s'il est nul. Les cotisations sociales sont calculées automatiquement selon votre taux (12,8% ou 22% selon votre activité). Avec Comptalyze, générez automatiquement vos déclarations pré-remplies avec le bon montant et les bons taux, évitant ainsi les erreurs de calcul."
  },
  {
    question: "Quels sont les seuils de chiffre d'affaires en micro-entreprise ?",
    answer: "Les plafonds de CA pour 2024-2025 sont : 188 700 € pour les activités de vente de marchandises (BIC) et 77 700 € pour les prestations de services et professions libérales (BNC/BIC services). Si vous dépassez ces seuils deux années consécutives, vous perdez le régime de la micro-entreprise. Comptalyze vous alerte automatiquement lorsque vous approchez de ces seuils (à 80% et 90%) pour anticiper et prendre les bonnes décisions."
  },
  {
    question: "Franchise en base de TVA : quand la perdre et comment la gérer ?",
    answer: "En micro-entreprise, vous bénéficiez de la franchise en base de TVA si votre CA ne dépasse pas 36 800 € (prestations de services) ou 91 900 € (ventes). Au-delà de ces seuils, vous devez facturer et collecter la TVA. Vous perdez immédiatement la franchise si vous dépassez les seuils majorés (39 100 € et 101 000 €). Comptalyze suit automatiquement votre CA et vous indique en temps réel votre statut TVA, vous aidant à anticiper le basculement et à ajuster vos tarifs si nécessaire."
  },
  {
    question: "Puis-je utiliser Comptalyze si je débute en micro-entreprise ?",
    answer: "Absolument ! Comptalyze est conçu pour les débutants comme pour les micro-entrepreneurs expérimentés. Notre interface simple vous guide pas à pas : ajoutez vos revenus, l'outil calcule automatiquement vos cotisations URSSAF, votre TVA et vous donne une vision claire de ce qu'il vous reste réellement. Aucune connaissance comptable n'est requise. Le plan gratuit vous permet de tester avec 3 enregistrements par mois."
  },
  {
    question: "Mes données sont-elles sécurisées sur Comptalyze ?",
    answer: "Oui, la sécurité de vos données est notre priorité absolue. Vos informations sont hébergées dans des régions de l'Union Européenne (Vercel + Supabase), chiffrées en transit (HTTPS/TLS) et au repos (AES-256). Nous sommes conformes RGPD et ne partageons jamais vos données avec des tiers commerciaux. Vous pouvez exporter ou supprimer vos données à tout moment. Les transferts hors UE sont encadrés par les Clauses Contractuelles Types (SCC)."
  },
  {
    question: "Quelle est la différence entre les plans Pro et Premium ?",
    answer: "Le plan Pro (7,90€/mois) offre l'essentiel : enregistrements illimités, calcul TVA automatique, factures PDF, exports CSV/PDF et gestion des charges déductibles. Le plan Premium (15,90€/mois) ajoute des fonctionnalités avancées : assistant IA personnalisé (ComptaBot) pour des conseils sur mesure, pré-remplissage automatique URSSAF, analytics avancés avec alertes de seuils, export comptable Excel enrichi, et rappels automatiques avec calendrier fiscal. Idéal si vous voulez automatiser au maximum."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Générer le JSON-LD pour les rich results Google
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      {/* JSON-LD pour SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Titre */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold sm:text-3xl mb-3 text-white">
                Questions fréquentes
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Tout ce que vous devez savoir sur la micro-entreprise et Comptalyze
              </p>
            </motion.div>
          </div>

          {/* Liste des questions */}
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div
                  className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: '#16181d',
                    border: openIndex === index 
                      ? '1px solid rgba(0, 208, 132, 0.3)' 
                      : '1px solid #2d3441',
                    boxShadow: openIndex === index 
                      ? '0 4px 20px rgba(0, 208, 132, 0.1)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {/* Question - Bouton cliquable */}
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left transition-colors duration-200 hover:bg-gray-800/30"
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-base sm:text-lg font-medium text-white pr-4">
                      {item.question}
                    </span>
                    <span className="flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUp 
                          className="w-5 h-5 transition-transform duration-200" 
                          style={{ color: '#00D084' }}
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronDown 
                          className="w-5 h-5 transition-transform duration-200" 
                          style={{ color: '#6b7280' }}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </button>

                  {/* Réponse - Animée */}
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-2">
                          <div 
                            className="text-sm sm:text-base leading-relaxed"
                            style={{ color: '#d1d5db' }}
                          >
                            {item.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA en bas de la FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 text-center"
          >
            <p className="text-gray-400 text-sm mb-4">
              Vous avez d&apos;autres questions ?
            </p>
            <a
              href="mailto:contact@comptalyze.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                boxShadow: '0 4px 15px rgba(46,108,246,0.3)'
              }}
            >
              Contactez-nous
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}




