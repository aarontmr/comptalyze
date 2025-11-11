"use client";

import Link from "next/link";
import Image from "next/image";
import { FileText, Check, ArrowRight, Sparkles, Shield, Download } from "lucide-react";
import logo from "@/public/logo.png";
import { useEffect } from "react";

export default function FacturationAutoEntrepreneurLanding() {
  useEffect(() => {
    // Track page view
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_view", {
        page_title: "Facturation Auto-Entrepreneur",
        page_location: window.location.href,
        page_path: "/facturation-auto-entrepreneur",
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
            style={{ background: "radial-gradient(closest-side, #00D084, rgba(0,0,0,0))" }}
          />
        </div>

        <div className="mx-auto max-w-6xl text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" 
            style={{
              backgroundColor: "rgba(0,208,132,0.1)",
              border: "1px solid rgba(0,208,132,0.2)",
            }}
          >
            <FileText className="w-4 h-4" style={{ color: "#00D084" }} />
            <span className="text-xs sm:text-sm font-medium text-gray-300">
              Facturation professionnelle simplifiée
            </span>
          </div>

          {/* H1 aligné à l'intent */}
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl leading-tight px-2 mb-6">
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              }}
            >
              Créez vos factures
            </span>
            <span className="block mt-2 text-3xl sm:text-4xl md:text-5xl">
              conformes en 2 clics
            </span>
          </h1>

          {/* Subhead problème → solution */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            <strong className="text-white">Fini les templates Excel compliqués.</strong> Comptalyze génère des factures professionnelles conformes avec toutes les mentions légales obligatoires. Export PDF instantané.
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
              <span>100% français</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: "#00D084" }} />
              <span>Export PDF/Excel</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: "#00D084" }} />
              <span>Mentions légales incluses</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <Shield className="w-5 h-5" style={{ color: "#00D084" }} />
              <span className="text-sm text-gray-300">100% conforme</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <Download className="w-5 h-5" style={{ color: "#2E6CF6" }} />
              <span className="text-sm text-gray-300">Export instantané</span>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Facture */}
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
              src="/previews/Factures.PNG"
              alt="Exemple de facture Comptalyze conforme"
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
            Comment ça marche ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}
              >
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Remplissez les champs</h3>
              <p className="text-gray-400">
                Client, montant, description : tous les champs essentiels en un formulaire simple
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}
              >
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Génération automatique</h3>
              <p className="text-gray-400">
                Comptalyze ajoute automatiquement toutes les mentions légales obligatoires
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}
              >
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Exportez en PDF</h3>
              <p className="text-gray-400">
                Téléchargez et envoyez votre facture professionnelle en quelques secondes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentions légales incluses */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Toutes les mentions légales incluses
          </h2>

          <div 
            className="rounded-2xl p-8"
            style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                "Numéro de facture unique",
                "Date d'émission et d'échéance",
                "Informations légales complètes",
                "Numéro SIRET",
                "Exonération TVA (Article 293 B)",
                "Pénalités de retard",
                "Indemnité forfaitaire de recouvrement",
                "Mentions d'assurance professionnelle",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: "#00D084" }} />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: "#1f232b" }}>
              <p className="text-sm text-gray-400">
                ✅ <strong className="text-white">100% conforme</strong> aux obligations légales françaises pour les micro-entrepreneurs
              </p>
            </div>
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
                Les factures sont-elles vraiment conformes ?
                <ArrowRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-gray-400">
                Oui ! Toutes nos factures incluent les mentions légales obligatoires pour les micro-entrepreneurs : SIRET, exonération TVA, pénalités de retard, etc.
              </p>
            </details>

            <details className="group rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <summary className="cursor-pointer font-semibold text-lg text-white flex items-center justify-between">
                Puis-je personnaliser mes factures ?
                <ArrowRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-gray-400">
                Oui ! Vous pouvez ajouter votre logo, personnaliser les couleurs et adapter les champs selon vos besoins.
              </p>
            </details>

            <details className="group rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <summary className="cursor-pointer font-semibold text-lg text-white flex items-center justify-between">
                Combien de factures puis-je créer ?
                <ArrowRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-gray-400">
                Avec le plan Pro, créez un nombre illimité de factures. Le plan gratuit permet de tester avec 3 factures.
              </p>
            </details>

            <details className="group rounded-xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <summary className="cursor-pointer font-semibold text-lg text-white flex items-center justify-between">
                Puis-je envoyer mes factures directement aux clients ?
                <ArrowRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-gray-400">
                Oui, exportez vos factures en PDF et envoyez-les par email. Une fonction d'envoi automatique est prévue dans une prochaine mise à jour.
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
              Prêt à créer vos factures professionnelles ?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Rejoignez des milliers d'auto-entrepreneurs qui facturent en toute sérénité.
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

