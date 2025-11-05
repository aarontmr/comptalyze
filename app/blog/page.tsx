'use client';

import Link from 'next/link';
import { FileText, Calculator, TrendingUp, Calendar } from 'lucide-react';

export default function BlogPage() {
  const articles = [
    {
      slug: 'guide-comptabilite-micro-entreprise',
      title: 'Guide Complet : Comptabilité pour Micro-Entreprise',
      description: 'Tout ce que vous devez savoir sur la gestion comptable de votre micro-entreprise : obligations, outils, astuces.',
      category: 'Guides',
      readTime: '8 min',
      icon: FileText,
    },
    {
      slug: 'calculer-cotisations-urssaf',
      title: 'Comment Calculer ses Cotisations URSSAF en 2025',
      description: 'Taux de cotisations, calculs, exemples concrets. Maîtrisez vos charges sociales et anticipez vos paiements URSSAF.',
      category: 'URSSAF',
      readTime: '6 min',
      icon: Calculator,
    },
    {
      slug: 'optimiser-revenus-micro-entreprise',
      title: "Optimiser ses Revenus en Micro-Entreprise : 10 Astuces",
      description: "Découvrez comment maximiser vos revenus nets, réduire vos charges et optimiser votre fiscalité légalement.",
      category: 'Optimisation',
      readTime: '10 min',
      icon: TrendingUp,
    },
    {
      slug: 'calendrier-declarations-urssaf-2025',
      title: 'Calendrier des Déclarations URSSAF 2025',
      description: 'Toutes les dates importantes à ne pas manquer pour vos déclarations mensuelles et trimestrielles URSSAF.',
      category: 'Calendrier',
      readTime: '4 min',
      icon: Calendar,
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

