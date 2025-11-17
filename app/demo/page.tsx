"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, FileText, ArrowRight, Sparkles } from "lucide-react";
import UrssafCalculatorDemo from "@/app/components/UrssafCalculatorDemo";

export default function DemoPage() {
  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#00D084]" />
            <span className="text-sm text-gray-300">Retour à l’accueil</span>
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.05]"
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            Créer un compte gratuit
          </Link>
        </header>

        {/* Hero demo */}
        <section className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              backgroundColor: "rgba(0,208,132,0.1)",
              border: "1px solid rgba(0,208,132,0.3)",
            }}
          >
            <span className="text-xs font-semibold text-[#00D084]">Mode démo – aucune donnée réelle</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Essayez Comptalyze
            <span className="block text-2xl sm:text-3xl text-gray-300 mt-2">
              sans créer de compte
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Découvrez le calculateur URSSAF et un aperçu du dashboard avec des données fictives.
            Tout est en lecture seule : rien n’est sauvegardé.
          </p>
        </section>

        {/* Demo URSSAF */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Calculez vos cotisations URSSAF</h2>
          <UrssafCalculatorDemo />
        </section>

        {/* Aperçu dashboard + facture fictive */}
        <section className="grid gap-6 lg:grid-cols-2 mb-16">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-[#00D084]" />
              Aperçu du dashboard
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Visualisez comment Comptalyze suit votre chiffre d’affaires, vos cotisations et votre revenu net.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">CA du mois (exemple)</span>
                <span className="font-semibold text-white">4 700,00 €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Cotisations URSSAF estimées</span>
                <span className="font-semibold text-[#00D084]">1 004,00 €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Revenu net estimé</span>
                <span className="font-semibold text-white">3 696,00 €</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2E6CF6]" />
              Exemple de facture PDF
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Un aperçu de la façon dont Comptalyze génère une facture professionnelle conforme.
            </p>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#2d3441" }}>
              <Image
                src="/previews/Facture-demo.png"
                alt="Exemple de facture Comptalyze"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-3">Prêt à passer sur vos vrais chiffres ?</h2>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            Créez un compte gratuit pour enregistrer vos calculs, suivre vos revenus et générer vos factures.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold text-sm sm:text-base transition-all hover:scale-[1.05]"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
              }}
            >
              <Sparkles className="w-5 h-5" />
              Créer un compte gratuit
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm text-gray-300 hover:text-white"
              style={{ border: "1px solid #2b2f36", backgroundColor: "#14161b" }}
            >
              Voir les plans complets
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Sans carte bancaire • Plan Free disponible • Upgrade en 1 clic
          </p>
        </section>
      </div>
    </main>
  );
}






