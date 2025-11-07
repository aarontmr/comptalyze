import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide Comptabilité Micro-Entreprise 2025 | Comptalyze",
  description: "Guide complet de la comptabilité pour micro-entreprise : obligations, logiciels, déclarations URSSAF, facturation. Tout ce qu'il faut savoir.",
  keywords: ["comptabilité micro-entreprise", "comptabilité auto-entrepreneur", "obligations comptables micro-entreprise", "logiciel comptabilité"],
  openGraph: {
    title: "Guide Comptabilité Micro-Entreprise 2025",
    description: "Toutes les obligations comptables de la micro-entreprise expliquées simplement",
  },
};

export default function ArticlePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0e0f12' }}>
      <header className="border-b" style={{ borderColor: '#1f232b' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/blog" className="text-lg font-semibold text-white hover:opacity-80">
            ← Retour au blog
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(0, 208, 132, 0.1)', color: '#00D084' }}>
              Guides
            </span>
            <span className="text-sm text-gray-500">8 min de lecture</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Guide Complet : Comptabilité pour Micro-Entreprise
          </h1>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            Tout ce que vous devez savoir sur la gestion comptable de votre micro-entreprise : obligations, outils, astuces pour rester conforme.
          </p>
        </header>

        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 space-y-6 leading-relaxed">
            <h2 className="text-3xl font-bold text-white mt-12 mb-6">La Comptabilité Simplifiée de la Micro-Entreprise</h2>
            
            <p>
              La <strong>micro-entreprise</strong> (anciennement auto-entrepreneur) bénéficie d'un régime comptable ultra-simplifié. 
              Contrairement aux entreprises classiques, vous n'avez pas besoin de tenir une comptabilité en partie double ni de produire un bilan.
            </p>

            <h3 className="text-2xl font-bold text-white mt-10 mb-4">Vos Obligations Comptables</h3>
            
            <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
              <h4 className="text-xl font-semibold text-white mb-4">✅ Ce que vous DEVEZ faire :</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <span><strong>Tenir un livre des recettes</strong> : Notez tous vos encaissements chronologiquement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <span><strong>Conserver les justificatifs</strong> : Factures, tickets, relevés bancaires (10 ans)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <span><strong>Ouvrir un compte bancaire dédié</strong> : Si CA annuel &gt; 10 000€ pendant 2 ans consécutifs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <span><strong>Facturer avec mentions obligatoires</strong> : SIRET, "TVA non applicable", etc.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h4 className="text-xl font-semibold text-white mb-4">❌ Ce que vous n'avez PAS à faire :</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Tenir une comptabilité en partie double</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Produire un bilan comptable annuel</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Faire appel à un expert-comptable (sauf si vous le souhaitez)</span>
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-bold text-white mt-10 mb-4">Comment Comptalyze vous aide</h3>
            
            <p>
              <strong>Comptalyze</strong> est le logiciel de comptabilité pensé spécifiquement pour les micro-entreprises. Il vous permet de :
            </p>

            <ul className="space-y-3 my-6">
              <li className="flex items-start gap-3">
                <span style={{ color: '#00D084' }}>✓</span>
                <span><strong>Calculer automatiquement vos cotisations URSSAF</strong> selon votre type d'activité</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: '#00D084' }}>✓</span>
                <span><strong>Suivre votre chiffre d'affaires</strong> mois par mois avec historique complet</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: '#00D084' }}>✓</span>
                <span><strong>Générer des factures conformes</strong> avec toutes les mentions légales</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: '#00D084' }}>✓</span>
                <span><strong>Anticiper vos déclarations</strong> avec un calendrier fiscal automatique</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: '#00D084' }}>✓</span>
                <span><strong>Obtenir des conseils IA</strong> personnalisés (plan Premium)</span>
              </li>
            </ul>

            <h3 className="text-2xl font-bold text-white mt-10 mb-4">Les Outils Essentiels</h3>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
                <h4 className="font-semibold text-white mb-2">1. Logiciel de gestion (Comptalyze)</h4>
                <p className="text-gray-400 text-sm">Pour calculer vos cotisations, suivre votre CA et générer vos factures</p>
              </div>
              
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
                <h4 className="font-semibold text-white mb-2">2. Compte bancaire dédié</h4>
                <p className="text-gray-400 text-sm">Pour séparer vos finances personnelles et professionnelles</p>
              </div>
              
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
                <h4 className="font-semibold text-white mb-2">3. Outil de facturation</h4>
                <p className="text-gray-400 text-sm">Intégré dans Comptalyze (plan Pro et Premium)</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mt-10 mb-4">Conclusion</h3>
            
            <p>
              La comptabilité en micro-entreprise est <strong>simple et accessible</strong>. Avec les bons outils comme 
              Comptalyze, vous pouvez gérer votre activité sereinement sans passer des heures sur la paperasse.
            </p>

            <div className="mt-12 p-8 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, rgba(0, 208, 132, 0.1) 0%, rgba(46, 108, 246, 0.1) 100%)', border: '1px solid rgba(0, 208, 132, 0.3)' }}>
              <h3 className="text-2xl font-bold text-white mb-4">Essayez Comptalyze gratuitement</h3>
              <p className="text-gray-300 mb-6">
                3 jours d'essai gratuit du plan Premium • Sans carte bancaire
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 rounded-xl text-white font-semibold transition-all hover:scale-105 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)', boxShadow: '0 4px 20px rgba(0, 208, 132, 0.3)' }}
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

