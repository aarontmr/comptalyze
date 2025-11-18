"use client";

import Link from "next/link";
import Image from "next/image";
import { Laptop, Check, ArrowRight, Sparkles, Shield, FileText, BarChart3 } from "lucide-react";
import logo from "@/public/logo.png";
import { useEffect } from "react";

export default function LogicielMicroEntrepriseLanding() {
  useEffect(() => {
    // Track page view
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_view", {
        page_title: "Logiciel Micro-Entreprise",
        page_location: window.location.href,
        page_path: "/logiciel-micro-entreprise",
      });
    }
  }, []);

  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ backgroundColor: "#0e0f12", borderColor: "#1f232b" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="Comptalyze"
                width={180}
                height={45}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:scale-[1.08] hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
              }}
            >
              Voir les offres
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Above the Fold */}
      <section className="relative px-4 pt-24 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(closest-side, #2E6CF6, rgba(0,0,0,0))" }}
          />
        </div>

        <div className="mx-auto max-w-6xl text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" 
            style={{
              backgroundColor: "rgba(46,108,246,0.1)",
              border: "1px solid rgba(46,108,246,0.2)",
            }}
          >
            <Laptop className="w-4 h-4" style={{ color: "#2E6CF6" }} />
            <span className="text-xs sm:text-sm font-medium text-gray-300">
              Solution complète pour micro-entrepreneurs
            </span>
          </div>

          {/* H1 aligné à l'intent */}
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl leading-tight px-2 mb-6">
            <span className="block mb-2">Le logiciel comptable</span>
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              }}
            >
              100% micro-entreprise
            </span>
          </h1>

          {/* Subhead problème → solution */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            <strong className="text-white">Gérez tout depuis un seul endroit.</strong> Cotisations, factures, TVA, exports comptables et assistant IA. Pensé par des micro-entrepreneurs, pour des micro-entrepreneurs.
          </p>

          {/* CTA Above-the-fold */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-8">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base sm:text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.10] hover:brightness-110 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 12px 40px rgba(46,108,246,0.4)",
              }}
            >
              <Sparkles className="w-5 h-5" />
              Passer à Premium dès 7,90 €/mois
            </Link>
          </div>

          {/* Trust bullets */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: "#00D084" }} />
              <span>Sans CB</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: "#00D084" }} />
              <span>100% français</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: "#00D084" }} />
              <span>Export comptable</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: "#00D084" }} />
              <span>Assistant IA inclus</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <Shield className="w-5 h-5" style={{ color: "#00D084" }} />
              <span className="text-sm text-gray-300">Conforme RGPD</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <BarChart3 className="w-5 h-5" style={{ color: "#2E6CF6" }} />
              <span className="text-sm text-gray-300">Interface intuitive</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(46, 108, 246, 0.2)",
              boxShadow: "0 0 40px rgba(46, 108, 246, 0.15)"
            }}
          >
            <Image
              src="/mockups/devices-mockup.png"
              alt="Dashboard Comptalyze - Logiciel micro-entreprise"
              width={1200}
              height={800}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Comment ça marche - 3 étapes */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Tout ce dont vous avez besoin, en un seul outil
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}
              >
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Factures professionnelles</h3>
              <p className="text-gray-400">
                Créez des factures conformes en quelques clics. Toutes les mentions légales incluses.
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}
              >
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Suivi en temps réel</h3>
              <p className="text-gray-400">
                Visualisez votre CA, vos cotisations et vos projections sur des tableaux de bord clairs.
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Assistant IA</h3>
              <p className="text-gray-400">
                Posez vos questions comptables à ComptaBot, disponible 24/7 pour vous conseiller.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités clés */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités incluses
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: "📊", title: "Simulateur URSSAF", desc: "Calcul automatique de vos cotisations" },
              { icon: "🧾", title: "Factures conformes", desc: "Génération PDF avec mentions légales" },
              { icon: "📈", title: "Suivi de seuils", desc: "Alertes avant dépassement CA/TVA" },
              { icon: "💾", title: "Export Excel/PDF", desc: "Pour votre comptable ou vos archives" },
              { icon: "🤖", title: "ComptaBot IA (Premium)", desc: "Expert-comptable virtuel 24/7" },
              { icon: "🔗", title: "Intégrations Shopify/Stripe", desc: "Import automatique de votre CA" },
            ].map((feature, i) => (
              <div 
                key={i}
                className="rounded-xl p-6 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ courte */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            <details className="group rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <summary className="cursor-pointer font-semibold text-lg text-white flex items-center justify-between">
                Comptalyze est-il adapté à mon activité ?
                <ArrowRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-gray-400">
                Oui ! Comptalyze est conçu pour tous les types de micro-entreprises : e-commerce, services, activités libérales, artisans, etc.
              </p>
            </details>

            <details className="group rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <summary className="cursor-pointer font-semibold text-lg text-white flex items-center justify-between">
                Puis-je essayer gratuitement ?
                <ArrowRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-gray-400">
                Absolument ! Profitez de 3 jours d'essai gratuit sans carte bancaire pour tester toutes les fonctionnalités.
              </p>
            </details>

            <details className="group rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <summary className="cursor-pointer font-semibold text-lg text-white flex items-center justify-between">
                Mes données sont-elles sécurisées ?
                <ArrowRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-gray-400">
                Oui, vos données sont hébergées en Europe, chiffrées et conformes RGPD. Vous pouvez les exporter ou les supprimer à tout moment.
              </p>
            </details>

            <details className="group rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <summary className="cursor-pointer font-semibold text-lg text-white flex items-center justify-between">
                Puis-je changer de plan à tout moment ?
                <ArrowRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-gray-400">
                Oui, vous pouvez upgrader, downgrader ou annuler votre abonnement en 1 clic depuis votre compte. Sans engagement.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div 
            className="rounded-2xl p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)",
              border: "1px solid rgba(46,108,246,0.3)",
            }}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
              }}
            />

            <h2 className="text-3xl font-bold mb-4">
              Prêt à simplifier votre comptabilité ?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Rejoignez des milliers de micro-entrepreneurs qui gagnent du temps avec Comptalyze.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.05]"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
              }}
            >
              <Sparkles className="w-5 h-5" />
              Commencer gratuitement
            </Link>

            <p className="mt-4 text-sm text-gray-500">
              Sans engagement • Annulable en 1 clic
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-4 py-10 border-t" style={{ borderColor: "#1f232b" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 text-sm text-gray-400">
            <Link href="/a-propos" className="hover:text-white transition-colors">À propos</Link>
            <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/legal/politique-de-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="mailto:support@comptalyze.com" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="mt-6 text-sm text-gray-500">support@comptalyze.com</div>
          <div className="mt-1 text-xs text-gray-600">© 2025 Comptalyze. Tous droits réservés.</div>
        </div>
      </footer>
    </main>
  );
}

