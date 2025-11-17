import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { FadeIn } from "@/app/components/anim/Motion";

export const metadata: Metadata = {
  title: "À propos — Comptalyze",
  description:
    "Comptalyze simplifie la comptabilité des micro-entrepreneurs : calcul URSSAF, statistiques, facturation et conseils clairs.",
  openGraph: {
    title: "À propos — Comptalyze",
    description:
      "Comptalyze simplifie la comptabilité des micro-entrepreneurs : calcul URSSAF, statistiques, facturation et conseils clairs.",
    images: ["/og.png"],
  },
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl md:text-2xl font-semibold text-white mb-3">
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#16181d] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-lg">
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main
      className="bg-[#0e0f12] min-h-screen"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Breadcrumb */}
        <FadeIn delay={0} y={8}>
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "À propos" },
            ]}
          />
        </FadeIn>

        {/* Hero */}
        <FadeIn delay={0.1} y={12}>
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00D084] to-[#2E6CF6]">
              À propos de Comptalyze
            </h1>
            <p className="mt-3 text-gray-300 text-lg">
              Nous simplifions la comptabilité des micro-entrepreneurs —
              clairement, sans jargon et à moindre coût.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6">
          {/* Founder story - Version professionnelle avec images */}
          <FadeIn delay={0.2} y={12}>
            <Card>
              <H2>L&apos;histoire du fondateur</H2>
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                {/* Image du fondateur */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#00D084]/10 to-[#2E6CF6]/10 border border-gray-800/50">
                  <div className="aspect-[4/5] flex items-center justify-center">
                    {/* Placeholder pour l'image - à remplacer par votre image */}
                    <div className="w-full h-full bg-gradient-to-br from-[#00D084]/20 to-[#2E6CF6]/20 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-[#00D084] to-[#2E6CF6] flex items-center justify-center text-white font-semibold text-2xl md:text-3xl shadow-lg mx-auto mb-4">
                          AM
                        </div>
                        <p className="text-gray-400 text-sm">Image du fondateur</p>
                      </div>
                    </div>
                    {/* TODO: Remplacer par <Image src="/images/fondateur.jpg" alt="Alex Martin" /> */}
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex flex-col justify-center">
                  <blockquote className="text-gray-200 leading-relaxed">
                    <p className="text-base md:text-lg italic mb-4">
                      &quot;Quand j&apos;ai lancé ma micro-entreprise, je débutais
                      dans l&apos;entrepreneuriat… C&apos;est de cette frustration
                      qu&apos;est né Comptalyze : un outil simple, précis et
                      abordable qui traduit la complexité en actions claires.&quot;
                    </p>
                    <footer className="text-gray-300 text-sm md:text-base">
                      <div className="font-semibold text-white">Alex Martin</div>
                      <div className="text-gray-400">Fondateur de Comptalyze</div>
                    </footer>
                  </blockquote>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Section landing page inspirée - Mockups téléphones */}
          <FadeIn delay={0.25} y={12}>
            <div className="relative rounded-2xl overflow-hidden border border-gray-800/50" style={{
              background: 'linear-gradient(135deg, #0e0f12 0%, #0a0b0e 50%, #0e0f12 100%)',
            }}>
              {/* Motif de grille subtil en arrière-plan */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 208, 132, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 208, 132, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />
              
              <div className="relative z-10 p-8 md:p-12">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Colonne gauche - Texte */}
                  <div className="space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16181d] border border-gray-800/50">
                      <div className="w-2 h-2 rounded-full bg-[#00D084]"></div>
                      <span className="text-sm text-gray-300">Offre 100% gratuite, sans frais cachés</span>
                    </div>

                    {/* Titre principal */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                      Transformez votre comptabilité en machine à générer du chiffre d&apos;affaires !
                    </h2>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                      Rejoignez des milliers de micro-entrepreneurs qui ont déjà révolutionné leur gestion financière. 
                      <span className="text-[#00D084] font-semibold"> 14 jours d&apos;essai gratuit sans carte bancaire</span> — 
                      découvrez pourquoi Comptalyze fait économiser en moyenne <span className="text-[#00D084] font-semibold">5h par semaine</span> à ses utilisateurs !
                    </p>

                    {/* CTA */}
                    <div className="pt-2">
                      <Link
                        href="/signup"
                        className="inline-flex items-center justify-center rounded-xl px-8 py-4 font-semibold text-lg text-[#0e0f12] bg-white hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg"
                      >
                        Commencer gratuitement
                      </Link>
                    </div>

                    {/* Badges de confiance */}
                    <div className="flex flex-wrap gap-4 pt-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-[#00D084]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base">Sécurisé ISO 27001</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-[#00D084]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-sm md:text-base">+100 000 entrepreneurs satisfaits</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-[#00D084]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base">Gain de 5h/semaine en moyenne</span>
                      </div>
                    </div>
                  </div>

                  {/* Colonne droite - Mockups téléphones */}
                  <div className="relative lg:flex lg:justify-end">
                    <div className="relative flex items-center justify-center lg:justify-end">
                      {/* Téléphone 1 (arrière-plan) */}
                      <div className="absolute left-0 top-8 w-[200px] md:w-[240px] lg:w-[280px] transform -rotate-12 z-10 opacity-90">
                        <div className="relative bg-white rounded-[2.5rem] p-2 shadow-2xl">
                          <div className="bg-black rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                            {/* Placeholder pour mockup téléphone 1 */}
                            <div className="w-full h-full bg-gradient-to-br from-[#00D084]/20 to-[#2E6CF6]/20 flex items-center justify-center">
                              <p className="text-gray-400 text-xs text-center px-4">Mockup téléphone 1<br/>(Écran Dashboard)</p>
                            </div>
                            {/* TODO: Remplacer par <Image src="/images/mockup-phone-1.png" alt="Dashboard Comptalyze" fill className="object-cover" /> */}
                          </div>
                        </div>
                      </div>

                      {/* Téléphone 2 (premier plan) */}
                      <div className="relative w-[220px] md:w-[260px] lg:w-[300px] transform rotate-12 z-20">
                        <div className="relative bg-white rounded-[2.5rem] p-2 shadow-2xl">
                          <div className="bg-black rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                            {/* Placeholder pour mockup téléphone 2 */}
                            <div className="w-full h-full bg-gradient-to-br from-[#2E6CF6]/20 to-[#00D084]/20 flex items-center justify-center">
                              <p className="text-gray-400 text-xs text-center px-4">Mockup téléphone 2<br/>(Écran Simulateur)</p>
                            </div>
                            {/* TODO: Remplacer par <Image src="/images/mockup-phone-2.png" alt="Simulateur URSSAF" fill className="object-cover" /> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Mission */}
          <FadeIn delay={0.3} y={12}>
            <Card>
              <H2>Notre mission</H2>
              <p className="text-gray-300 text-base md:text-lg">
                Vous faire gagner du temps et vous éviter les erreurs, pour que
                vous puissiez vous concentrer sur votre activité.
              </p>
            </Card>
          </FadeIn>

          {/* What we bring */}
          <FadeIn delay={0.4} y={12}>
            <Card>
              <H2>Ce que nous apportons</H2>
              <ul className="mt-2 grid gap-3 text-gray-300 list-disc pl-5 md:pl-6 text-base md:text-lg">
                <li>
                  <strong className="text-white">Simplicité</strong> — un
                  simulateur clair et des écrans qui vont droit au but.
                </li>
                <li>
                  <strong className="text-white">Fiabilité</strong> — des
                  calculs alignés sur les dernières règles applicables aux
                  micros.
                </li>
                <li>
                  <strong className="text-white">Prix juste</strong> — un outil
                  pro, accessible, sans frais cachés.
                </li>
                <li>
                  <strong className="text-white">Transparence</strong> — vous
                  gardez la main sur vos données (hébergées en Europe).
                </li>
              </ul>
            </Card>
          </FadeIn>

          {/* Values */}
          <FadeIn delay={0.5} y={12}>
            <Card>
              <H2>Nos valeurs</H2>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300 text-base md:text-lg">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔎</span>
                  <div>
                    <strong className="text-white">Clarté</strong> — expliquer,
                    pas compliquer.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">🧮</span>
                  <div>
                    <strong className="text-white">Rigueur</strong> — des
                    calculs vérifiables, des bases sourcées.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">🤝</span>
                  <div>
                    <strong className="text-white">Accessibilité</strong> — un
                    socle gratuit solide et des options Premium utiles.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔐</span>
                  <div>
                    <strong className="text-white">Respect des données</strong>{" "}
                    — sécurité, RGPD, contrôle utilisateur.
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Timeline */}
          <FadeIn delay={0.6} y={12}>
            <Card>
              <H2>Quelques jalons</H2>
              <ol className="relative border-s border-gray-800 ml-3 text-gray-300 mt-4">
                <li className="mb-6 ms-4 relative">
                  <div className="absolute w-3 h-3 bg-[#00D084] rounded-full -start-[7px] mt-2 border-2 border-[#0e0f12]"></div>
                  <time className="text-gray-400 font-semibold text-sm md:text-base">
                    2024
                  </time>
                  <p className="mt-1 text-base md:text-lg">
                    Prototype interne pour automatiser les calculs URSSAF.
                  </p>
                </li>
                <li className="mb-6 ms-4 relative">
                  <div className="absolute w-3 h-3 bg-[#2E6CF6] rounded-full -start-[7px] mt-2 border-2 border-[#0e0f12]"></div>
                  <time className="text-gray-400 font-semibold text-sm md:text-base">
                    2025
                  </time>
                  <p className="mt-1 text-base md:text-lg">
                    Ouverture publique — +10 M€ déclarés via Comptalyze.
                  </p>
                </li>
                <li className="ms-4 relative">
                  <div className="absolute w-3 h-3 bg-white rounded-full -start-[7px] mt-2 border-2 border-[#0e0f12]"></div>
                  <time className="text-gray-400 font-semibold text-sm md:text-base">
                    Aujourd&apos;hui
                  </time>
                  <p className="mt-1 text-base md:text-lg">
                    Statistiques avancées, facturation, conseils IA — et ça
                    continue.
                  </p>
                </li>
              </ol>
            </Card>
          </FadeIn>

          {/* Future */}
          <FadeIn delay={0.7} y={12}>
            <Card>
              <H2>Et demain ?</H2>
              <p className="text-gray-300 text-base md:text-lg">
                Nous continuons d&apos;améliorer Comptalyze avec de nouvelles
                fonctionnalités pour répondre à vos besoins : intégrations
                bancaires, rappels personnalisés, analyses encore plus
                approfondies. Votre feedback nous guide.
              </p>
            </Card>
          </FadeIn>

          {/* Data & privacy */}
          <FadeIn delay={0.8} y={12}>
            <Card>
              <H2>Vos données, notre priorité</H2>
              <p className="text-gray-300 text-base md:text-lg mb-3">
                Données hébergées dans des régions UE chez Vercel; transferts encadrés par les Clauses Contractuelles Types (SCC).
              </p>
              <p className="text-gray-300 text-base md:text-lg">
                Chiffrement en transit et au repos, conformité RGPD stricte. Vous pouvez exporter ou supprimer vos données à
                tout moment.
              </p>
              <p className="text-sm text-gray-400 mt-3">
                Pour toute question relative à vos données : <a href="mailto:dpo@comptalyze.com" className="text-[#00D084] hover:text-[#00c077] underline transition-colors">dpo@comptalyze.com</a>
              </p>
            </Card>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.9} y={12}>
            <Card>
              <H2>Rejoignez-nous</H2>
              <p className="text-gray-300 mb-4 text-base md:text-lg">
                Simplifiez votre comptabilité dès aujourd&apos;hui.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#00D084] to-[#2E6CF6] transition-all hover:scale-[1.02] shadow-lg"
                  style={{
                    boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                  }}
                >
                  Créer un compte gratuitement
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold border border-gray-700 text-gray-200 hover:bg-[#1b1f25] transition-all hover:scale-[1.02]"
                >
                  Voir nos offres
                </Link>
              </div>
            </Card>
          </FadeIn>

          {/* Contact */}
          <FadeIn delay={1.0} y={12}>
            <Card>
              <H2>Contact</H2>
              <p className="text-gray-300 text-base md:text-lg">
                Une question, une idée, un partenariat ? Écrivez-nous :{" "}
                <a
                  className="underline hover:text-gray-100 text-[#00D084] transition-colors"
                  href="mailto:support@comptalyze.com"
                >
                  support@comptalyze.com
                </a>
              </p>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Comptalyze",
            url: "https://comptalyze.com",
            logo: "https://comptalyze.com/logo.png",
            sameAs: [],
          }),
        }}
      />
    </main>
  );
}

