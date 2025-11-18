"use client";

import Link from "next/link";
import { Briefcase, Check, ArrowRight, Sparkles, Shield, FileText, BarChart3, Zap, Clock, Repeat, DollarSign, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function FreelancesPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const features = [
    {
      icon: FileText,
      title: "Factures récurrentes",
      description: "Créez des factures récurrentes pour vos clients réguliers. Automatisez votre facturation mensuelle ou trimestrielle.",
      color: "#2E6CF6"
    },
    {
      icon: Clock,
      title: "Suivi du temps",
      description: "Enregistrez vos heures travaillées par projet et client. Générez des factures basées sur votre temps réel.",
      color: "#00D084"
    },
    {
      icon: Repeat,
      title: "Templates de factures",
      description: "Créez des modèles personnalisés pour chaque type de prestation. Gagnez du temps sur chaque facture.",
      color: "#8B5CF6"
    },
    {
      icon: DollarSign,
      title: "Calcul URSSAF en temps réel",
      description: "Calculez instantanément vos cotisations et votre revenu net. Visualisez l'impact de chaque facture.",
      color: "#f59e0b"
    },
    {
      icon: BarChart3,
      title: "Suivi de projets",
      description: "Organisez vos factures par projet et client. Suivez la rentabilité de chaque mission.",
      color: "#2E6CF6"
    },
    {
      icon: TrendingUp,
      title: "Projections financières",
      description: "Anticipez vos revenus et cotisations. Planifiez votre trésorerie avec des projections précises.",
      color: "#00D084"
    }
  ];

  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      <Header user={user} />

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(closest-side, #00D084, rgba(0,0,0,0))" }}
          />
        </div>

        <div className="mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" 
            style={{
              backgroundColor: "rgba(0,208,132,0.1)",
              border: "1px solid rgba(0,208,132,0.2)",
            }}
          >
            <Briefcase className="w-4 h-4" style={{ color: "#00D084" }} />
            <span className="text-xs sm:text-sm font-medium text-gray-300">
              Solution comptable pour freelances
            </span>
          </div>

          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl leading-tight px-2 mb-6">
            <span className="block mb-2">Gérez votre activité</span>
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              }}
            >
              freelance en toute simplicité
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            <strong className="text-white">Factures, cotisations, suivi de projets</strong> : tout ce dont vous avez besoin 
            pour gérer votre activité freelance sans vous prendre la tête avec la comptabilité.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-12">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base sm:text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 8px 32px rgba(46,108,246,0.4)",
              }}
            >
              <Sparkles className="w-5 h-5" />
              Démarrer gratuitement
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base sm:text-lg font-medium text-gray-300 transition-all duration-300 hover:text-white"
              style={{
                border: "1px solid #2b2f36",
                backgroundColor: "#0e0f12",
              }}
            >
              Voir les tarifs
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Fonctionnalités pensées pour les freelances
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Optimisez votre gestion administrative et concentrez-vous sur ce qui compte : vos projets
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative rounded-xl p-6 transition-all cursor-default"
                  style={{ 
                    backgroundColor: "#16181d",
                    border: "1px solid #1f232b",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background: `linear-gradient(90deg, ${feature.color} 0%, ${feature.color}80 100%)`,
                    }}
                  />
                  <div className="mt-2 mb-4">
                    <div 
                      className="inline-flex items-center justify-center rounded-xl p-3"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-2xl p-8 sm:p-12 text-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)",
              border: "1px solid rgba(46,108,246,0.2)",
            }}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
              }}
            />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Simplifiez votre gestion freelance dès aujourd'hui
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de freelances qui font confiance à Comptalyze
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                boxShadow: "0 8px 32px rgba(46,108,246,0.4)",
              }}
            >
              <Sparkles className="w-5 h-5" />
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

