"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Accent gradient background */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div
          className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(closest-side, #00D084, rgba(0,0,0,0))" }}
        />
        <div
          className="absolute top-1/3 -right-24 h-[500px] w-[500px] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(closest-side, #2E6CF6, rgba(0,0,0,0))" }}
        />
      </div>

      {/* HERO */}
      <section className="relative px-4 py-20 sm:py-24 md:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 flex w-full justify-center">
            <Image
              src={logo}
              alt="Comptalyze"
              priority
              width={160}
              height={40}
              className="h-12 w-auto opacity-95"
            />
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl leading-tight">
            Simplifiez votre comptabilité de micro-entrepreneur.
          </h1>
          <p className="mt-4 text-base text-gray-300 sm:text-lg md:text-xl">
            Comptalyze calcule automatiquement vos cotisations URSSAF et vos projections de revenus, en quelques secondes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
              }}
            >
              Essayer gratuitement
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors"
              style={{ border: "1px solid #2b2f36", backgroundColor: "#14161b" }}
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-semibold sm:text-3xl">
            Pourquoi choisir Comptalyze ?
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl p-5 transition-all" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <div className="mb-3 text-2xl">⚙️</div>
              <h3 className="mb-1 font-medium">Calcul automatique des cotisations</h3>
              <p className="text-sm text-gray-400">Entrez votre chiffre d’affaires, Comptalyze fait le reste.</p>
            </div>
            <div className="rounded-xl p-5 transition-all" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <div className="mb-3 text-2xl">📊</div>
              <h3 className="mb-1 font-medium">Projections précises</h3>
              <p className="text-sm text-gray-400">Visualisez vos revenus nets et vos cotisations à venir.</p>
            </div>
            <div className="rounded-xl p-5 transition-all" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <div className="mb-3 text-2xl">🔒</div>
              <h3 className="mb-1 font-medium">Données sécurisées</h3>
              <p className="text-sm text-gray-400">Vos informations restent privées et chiffrées.</p>
            </div>
            <div className="rounded-xl p-5 transition-all" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <div className="mb-3 text-2xl">💡</div>
              <h3 className="mb-1 font-medium">Simple et rapide</h3>
              <p className="text-sm text-gray-400">Pensé pour les micro-entrepreneurs, sans jargon.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-semibold sm:text-3xl">
            Des plans adaptés à votre activité
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <h3 className="text-lg font-semibold">Gratuit</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li>3 simulations / mois</li>
                <li>Accès au simulateur</li>
              </ul>
              <Link href="/pricing" className="mt-6 inline-block rounded-lg px-4 py-2 text-sm" style={{ border: "1px solid #2b2f36", backgroundColor: "#0e0f12" }}>
                Voir les tarifs
              </Link>
            </div>
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: "#161922",
                border: "1px solid rgba(46,108,246,0.5)",
                boxShadow: "0 0 30px rgba(46,108,246,0.15)",
              }}
            >
              <h3 className="text-lg font-semibold">Pro</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                <li>Simulations illimitées</li>
                <li>Export PDF</li>
              </ul>
              <Link href="/pricing" className="mt-6 inline-block rounded-lg px-4 py-2 text-sm text-white" style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}>
                Voir les tarifs
              </Link>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <h3 className="text-lg font-semibold">Premium</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li>Toutes les fonctionnalités Pro</li>
                <li>Rappels URSSAF</li>
              </ul>
              <Link href="/pricing" className="mt-6 inline-block rounded-lg px-4 py-2 text-sm" style={{ border: "1px solid #2b2f36", backgroundColor: "#0e0f12" }}>
                Voir les tarifs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-semibold sm:text-3xl">
            Ils utilisent déjà Comptalyze
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <p className="text-sm text-gray-300">“Interface claire et résultats fiables. Je gagne un temps fou.”</p>
              <div className="mt-4 text-xs text-gray-500">— Julie, Graphiste</div>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <p className="text-sm text-gray-300">“Parfait pour suivre mes cotisations et anticiper mes revenus.”</p>
              <div className="mt-4 text-xs text-gray-500">— Karim, Développeur</div>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <p className="text-sm text-gray-300">“Enfin un outil simple, sans jargon, adapté aux micro-entrepreneurs.”</p>
              <div className="mt-4 text-xs text-gray-500">— Lucie, Consultante</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative px-4 py-10 border-t" style={{ borderColor: "#1f232b" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-sm text-gray-400">
            <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/legal/politique-de-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="mailto:contact@comptalyze.com" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="mt-6 text-sm text-gray-500">contact@comptalyze.com</div>
          <div className="mt-1 text-xs text-gray-600">© 2025 Comptalyze. Tous droits réservés.</div>
        </div>
      </footer>
    </main>
  );
}
