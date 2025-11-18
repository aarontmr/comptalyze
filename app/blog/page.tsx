'use client';

import Link from 'next/link';
import { FileText, Calculator, TrendingUp, Calendar, Zap, DollarSign } from 'lucide-react';

export default function BlogPage() {
  const articles = [
    {
      slug: 'declaration-urssaf-micro-entrepreneur-2025',
      title: 'Déclaration URSSAF Micro-Entrepreneur 2025 : Guide Complet',
      description: 'Tout savoir sur la déclaration URSSAF en micro-entreprise : dates, calculs, paiement en ligne, taux de cotisations 2025. Guide pratique avec exemples.',
      category: 'URSSAF',
      readTime: '12 min',
      icon: FileText,
    },
    {
      slug: 'calculer-cotisations-urssaf-2025',
      title: 'Comment Calculer ses Cotisations URSSAF en 2025',
      description: 'Calculez précisément vos cotisations URSSAF en micro-entreprise. Taux 2025, simulateur, exemples concrets et astuces pour anticiper vos charges sociales.',
      category: 'URSSAF',
      readTime: '10 min',
      icon: Calculator,
    },
    {
      slug: 'acre-2025-guide-complet',
      title: 'ACRE 2025 : Guide Complet de l\'Aide à la Création d\'Entreprise',
      description: 'ACRE 2025 : conditions, montant, demande, durée. Économisez 50% de cotisations sociales la première année. Guide complet pour micro-entrepreneurs.',
      category: 'Aides',
      readTime: '9 min',
      icon: TrendingUp,
    },
    {
      slug: 'calendrier-fiscal-micro-entrepreneur-2025',
      title: 'Calendrier Fiscal Micro-Entrepreneur 2025 : Toutes les Dates',
      description: 'Ne manquez aucune échéance en 2025 ! Calendrier complet des déclarations URSSAF, impôts, TVA et CFE pour micro-entrepreneurs. Dates et rappels automatiques.',
      category: 'Calendrier',
      readTime: '8 min',
      icon: Calendar,
    },
    {
      slug: 'facturation-micro-entrepreneur-2025',
      title: 'Facturation Micro-Entrepreneur 2025 : Guide Complet et Mentions Obligatoires',
      description: 'Tout savoir sur la facturation en micro-entreprise : mentions obligatoires, logiciels conformes, devis, numérotation, conservation.',
      category: 'Facturation',
      readTime: '11 min',
      icon: FileText,
    },
    {
      slug: 'guide-comptabilite-micro-entreprise',
      title: 'Guide Complet : Comptabilité pour Micro-Entreprise',
      description: 'Tout ce que vous devez savoir sur la gestion comptable de votre micro-entreprise : obligations, outils, astuces.',
      category: 'Guides',
      readTime: '8 min',
      icon: FileText,
    },
    {
      slug: 'automatisation-comptable-micro-entrepreneur-2025',
      title: 'Automatisation Comptable Micro-Entrepreneur 2025 : Outils et Stratégies',
      description: 'Automatisez votre comptabilité en micro-entreprise : outils SaaS, intégrations bancaires, facturation automatique, rappels URSSAF. Guide complet 2025 pour gagner du temps.',
      category: 'Automatisation',
      readTime: '14 min',
      icon: Zap,
    },
    {
      slug: 'optimisation-fiscale-micro-entreprise-2025',
      title: 'Optimisation Fiscale Micro-Entreprise 2025 : Stratégies et Conseils',
      description: 'Optimisez votre fiscalité en micro-entreprise : versement libératoire, abattements, déductions, planification fiscale. Guide complet 2025 pour réduire vos impôts légalement.',
      category: 'Fiscalité',
      readTime: '16 min',
      icon: DollarSign,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0e0f12' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#1f232b' }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-bold text-white hover:opacity-80 transition-opacity">
            ← Comptalyze
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Blog Comptalyze
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Guides et conseils pour gérer votre micro-entreprise comme un pro
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', border: '1px solid rgba(0, 208, 132, 0.3)' }}>
            <span className="text-sm text-gray-300">
              📚 Mis à jour régulièrement • 🇫🇷 Spécialisé France
            </span>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article, index) => {
              const Icon = article.icon;
              return (
                <Link
                  key={index}
                  href={`/blog/${article.slug}`}
                  className="block p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    backgroundColor: '#1a1d24',
                    border: '1px solid #2d3441',
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', color: '#00D084' }}>
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">{article.readTime}</span>
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">
                        {article.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {article.description}
                  </p>
                  <div className="mt-4 text-sm font-medium" style={{ color: '#00D084' }}>
                    Lire l'article →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

