"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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
    answer: "Absolument ! Comptalyze est conçu pour les débutants comme pour les micro-entrepreneurs expérimentés. Notre interface simple vous guide pas à pas : ajoutez vos revenus, l'outil calcule automatiquement vos cotisations URSSAF, votre TVA et vous donne une vision claire de ce qu'il vous reste réellement. Aucune connaissance comptable n'est requise. Le plan gratuit vous permet de tester avec 5 simulations par mois."
  },
  {
    question: "Mes données sont-elles sécurisées sur Comptalyze ?",
    answer: "Oui, la sécurité de vos données est notre priorité absolue. Vos informations sont hébergées dans des régions de l'Union Européenne (Vercel + Supabase), chiffrées en transit (HTTPS/TLS) et au repos (AES-256). Nous sommes conformes RGPD et ne partageons jamais vos données avec des tiers commerciaux. Vous pouvez exporter ou supprimer vos données à tout moment. Les transferts hors UE sont encadrés par les Clauses Contractuelles Types (SCC)."
  },
  {
    question: "Quelle est la différence entre les plans Pro et Premium ?",
    answer: "Le plan Pro (3,90€/mois) offre l'essentiel : enregistrements illimités, calcul TVA automatique, factures PDF, exports CSV/PDF et gestion des charges déductibles. Le plan Premium (7,90€/mois) ajoute des fonctionnalités avancées : assistant IA personnalisé (ComptaBot) pour des conseils sur mesure, pré-remplissage automatique URSSAF, analytics avancés avec alertes de seuils, export comptable Excel enrichi, et rappels automatiques avec calendrier fiscal. Idéal si vous voulez automatiser au maximum."
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer: "Oui, vous pouvez annuler votre abonnement quand vous le souhaitez, sans frais ni engagement. Votre abonnement restera actif jusqu'à la fin de la période payée, puis votre compte passera automatiquement au plan gratuit. Vous ne perdrez pas vos données, elles resteront accessibles."
  },
  {
    question: "Comment fonctionne le pré-remplissage URSSAF ?",
    answer: "Le pré-remplissage URSSAF (disponible en Premium) génère automatiquement un fichier PDF avec toutes vos déclarations pré-remplies à partir de vos enregistrements Comptalyze. Il vous suffit de télécharger le PDF, de le vérifier et de l'envoyer à l'URSSAF. Cela vous fait gagner un temps précieux et évite les erreurs de saisie."
  },
  {
    question: "Comptalyze peut-il remplacer un expert-comptable ?",
    answer: "Comptalyze est un outil d'aide à la gestion pour micro-entrepreneurs. Il automatise vos calculs, déclarations et suivi comptable. Cependant, pour des conseils fiscaux complexes, des optimisations avancées ou des situations particulières, nous recommandons de consulter un expert-comptable. Comptalyze facilite le travail avec votre expert-comptable en générant des exports comptables propres et structurés."
  },
  {
    question: "Puis-je importer mes données depuis un autre outil ?",
    answer: "Oui, Comptalyze permet d'importer vos relevés bancaires au format CSV ou OFX. Vous pouvez également importer vos factures et transactions depuis d'autres outils comptables. Pour les imports complexes, notre équipe support peut vous aider à migrer vos données."
  }
];

export default function FaqPage() {
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

      <main
        className="min-h-screen w-full text-white"
        style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
      >
        {/* Header avec bouton retour */}
        <section className="px-4 pt-20 pb-8 sm:pt-24">
          <div className="mx-auto max-w-4xl">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 group"
              style={{ 
                backgroundColor: "#14161b", 
                border: "1px solid #1f232b",
                color: "#a8b2d1"
              }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Retour à l'accueil</span>
            </Link>

            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-4 bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #ffffff 0%, #a8b2d1 100%)" }}>
                Questions fréquentes
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                Tout ce que vous devez savoir sur la micro-entreprise et Comptalyze
              </p>
            </div>
          </div>
        </section>

        {/* Section FAQ */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl">
            {/* Liste des questions */}
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <motion.div
                  key={`faq-${index}-${item.question.substring(0, 20)}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
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
              className="mt-12 text-center"
            >
              <div
                className="rounded-2xl p-8 border"
                style={{
                  backgroundColor: "#14161b",
                  borderColor: "#1f232b",
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  Vous avez d'autres questions ?
                </h3>
                <p className="text-gray-400 mb-6">
                  Notre équipe support est là pour vous aider
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard/help"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                      boxShadow: '0 4px 15px rgba(46,108,246,0.3)'
                    }}
                  >
                    Accéder au centre d'aide
                  </Link>
                  <a
                    href="mailto:support@comptalyze.com"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-[1.05]"
                    style={{
                      border: "1px solid #1f232b",
                      backgroundColor: "#0e0f12",
                      color: "#a8b2d1"
                    }}
                  >
                    Contactez-nous
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}

