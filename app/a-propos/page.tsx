import Link from "next/link";
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
          {/* Founder story */}
          <FadeIn delay={0.2} y={12}>
            <Card>
              <H2>L&apos;histoire du fondateur</H2>
              <div className="mt-3 flex items-start gap-4">
                {/* Avatar or fallback initials */}
                <div className="relative flex-shrink-0">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-[#00D084] to-[#2E6CF6] flex items-center justify-center text-white font-semibold text-lg md:text-xl shadow-lg">
                    AM
                  </div>
                </div>
                <blockquote className="text-gray-200 leading-relaxed flex-1">
                  <p className="text-base md:text-lg italic">
                    &quot;Quand j&apos;ai lancé ma micro-entreprise, je débutais
                    dans l&apos;entrepreneuriat… C&apos;est de cette frustration
                    qu&apos;est né Comptalyze : un outil simple, précis et
                    abordable qui traduit la complexité en actions claires.&quot;
                  </p>
                  <footer className="mt-3 text-gray-400 text-sm md:text-base">
                    — Alex Martin, Fondateur de Comptalyze
                  </footer>
                </blockquote>
              </div>
            </Card>
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
                  href="mailto:contact@comptalyze.com"
                >
                  contact@comptalyze.com
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

