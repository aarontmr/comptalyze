"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Shield, TrendingUp, Percent, BarChart3, FileText, Calculator, Lock, Info, Check, Sparkles, Zap, UserPlus, FolderOpen, Users, ShieldCheck, Wallet } from "lucide-react";
import { FadeIn, Stagger, ScaleOnHover, fadeInVariant } from "@/app/components/anim/Motion";
import Counter from "@/app/components/anim/Counter";
import GradientBlob from "@/app/components/anim/GradientBlob";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import UrssafCalculatorDemo from "@/app/components/UrssafCalculatorDemo";
import Header from "@/components/Header";

// Dynamic imports pour les composants lourds (chargés uniquement quand visibles)
const BeforeAfterSection = dynamic(() => import("@/app/components/BeforeAfterSection"), {
  loading: () => <div className="py-20" />,
});
const ExtraInfoCards = dynamic(() => import("@/app/components/landing/ExtraInfoCards"), {
  loading: () => <div className="py-20" />,
});
const LandingPreviewsSection = dynamic(() => import("@/app/components/landing/LandingPreviewsSection"), {
  loading: () => <div className="py-20" />,
});
const TestimonialsSection = dynamic(() => import("@/app/components/TestimonialsSection"), {
  loading: () => <div className="py-20" />,
});
const FaqSection = dynamic(() => import("@/app/components/FaqSection"), {
  loading: () => <div className="py-20" />,
});
const FeedbackButton = dynamic(() => import("@/app/components/FeedbackButton"), {
  ssr: false,
});
const GoogleAdsBanner = dynamic(() => import("@/app/components/GoogleAdsBanner"), {
  ssr: false,
});

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("taux-cotisations");

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

  const handleCheckout = (plan: "pro" | "premium") => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(plan);
    router.push(`/checkout/${plan}`);
  };

  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Google Ads Banner */}
      <GoogleAdsBanner />
      
      {/* Header */}
      <Header user={user} />

      {/* Accent gradient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(closest-side, #00D084, rgba(0,0,0,0))" }}
        />
        <div
          className="absolute top-1/3 -right-12 md:-right-24 h-[400px] w-[400px] md:h-[500px] md:w-[500px] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(closest-side, #2E6CF6, rgba(0,0,0,0))" }}
        />
      </div>

      {/* HERO */}
      <section className="relative px-4 pt-28 pb-12 sm:pt-36 sm:pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <GradientBlob />
        
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:items-start">
            {/* Colonne gauche - Contenu */}
            <div className="text-center lg:text-left relative z-20">
              {/* Badge premium en haut */}
              <FadeIn delay={0.05} y={8} immediate={true}>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 sm:mb-8" 
                  style={{
                    backgroundColor: "rgba(46,108,246,0.1)",
                    border: "1px solid rgba(46,108,246,0.2)",
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "#00D084" }} />
                  <span className="text-xs sm:text-sm font-medium text-gray-300">
                    La solution comptable des micro-entrepreneurs
                  </span>
                </div>
              </FadeIn>

              {/* Titre principal */}
              <FadeIn delay={0.1} y={12} immediate={true}>
                <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl leading-tight px-2" style={{ color: "#ffffff" }}>
                  <span className="block mb-2" style={{ color: "#ffffff" }}>Votre comptabilité de micro-entrepreneur.</span>
                  <span 
                    className="block"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    Automatisée de A à Z.
                  </span>
                </h1>
              </FadeIn>


              {/* Sous-titre */}
              <FadeIn delay={0.2} y={12} immediate={true}>
                <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0" style={{ color: "#d1d5db" }}>
                  <span style={{ color: "#ffffff", fontWeight: "600" }}>L'IA vous aide à optimiser vos charges et éviter les erreurs</span>, sans tableur ni casse-tête.
                </p>
              </FadeIn>

              {/* Bullets sous le hero */}
              <FadeIn delay={0.25} y={12} immediate={true}>
                <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-2.5 max-w-2xl mx-auto lg:mx-0 px-4 sm:px-6 lg:px-0">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 208, 132, 0.15)" }}>
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: "#00D084" }} />
                    </div>
                    <span className="text-sm sm:text-base leading-snug flex-1" style={{ color: "#d1d5db" }}>Calcul automatique des cotisations & pré-remplissage URSSAF</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(46, 108, 246, 0.15)" }}>
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: "#2E6CF6" }} />
                    </div>
                    <span className="text-sm sm:text-base leading-snug flex-1" style={{ color: "#d1d5db" }}>Factures pro, exports comptables & FEC en 1 clic</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 208, 132, 0.15)" }}>
                      <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: "#00D084" }} />
                    </div>
                    <span className="text-sm sm:text-base leading-snug flex-1" style={{ color: "#d1d5db" }}>Imports bancaires, automatisations & intégrations e-commerce</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(46, 108, 246, 0.15)" }}>
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: "#2E6CF6" }} />
                    </div>
                    <span className="text-sm sm:text-base leading-snug flex-1" style={{ color: "#d1d5db" }}>Statistiques avancées, budgets, projections & optimisation fiscale IA</span>
                  </div>
                </div>
              </FadeIn>

              {/* Call to Actions */}
              <FadeIn delay={0.3} y={12} immediate={true}>
                <div className="mt-8 sm:mt-10 flex flex-col items-center lg:items-start justify-center gap-3 px-4 lg:px-0">
                  {/* Badge de confiance au-dessus du CTA */}
                  <div className="mb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ 
                      backgroundColor: "rgba(0, 208, 132, 0.15)", 
                      color: "#00D084", 
                      border: "1px solid rgba(0, 208, 132, 0.3)" 
                    }}>
                      <span>✓</span>
                      <span>Plan gratuit – sans carte bancaire</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <ScaleOnHover>
                      <Link
                        href="/signup"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base sm:text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.10] hover:brightness-110 hover:shadow-2xl cursor-pointer active:scale-95 glow shadow-xl"
                        style={{
                          background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                          boxShadow: "0 12px 40px rgba(46,108,246,0.4)",
                        }}
                      >
                        <UserPlus className="w-5 h-5" />
                        Commencer gratuitement
                      </Link>
                    </ScaleOnHover>
                    <ScaleOnHover>
                      <Link
                        href="#demo"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base sm:text-lg font-medium transition-all duration-300 hover:scale-[1.05] hover:bg-gray-800/50 hover:shadow-lg cursor-pointer active:scale-95"
                        style={{ border: "1px solid #2b2f36", backgroundColor: "#14161b" }}
                      >
                        <Percent className="w-5 h-5" />
                        Voir une démo
                      </Link>
                    </ScaleOnHover>
                  </div>
                  
                  {/* Micro text sous les boutons */}
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 px-4 lg:px-0 text-center lg:text-left">
                    Créez votre compte en moins de 30 secondes • 5 simulations gratuites / mois
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* Colonne droite - Image des appareils mobiles */}
            <FadeIn delay={0.15} y={12} duration={0.6} immediate={true}>
              <div className="relative hidden lg:flex items-center justify-center lg:justify-end mt-8 lg:mt-0 order-first lg:order-last">
                <div className="relative w-full max-w-lg mx-auto lg:mx-0">
                  {/* Container avec effet de profondeur */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {/* Effet de lueur derrière les appareils */}
                    <div 
                      className="absolute inset-0 rounded-3xl blur-3xl opacity-30 -z-10"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,208,132,0.4) 0%, rgba(46,108,246,0.4) 100%)",
                        transform: "scale(1.2)",
                      }}
                    />
                    
                    {/* Badge intégré à l'image - Positionné en bas */}
                    <FadeIn delay={0.2} y={8} immediate={true}>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 shadow-2xl" 
                          style={{
                            background: "linear-gradient(135deg, rgba(0, 208, 132, 0.95) 0%, rgba(46, 108, 246, 0.95) 100%)",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            boxShadow: "0 8px 32px rgba(0, 208, 132, 0.5), 0 4px 16px rgba(46, 108, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <span className="text-lg font-bold" style={{ color: "#ffffff" }}>🏆</span>
                          <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                            Logiciel préféré des e-commerçants et micro entrepreneurs
                          </span>
                        </div>
                      </div>
                    </FadeIn>
                    
                    {/* Image des appareils mobiles */}
                    <div className="relative z-10">
                      <Image
                        src="/devices-mockup.png"
                        alt="Application Comptalyze - Dashboard sur tablette et ordinateur portable montrant les métriques financières et projections"
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-2xl drop-shadow-2xl object-contain"
                        priority
                        style={{
                          filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Social Proof */}
          <FadeIn delay={0.4} y={12} duration={0.5}>
            <div className="mt-12 mx-auto max-w-4xl text-center">
              <div 
                className="relative rounded-2xl p-6 sm:p-8 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(0,208,132,0.08) 0%, rgba(46,108,246,0.08) 100%)",
                  border: "1px solid rgba(46,108,246,0.2)",
                  boxShadow: "0 8px 32px rgba(46,108,246,0.1)",
                }}
              >
                {/* Gradient accent line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                />
                
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
                  {/* Left side - Icon and text */}
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-3 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,208,132,0.15) 0%, rgba(46,108,246,0.15) 100%)",
                        border: "1px solid rgba(46,108,246,0.3)",
                      }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: "#00D084" }} />
                    </motion.div>
                    <div className="text-left">
                      <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wide">
                        Chiffre d'affaires déclaré
                      </p>
                      <p className="text-sm sm:text-base text-gray-300 mt-0.5">
                        par nos utilisateurs
                      </p>
                    </div>
                  </div>

                  {/* Center - Divider */}
                  <div className="hidden sm:block w-px h-12" style={{ backgroundColor: "rgba(46,108,246,0.2)" }} />

                  {/* Right side - Counter */}
                  <div className="text-center sm:text-left">
                    <div className="flex items-baseline justify-center sm:justify-start gap-2">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent" 
                        style={{
                          backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        }}>
                        <Counter to={10000000} />
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">
                      et ce chiffre continue de croître
                    </p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div 
                  className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, #2E6CF6 0%, transparent 70%)",
                  }}
                />
                <div 
                  className="absolute -top-4 -left-4 md:-top-8 md:-left-8 w-20 h-20 md:w-24 md:h-24 rounded-full blur-2xl opacity-15 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, #00D084 0%, transparent 70%)",
                  }}
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CALCULATEUR URSSAF DEMO */}
      <section id="demo" className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <FadeIn delay={0} y={12} duration={0.5}>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white">
                Testez notre calculateur URSSAF
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                Calculez vos cotisations et votre net en quelques secondes. Aucune inscription requise pour cette démo.
              </p>
            </div>
          </FadeIn>

          <UrssafCalculatorDemo />
        </div>
      </section>

      {/* APP PREVIEWS SECTION */}
      <LandingPreviewsSection />

      {/* FEATURES & TRUST */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <FadeIn delay={0} y={8} duration={0.5}>
            <h2 className="mb-8 text-center text-2xl font-semibold sm:text-3xl">
              Pourquoi choisir Comptalyze ?
            </h2>
          </FadeIn>
          
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Calculs automatisés - Fonctionnalité principale */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <div 
                    className="inline-flex items-center justify-center rounded-xl p-3 mb-4"
                    style={{ backgroundColor: "rgba(0,208,132,0.1)" }}
                  >
                    <Calculator className="w-6 h-6" style={{ color: "#00D084" }} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Calculs automatisés</h3>
                  <p className="text-sm text-gray-400">
                    Plus besoin de faire vos calculs à la main : cotisations URSSAF, TVA et net à payer calculés automatiquement.
                  </p>
                </div>
              </ScaleOnHover>
            </motion.div>

            {/* Factures professionnelles - Fonctionnalité clé */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <div 
                    className="inline-flex items-center justify-center rounded-xl p-3 mb-4"
                    style={{ backgroundColor: "rgba(46,108,246,0.1)" }}
                  >
                    <FileText className="w-6 h-6" style={{ color: "#2E6CF6" }} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Factures professionnelles</h3>
                  <p className="text-sm text-gray-400">
                    Créez et exportez des factures conformes en PDF. Toutes les mentions légales obligatoires incluses.
                  </p>
                </div>
              </ScaleOnHover>
            </motion.div>

            {/* 100% Conforme + Sécurité - Confiance */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <div 
                    className="inline-flex items-center justify-center rounded-xl p-3 mb-4"
                    style={{ backgroundColor: "rgba(0,208,132,0.1)" }}
                  >
                    <Shield className="w-6 h-6" style={{ color: "#00D084" }} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">100% Conforme & Sécurisé</h3>
                  <p className="text-sm text-gray-400">
                    Normes URSSAF & fiscales respectées. Données hébergées en France, chiffrées et conformes RGPD.
                  </p>
                </div>
              </ScaleOnHover>
            </motion.div>

            {/* Assistant IA - Différenciation Premium */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <div 
                    className="inline-flex items-center justify-center rounded-xl p-3 mb-4"
                    style={{ backgroundColor: "rgba(46,108,246,0.1)" }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: "#2E6CF6" }} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Assistant IA (Premium)</h3>
                  <p className="text-sm text-gray-400">
                    ComptaBot répond à vos questions comptables et vous conseille sur vos dépenses déductibles.
                  </p>
                </div>
              </ScaleOnHover>
            </motion.div>

            {/* Note 4.9/5 - Preuve sociale */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <div 
                    className="inline-flex items-center justify-center rounded-xl p-3 mb-4"
                    style={{ backgroundColor: "rgba(251,191,36,0.1)" }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: "#fbbf24" }} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Note 4.9/5</h3>
                  <p className="text-sm text-gray-400">
                    847+ utilisateurs actifs nous font confiance pour gérer leur comptabilité au quotidien.
                  </p>
                </div>
              </ScaleOnHover>
            </motion.div>

            {/* Sans engagement - Rassurant */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <div 
                    className="inline-flex items-center justify-center rounded-xl p-3 mb-4"
                    style={{ backgroundColor: "rgba(0,208,132,0.1)" }}
                  >
                    <Check className="w-6 h-6" style={{ color: "#00D084" }} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Sans engagement</h3>
                  <p className="text-sm text-gray-400">
                    Annulation à tout moment. Commencez gratuitement et testez toutes les fonctionnalités sans risque.
                  </p>
                </div>
              </ScaleOnHover>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ASSISTANT IA PREMIUM - CHATBOT DEMO */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <FadeIn delay={0} y={12} duration={0.5}>
            <div className="text-center mb-10">
              {/* Badge Premium */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" 
                style={{
                  backgroundColor: "rgba(0, 208, 132, 0.1)",
                  border: "1px solid rgba(0, 208, 132, 0.3)"
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "#00D084" }} />
                <span className="text-sm font-medium" style={{ color: "#00D084" }}>
                  FONCTIONNALITÉ PREMIUM
                </span>
              </div>
              
              <h2 className="text-2xl font-semibold sm:text-3xl mb-3 text-white">
                ComptaBot : Votre assistant IA comptable personnalisé
              </h2>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
                Posez vos questions en langage naturel, ComptaBot vous répond instantanément 
                avec des conseils personnalisés basés sur votre situation réelle.
              </p>
            </div>
          </FadeIn>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Container avec effet glow */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(0, 208, 132, 0.2)",
                boxShadow: "0 0 60px rgba(0, 208, 132, 0.1)"
              }}
            >
              {/* Image du chatbot */}
              <Image
                src="/chatbot-demo.svg"
                alt="Interface du chatbot ComptaBot répondant à une question sur les charges déductibles"
                width={800}
                height={535}
                className="w-full h-auto"
                loading="lazy"
                quality={90}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>

            {/* Points clés autour de l'image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -left-4 top-1/4 hidden lg:block"
            >
              <div 
                className="rounded-xl p-4 backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(22, 24, 29, 0.95)",
                  border: "1px solid rgba(0, 208, 132, 0.3)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
                }}
              >
                <div className="text-sm font-medium text-white mb-1">💬 Réponses instantanées</div>
                <div className="text-xs text-gray-400">24/7 disponible</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -right-4 top-1/2 hidden lg:block"
            >
              <div 
                className="rounded-xl p-4 backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(22, 24, 29, 0.95)",
                  border: "1px solid rgba(46, 108, 246, 0.3)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
                }}
              >
                <div className="text-sm font-medium text-white mb-1">🎯 Conseils personnalisés</div>
                <div className="text-xs text-gray-400">Adapté à votre activité</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 hidden md:block"
            >
              <div 
                className="rounded-xl p-4 backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(22, 24, 29, 0.95)",
                  border: "1px solid rgba(0, 208, 132, 0.3)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
                }}
              >
                <div className="text-sm font-medium text-white mb-1">🧠 IA formée sur la fiscalité française</div>
                <div className="text-xs text-gray-400">Réponses fiables et à jour</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bénéfices du chatbot */}
          <div className="mt-12 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            <FadeIn delay={0.6} y={12}>
              <div className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Réponses instantanées</h3>
                <p className="text-sm text-gray-400">
                  Plus besoin d&apos;attendre : posez votre question et obtenez une réponse détaillée en quelques secondes.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.7} y={12}>
              <div className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Expert comptable virtuel</h3>
                <p className="text-sm text-gray-400">
                  Formé sur la législation française, il vous guide sur les charges déductibles, la TVA et les déclarations.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.8} y={12}>
              <div className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Optimisez vos charges</h3>
                <p className="text-sm text-gray-400">
                  Découvrez les dépenses déductibles que vous ne connaissiez pas et réduisez vos impôts légalement.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* CTA Premium */}
          <div className="mt-10 text-center">
            <FadeIn delay={0.9} y={12}>
              <div className="inline-flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/signup?plan=premium"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 hover:shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                  Essayer ComptaBot (Premium)
                </Link>
                <span className="text-sm text-gray-400">
                  Ou démarrer avec le plan gratuit
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION ÉDUCATIVE - MICRO-ENTREPRISE */}
      <section className="relative px-4 pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-10 md:pb-20">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
          <FadeIn delay={0} y={8} duration={0.5}>
            <h2 className="mb-3 text-center text-2xl font-semibold sm:text-3xl">
              Tout savoir sur la micro-entreprise
            </h2>
            <p className="mb-12 text-center text-gray-400 sm:text-lg">
              Les points essentiels pour bien gérer votre activité.
            </p>
          </FadeIn>
          
          {/* Barre d'onglets horizontaux */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-0">
            <button 
              onClick={() => setActiveTab("taux-cotisations")}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative" 
              style={{ color: activeTab === "taux-cotisations" ? "#2E6CF6" : "#9ca3af" }}
            >
              <Percent className="w-5 h-5" strokeWidth={1.5} style={{ color: activeTab === "taux-cotisations" ? "#2E6CF6" : "#9ca3af" }} />
              <span>Taux de cotisations</span>
              {activeTab === "taux-cotisations" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: "#2E6CF6" }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab("plafonds-ca")}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative hover:opacity-80" 
              style={{ color: activeTab === "plafonds-ca" ? "#2E6CF6" : "#9ca3af" }}
            >
              <BarChart3 className="w-5 h-5" strokeWidth={1.5} style={{ color: activeTab === "plafonds-ca" ? "#2E6CF6" : "#9ca3af" }} />
              <span>Plafonds de chiffre d'affaires</span>
              {activeTab === "plafonds-ca" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: "#2E6CF6" }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab("obligations")}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative hover:opacity-80" 
              style={{ color: activeTab === "obligations" ? "#2E6CF6" : "#9ca3af" }}
            >
              <FileText className="w-5 h-5" strokeWidth={1.5} style={{ color: activeTab === "obligations" ? "#2E6CF6" : "#9ca3af" }} />
              <span>Obligations déclaratives</span>
              {activeTab === "obligations" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: "#2E6CF6" }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab("exemple")}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative hover:opacity-80" 
              style={{ color: activeTab === "exemple" ? "#2E6CF6" : "#9ca3af" }}
            >
              <Calculator className="w-5 h-5" strokeWidth={1.5} style={{ color: activeTab === "exemple" ? "#2E6CF6" : "#9ca3af" }} />
              <span>Exemple concret</span>
              {activeTab === "exemple" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: "#2E6CF6" }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab("tva")}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative hover:opacity-80" 
              style={{ color: activeTab === "tva" ? "#2E6CF6" : "#9ca3af" }}
            >
              <Percent className="w-5 h-5" strokeWidth={1.5} style={{ color: activeTab === "tva" ? "#2E6CF6" : "#9ca3af" }} />
              <span>TVA et franchise en base</span>
              {activeTab === "tva" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: "#2E6CF6" }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab("impot")}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative hover:opacity-80" 
              style={{ color: activeTab === "impot" ? "#2E6CF6" : "#9ca3af" }}
            >
              <Wallet className="w-5 h-5" strokeWidth={1.5} style={{ color: activeTab === "impot" ? "#2E6CF6" : "#9ca3af" }} />
              <span>Impôt sur le revenu — Versement libératoire</span>
              {activeTab === "impot" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: "#2E6CF6" }} />
              )}
            </button>
          </div>
          
          {/* Contenu des cartes selon l'onglet actif */}
          <AnimatePresence mode="wait">
            {activeTab === "taux-cotisations" && (
              <motion.div
                key="taux-cotisations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <motion.div 
                  className="relative rounded-xl p-8 transition-all cursor-default max-w-2xl w-full"
                  style={{ 
                    backgroundColor: "#16181d",
                    border: "1px solid #1f232b",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  <h3 className="mb-4 text-xl font-semibold text-white">Taux de cotisations</h3>
                  <p className="mb-6 text-base text-gray-300 leading-relaxed">
                    Les cotisations sociales en micro-entreprise sont calculées selon un <strong className="text-white">taux forfaitaire</strong> appliqué directement sur votre chiffre d'affaires encaissé. Pas de comptabilité compliquée : vous payez un pourcentage fixe de vos recettes.
                  </p>
                  
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)", border: "1px solid rgba(0, 208, 132, 0.2)" }}>
                      <div className="text-2xl font-bold text-white mb-1">12,3%</div>
                      <div className="text-sm text-gray-400">Ventes de marchandises</div>
                      <div className="text-xs text-gray-500 mt-1">BIC - Vente</div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)", border: "1px solid rgba(46, 108, 246, 0.2)" }}>
                      <div className="text-2xl font-bold text-white mb-1">21,1%</div>
                      <div className="text-sm text-gray-400">Activités libérales</div>
                      <div className="text-xs text-gray-500 mt-1">BNC - Libéral</div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                      <div className="text-2xl font-bold text-white mb-1">21,2%</div>
                      <div className="text-sm text-gray-400">Prestations de services</div>
                      <div className="text-xs text-gray-500 mt-1">BIC - Service</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.05)", border: "1px solid rgba(0, 208, 132, 0.15)" }}>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">💡 Bon à savoir :</strong> Ces taux incluent toutes les cotisations sociales (retraite, maladie, famille, formation professionnelle). Le calcul est automatique avec Comptalyze dès la saisie de votre CA.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "plafonds-ca" && (
              <motion.div
                key="plafonds-ca"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <motion.div 
                  className="relative rounded-xl p-8 transition-all cursor-default max-w-2xl w-full"
                  style={{ 
                    backgroundColor: "#16181d",
                    border: "1px solid #1f232b",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  <h3 className="mb-4 text-xl font-semibold text-white">Plafonds de chiffre d'affaires</h3>
                  <p className="mb-6 text-base text-gray-300 leading-relaxed">
                    Le régime micro-entreprise impose des <strong className="text-white">plafonds annuels de chiffre d'affaires</strong>. Si vous dépassez ces seuils, vous basculez automatiquement vers le régime réel simplifié l'année suivante.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-5 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)", border: "1px solid rgba(0, 208, 132, 0.2)" }}>
                      <div className="text-3xl font-bold text-white mb-2">77 700 €</div>
                      <div className="text-base font-medium text-gray-300 mb-2">Prestations de services</div>
                      <div className="text-sm text-gray-400">BIC - Services (BIC) et activités libérales (BNC)</div>
                    </div>
                    <div className="p-5 rounded-lg" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)", border: "1px solid rgba(46, 108, 246, 0.2)" }}>
                      <div className="text-3xl font-bold text-white mb-2">188 700 €</div>
                      <div className="text-base font-medium text-gray-300 mb-2">Ventes de marchandises</div>
                      <div className="text-sm text-gray-400">BIC - Vente et fourniture de logement</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">⚠️ Attention :</strong> Si vous dépassez le plafond, vous devez tenir une comptabilité complète et déclarer la TVA. Comptalyze vous alerte automatiquement lorsque vous approchez des seuils.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.05)", border: "1px solid rgba(0, 208, 132, 0.15)" }}>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">💡 Astuce :</strong> En cas d'activité mixte (ventes + services), le plafond applicable est celui des ventes (188 700 €) si les ventes représentent plus de 50% du CA total.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "obligations" && (
              <motion.div
                key="obligations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <motion.div 
                  className="relative rounded-xl p-8 transition-all cursor-default max-w-2xl w-full"
                  style={{ 
                    backgroundColor: "#16181d",
                    border: "1px solid #1f232b",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  <h3 className="mb-4 text-xl font-semibold text-white">Obligations déclaratives</h3>
                  <p className="mb-6 text-base text-gray-300 leading-relaxed">
                    En tant que micro-entrepreneur, vous avez des <strong className="text-white">obligations déclaratives</strong> à respecter. Le non-respect peut entraîner des pénalités et des majorations.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)", border: "1px solid rgba(46, 108, 246, 0.2)" }}>
                      <div className="text-base font-semibold text-white mb-2">📅 Déclaration URSSAF</div>
                      <div className="text-sm text-gray-300 mb-1">• <strong>Mensuelle</strong> : avant le dernier jour du mois suivant</div>
                      <div className="text-sm text-gray-300 mb-1">• <strong>Trimestrielle</strong> : avant le dernier jour du mois suivant le trimestre</div>
                      <div className="text-xs text-gray-400 mt-2">Vous pouvez choisir votre fréquence lors de la création de votre activité</div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)", border: "1px solid rgba(0, 208, 132, 0.2)" }}>
                      <div className="text-base font-semibold text-white mb-2">🏦 Compte bancaire dédié</div>
                      <div className="text-sm text-gray-300">
                        Obligatoire si votre CA dépasse <strong className="text-white">10 000 €</strong> sur deux années consécutives. 
                        Ce compte doit être utilisé exclusivement pour votre activité professionnelle.
                      </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                      <div className="text-base font-semibold text-white mb-2">📊 Tenue d'un livre des recettes</div>
                      <div className="text-sm text-gray-300">
                        Vous devez tenir un registre chronologique de toutes vos recettes avec les dates, montants et moyens de paiement.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">⚠️ Sanctions :</strong> En cas de déclaration tardive, vous encourez une majoration de 10% des cotisations dues, plus 0,4% par mois de retard.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "exemple" && (
              <motion.div
                key="exemple"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <motion.div 
                  className="relative rounded-xl p-8 transition-all cursor-default max-w-2xl w-full"
                  style={{ 
                    backgroundColor: "#16181d",
                    border: "1px solid #1f232b",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  <h3 className="mb-4 text-xl font-semibold text-white">Exemple concret</h3>
                  <p className="mb-6 text-base text-gray-300 leading-relaxed">
                    Voici des exemples de calculs pour mieux comprendre le fonctionnement du régime micro-entreprise :
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="p-5 rounded-lg" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)", border: "1px solid rgba(46, 108, 246, 0.2)" }}>
                      <div className="text-base font-semibold text-white mb-3">💼 Activité libérale (BNC)</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Chiffre d'affaires :</span>
                          <span className="text-white font-semibold">2 000 €</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Taux de cotisations (21,1%) :</span>
                          <span className="text-white font-semibold">424 €</span>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between items-center">
                          <span className="text-gray-300 font-medium">Revenu net :</span>
                          <span className="text-white font-bold text-lg">1 576 €</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)", border: "1px solid rgba(0, 208, 132, 0.2)" }}>
                      <div className="text-base font-semibold text-white mb-3">🛒 Vente de marchandises (BIC)</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Chiffre d'affaires :</span>
                          <span className="text-white font-semibold">5 000 €</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Taux de cotisations (12,3%) :</span>
                          <span className="text-white font-semibold">615 €</span>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between items-center">
                          <span className="text-gray-300 font-medium">Revenu net :</span>
                          <span className="text-white font-bold text-lg">4 385 €</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-lg" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                      <div className="text-base font-semibold text-white mb-3">🔧 Prestations de services (BIC)</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Chiffre d'affaires :</span>
                          <span className="text-white font-semibold">3 500 €</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Taux de cotisations (21,2%) :</span>
                          <span className="text-white font-semibold">742 €</span>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between items-center">
                          <span className="text-gray-300 font-medium">Revenu net :</span>
                          <span className="text-white font-bold text-lg">2 758 €</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.05)", border: "1px solid rgba(0, 208, 132, 0.15)" }}>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">💡 Note :</strong> Ces calculs sont automatiques avec Comptalyze. Il vous suffit de saisir votre CA et le système calcule instantanément vos cotisations et votre revenu net.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "tva" && (
              <motion.div
                key="tva"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <motion.div 
                  className="relative rounded-xl p-8 transition-all cursor-default max-w-2xl w-full"
                  style={{ 
                    backgroundColor: "#16181d",
                    border: "1px solid #1f232b",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  <h3 className="mb-4 text-xl font-semibold text-white">TVA et franchise en base</h3>
                  <p className="mb-6 text-base text-gray-300 leading-relaxed">
                    La <strong className="text-white">franchise en base de TVA</strong> vous permet de ne pas facturer la TVA à vos clients tant que vous restez sous certains seuils. C'est un avantage important pour rester compétitif.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-5 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)", border: "1px solid rgba(0, 208, 132, 0.2)" }}>
                      <div className="text-2xl font-bold text-white mb-2">36 800 €</div>
                      <div className="text-base font-medium text-gray-300 mb-2">Prestations de services</div>
                      <div className="text-sm text-gray-400">BIC - Services et activités libérales (BNC)</div>
                    </div>
                    <div className="p-5 rounded-lg" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)", border: "1px solid rgba(46, 108, 246, 0.2)" }}>
                      <div className="text-2xl font-bold text-white mb-2">91 900 €</div>
                      <div className="text-base font-medium text-gray-300 mb-2">Ventes de marchandises</div>
                      <div className="text-sm text-gray-400">BIC - Vente et fourniture de logement</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                    <div className="text-base font-semibold text-white mb-2">⚠️ Dépassement des seuils</div>
                    <p className="text-sm text-gray-300">
                      Si vous dépassez le seuil, vous devez <strong className="text-white">facturer la TVA dès le mois de dépassement</strong> et pour toute l'année suivante. 
                      Vous devez également tenir une comptabilité complète et déclarer la TVA mensuellement ou trimestriellement.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.05)", border: "1px solid rgba(0, 208, 132, 0.15)" }}>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">💡 Comptalyze vous protège :</strong> Notre système vous alerte automatiquement lorsque vous approchez des seuils de TVA, vous permettant d'anticiper et de vous préparer à la transition.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "impot" && (
              <motion.div
                key="impot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <motion.div 
                  className="relative rounded-xl p-8 transition-all cursor-default max-w-2xl w-full"
                  style={{ 
                    backgroundColor: "#16181d",
                    border: "1px solid #1f232b",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  <h3 className="mb-4 text-xl font-semibold text-white">Impôt sur le revenu — Versement libératoire</h3>
                  <p className="mb-6 text-base text-gray-300 leading-relaxed">
                    Le <strong className="text-white">versement libératoire</strong> vous permet de payer l'impôt sur le revenu en même temps que vos cotisations sociales, directement sur votre CA. 
                    C'est une option intéressante si vous êtes dans certaines tranches d'imposition.
                  </p>
                  
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)", border: "1px solid rgba(0, 208, 132, 0.2)" }}>
                      <div className="text-2xl font-bold text-white mb-1">1%</div>
                      <div className="text-sm text-gray-400">Ventes de marchandises</div>
                      <div className="text-xs text-gray-500 mt-1">BIC - Vente</div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)", border: "1px solid rgba(46, 108, 246, 0.2)" }}>
                      <div className="text-2xl font-bold text-white mb-1">1,7%</div>
                      <div className="text-sm text-gray-400">Services BIC</div>
                      <div className="text-xs text-gray-500 mt-1">BIC - Service</div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                      <div className="text-2xl font-bold text-white mb-1">2,2%</div>
                      <div className="text-sm text-gray-400">Activités libérales</div>
                      <div className="text-xs text-gray-500 mt-1">BNC - Libéral</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "rgba(46, 108, 246, 0.1)", border: "1px solid rgba(46, 108, 246, 0.2)" }}>
                    <div className="text-base font-semibold text-white mb-2">📋 Conditions d'éligibilité</div>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>Revenu fiscal de référence (RFR) inférieur à un certain seuil</li>
                      <li>Revenu fiscal de référence du foyer fiscal inférieur au plafond</li>
                      <li>Option à exercer avant le 1er janvier de l'année concernée</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">⚠️ Important :</strong> Ces taux s'ajoutent aux cotisations sociales. 
                      Le versement libératoire n'est pas toujours avantageux selon votre situation fiscale. 
                      Il est recommandé de comparer avec le régime classique.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(0, 208, 132, 0.05)", border: "1px solid rgba(0, 208, 132, 0.15)" }}>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">💡 Comptalyze vous aide :</strong> Notre simulateur compare automatiquement le versement libératoire avec le régime classique selon votre CA et votre situation, pour vous aider à faire le meilleur choix.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* BEFORE/AFTER COMPARISON */}
      <BeforeAfterSection />

      {/* AUTOMATISATION SHOPIFY/STRIPE - ROI SECTION */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <FadeIn delay={0} y={12}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" 
                style={{
                  backgroundColor: "rgba(0, 208, 132, 0.1)",
                  border: "1px solid rgba(0, 208, 132, 0.3)"
                }}
              >
                <Zap className="w-4 h-4" style={{ color: "#00D084" }} />
                <span className="text-sm font-semibold" style={{ color: "#00D084" }}>Premium Feature</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Import Automatique Shopify / Stripe
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                <strong className="text-white">Fini la saisie manuelle.</strong> Votre CA est importé, agrégé et envoyé par email chaque fin de mois. 
                <span className="text-[#00D084]"> Économisez 1h15/mois.</span>
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
            {/* Comment ça marche */}
            <FadeIn delay={0.2} y={12}>
              <div className="rounded-2xl p-5 sm:p-6 lg:p-8" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00D084, #2E6CF6)" }}>
                    <span className="text-white font-bold">1</span>
                  </div>
                  Comment ça marche ?
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(0, 208, 132, 0.2)" }}>
                      <Check className="w-4 h-4" style={{ color: "#00D084" }} />
                    </div>
                    <div>
                      <strong className="text-white">Connectez en 1 clic</strong>
                      <div className="text-sm text-gray-400 mt-1">OAuth sécurisé Shopify/Stripe. Vos tokens sont chiffrés (AES-256).</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(0, 208, 132, 0.2)" }}>
                      <Check className="w-4 h-4" style={{ color: "#00D084" }} />
                    </div>
                    <div>
                      <strong className="text-white">Sync automatique</strong>
                      <div className="text-sm text-gray-400 mt-1">Dernier jour du mois à 23h : le système récupère toutes vos transactions.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(0, 208, 132, 0.2)" }}>
                      <Check className="w-4 h-4" style={{ color: "#00D084" }} />
                    </div>
                    <div>
                      <strong className="text-white">Enregistrement + Email</strong>
                      <div className="text-sm text-gray-400 mt-1">CA total calculé, enregistré dans Comptalyze + email récap envoyé.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(0, 208, 132, 0.2)" }}>
                      <Check className="w-4 h-4" style={{ color: "#00D084" }} />
                    </div>
                    <div>
                      <strong className="text-white">Pré-remplissage URSSAF</strong>
                      <div className="text-sm text-gray-400 mt-1">Vos déclarations sont pré-remplies. Vous gagnez 15 min à chaque fois.</div>
                    </div>
                  </li>
                </ul>
              </div>
            </FadeIn>

            {/* ROI Calculator */}
            <FadeIn delay={0.4} y={12}>
              <div className="rounded-2xl p-5 sm:p-6 lg:p-8" style={{ background: "linear-gradient(135deg, rgba(0, 208, 132, 0.1), rgba(46, 108, 246, 0.1))", border: "1px solid rgba(0, 208, 132, 0.3)" }}>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00D084, #2E6CF6)" }}>
                    <span className="text-white">💰</span>
                  </div>
                  Calcul du ROI
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-gray-300">Saisie manuelle CA</span>
                      <span className="text-white font-bold">30 min/mois</span>
                    </div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-gray-300">Déclarations URSSAF</span>
                      <span className="text-white font-bold">30 min/mois</span>
                    </div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-gray-300">Vérifications/exports</span>
                      <span className="text-white font-bold">15 min/mois</span>
                    </div>
                    <div className="h-px my-4" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-lg font-semibold text-white">Total économisé</span>
                      <span className="text-2xl font-bold text-[#00D084]">1h15/mois</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(0, 208, 132, 0.1)" }}>
                    <div className="text-sm text-gray-300 mb-2">Sur 1 an :</div>
                    <div className="text-3xl font-bold text-white mb-1">15 heures économisées</div>
                    <div className="text-sm text-gray-400">
                      Valeur : <span className="text-white font-semibold">375€</span> (à 25€/h)
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <div className="text-sm text-gray-400 mb-2">Prix Premium : 7,90€/mois</div>
                    <div className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #00D084, #2E6CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      Rentabilisé en 2 semaines
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Email Preview */}
          <FadeIn delay={0.6} y={12}>
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-4">Email mensuel automatique</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 px-4">Chaque fin de mois, recevez un récap de votre CA importé</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid #1f232b" }}>
                {/* Email Header */}
                <div className="p-4 sm:p-6 text-center" style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}>
                  <h4 className="text-xl sm:text-2xl font-bold text-white mb-1">✅ CA Importé !</h4>
                  <p className="text-sm sm:text-base text-white/90">janvier 2025</p>
                </div>
                {/* Email Body */}
                <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#14161b" }}>
                  <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">Bonjour ! 👋</p>
                  <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">Votre chiffre d'affaires du mois de <strong className="text-white">janvier 2025</strong> a été importé automatiquement.</p>
                  
                  <div className="p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 text-center" style={{ background: "linear-gradient(135deg, rgba(0, 208, 132, 0.1), rgba(46, 108, 246, 0.1))", border: "1px solid rgba(0, 208, 132, 0.3)" }}>
                    <div className="text-xs sm:text-sm text-gray-400 mb-2 uppercase tracking-wide">CA Total</div>
                    <div className="text-3xl sm:text-4xl font-bold" style={{ background: "linear-gradient(135deg, #00D084, #2E6CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      4 700 €
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <div className="text-sm font-semibold text-white mb-2 sm:mb-3">Détails par source</div>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: "#1a1d24" }}>
                        <span className="text-gray-300">🛒 Shopify</span>
                        <span className="font-semibold text-white">3 500 €</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: "#1a1d24" }}>
                        <span className="text-gray-300">💳 Stripe</span>
                        <span className="font-semibold text-white">1 200 €</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="px-6 py-3 rounded-lg text-white font-semibold text-sm sm:text-base min-h-[48px]" style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}>
                      Voir mon dashboard
                    </button>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t text-xs sm:text-sm text-gray-400 text-center" style={{ borderColor: "#1f232b" }}>
                    💡 <strong>Astuce :</strong> Ces données sont déjà pré-remplies dans votre simulateur URSSAF !
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* CTA Final */}
          <FadeIn delay={0.8} y={12}>
            <div className="text-center mt-12">
              <Link
                href="/signup?plan=premium"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                }}
              >
                <Sparkles className="w-5 h-5" />
                Passer à Premium dès 7,90 €/mois
              </Link>
              <p className="text-sm text-gray-400 mt-4">
                Paiement sécurisé • Annulation en 1 clic
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <FadeIn delay={0} y={8} duration={0.5}>
            {/* Badge Offre spéciale */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full font-medium animate-pulse" style={{ backgroundColor: "rgba(0, 208, 132, 0.15)", color: "#00D084", border: "1px solid rgba(0, 208, 132, 0.3)" }}>
                🚀 Offre de lancement - Jusqu'à -60% !
              </span>
            </div>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Des plans adaptés à votre activité
            </h2>
            <p className="mt-3 text-gray-300">Profitez de nos prix réduits pour nos premiers clients.</p>
          </FadeIn>
        </div>

        <Stagger className="mx-auto mt-10 grid max-w-6xl gap-6 px-0 sm:grid-cols-2 lg:grid-cols-3">
          {/* Gratuit */}
          <motion.div variants={fadeInVariant}>
            <ScaleOnHover>
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                <div className="mb-3">
                  <div className="mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide">Gratuit</div>
                  <div className="text-xs font-medium" style={{ color: "#00D084" }}>Free forever</div>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">0 €</span>
                  <span className="text-gray-400">/mois</span>
                  <p className="text-xs text-gray-500 mt-2">Parfait pour commencer à suivre vos charges URSSAF en quelques clics.</p>
                </div>
                <div className="mb-4">
                  <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Fonctionnalités incluses</div>
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                      <span>5 simulations URSSAF sauvegardées / mois</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                      <span>Calcul en temps réel des cotisations et revenu net</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                      <span>Dashboard basique : CA, cotisations, revenu net (30 derniers jours)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                      <span>1 graphique CA (3 derniers mois)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                      <span>1 facture / mois (PDF téléchargeable)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                      <span>Accès à tous les guides et tutoriels</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 space-y-2">
                  <Link
                    href="/signup"
                    className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-[1.05] hover:shadow-lg"
                    style={{ 
                      border: "1px solid rgba(0, 208, 132, 0.3)", 
                      backgroundColor: "rgba(0, 208, 132, 0.1)",
                      color: "#00D084"
                    }}
                  >
                    Créer un compte gratuit
                  </Link>
                  <p className="text-xs text-center text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <span style={{ color: "#00D084" }}>✓</span>
                      Sans carte bancaire
                    </span>
                    {' • '}
                    <span>Création en moins de 30 secondes</span>
                  </p>
                </div>
              </div>
            </ScaleOnHover>
          </motion.div>

          {/* Pro (highlighted) */}
          <motion.div variants={fadeInVariant}>
            <ScaleOnHover>
              <div
                className="relative rounded-2xl p-6"
                style={{
                  backgroundColor: "#161922",
                  border: "1px solid rgba(46,108,246,0.55)",
                  boxShadow: "0 0 40px rgba(46,108,246,0.18)",
                }}
              >
                <div className="absolute right-4 top-4 flex gap-2">
                  <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                    🚀 -60%
                  </span>
                  <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: "#2E6CF6" }}>
                    Recommandé
                  </span>
                </div>
                <div className="mb-2 text-sm font-medium" style={{ color: "#60a5fa" }}>Pro</div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold">3,90 €</span>
                    <span className="text-xl text-gray-500 line-through">9,90 €</span>
                  </div>
                  <span className="text-gray-400">/mois</span>
                  <div className="mt-1 text-sm font-semibold" style={{ color: "#00D084" }}>
                    💰 Économisez 6 € par mois !
                  </div>
                </div>
                <div className="space-y-4 min-h-[280px]">
                  <div className="text-xs text-gray-500 mb-3">FONCTIONNALITÉS CLÉS</div>
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <span><strong>Simulations illimitées</strong></span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <span>Simulateur de TVA</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <span>Charges déductibles</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <span>Export Excel/CSV/PDF + FEC</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <span>Factures + Templates</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <span>Multi-comptes</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <span>Import bancaire</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <span>Règles automatiques</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleCheckout("pro")}
                  disabled={loading !== null}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                  }}
                >
                  {loading === "pro" ? "Redirection..." : "Passer à Pro"}
                </button>
              </div>
            </ScaleOnHover>
          </motion.div>

          {/* Premium */}
          <motion.div variants={fadeInVariant}>
            <ScaleOnHover>
              <div className="rounded-2xl p-6 relative" style={{ backgroundColor: "#14161b", border: "1px solid rgba(0,208,132,0.3)" }}>
                <div className="absolute right-4 top-4 flex gap-2">
                  <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: "#00D084", color: "#0e0f12" }}>
                    🚀 -56%
                  </span>
                  <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}>
                    Premium
                  </span>
                </div>
                <div className="mb-2 text-sm font-medium text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #00D084, #2E6CF6)" }}>
                  Premium
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold">7,90 €</span>
                    <span className="text-xl text-gray-500 line-through">17,90 €</span>
                  </div>
                  <span className="text-gray-400">/mois</span>
                  <div className="mt-1 text-sm font-semibold" style={{ color: "#00D084" }}>
                    💰 Économisez 10 € par mois !
                  </div>
                </div>
                <div className="space-y-4 min-h-[280px]">
                  <div className="text-xs text-gray-500 mb-3">TOUT PRO +</div>
                  
                  {/* ROI Highlight */}
                  <div className="mb-4 p-3 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(0, 208, 132, 0.15), rgba(46, 108, 246, 0.15))", border: "1px solid rgba(0, 208, 132, 0.3)" }}>
                    <div className="text-xs font-bold text-white mb-1">💰 VALEUR RÉELLE : 3 000€/an</div>
                    <div className="text-xs text-gray-300">120h économisées × 25€/h = <span className="text-[#00D084]">Rentabilisé dès le 1er mois</span></div>
                  </div>
                  
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <div>
                        <strong>Import auto Shopify/Stripe</strong>
                        <div className="text-xs text-gray-400">CA mensuel synchronisé + email récap</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <div>
                        <strong>ComptaBot IA personnalisé</strong>
                        <div className="text-xs text-gray-400">Expert-comptable 24/7 (valeur : 100€/h)</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <div>
                        <strong>Pré-remplissage URSSAF</strong>
                        <div className="text-xs text-gray-400">Fini la saisie manuelle (gain : 15 min/déclaration)</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <div>
                        <strong>Projections & Comparaisons</strong>
                        <div className="text-xs text-gray-400">Prévisions 3/6/12 mois + analyses</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <div>
                        <strong>Budgets & Rapports auto</strong>
                        <div className="text-xs text-gray-400">Planification + génération mensuelle</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <div>
                        <strong>Mode comptable</strong>
                        <div className="text-xs text-gray-400">Partage sécurisé avec expert-comptable</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 text-gray-200">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                      <div>
                        <strong>Optimisation fiscale IA</strong>
                        <div className="text-xs text-gray-400">Suggestions personnalisées = économies</div>
                      </div>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleCheckout("premium")}
                  disabled={loading !== null}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                  }}
                >
                  {loading === "premium" ? "Redirection..." : "Passer à Premium"}
                </button>
              </div>
            </ScaleOnHover>
          </motion.div>
        </Stagger>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* FAQ */}
      <FaqSection />

      {/* Sécurité des données */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn delay={0} y={12} duration={0.6}>
            <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
              <motion.div
                className="mb-4 flex justify-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Shield className="w-12 h-12 text-[#00D084]" />
              </motion.div>
              <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
                Sécurité des données
              </h2>
              <p className="text-sm text-gray-400 sm:text-base">
                Vos informations sont chiffrées et stockées de manière sécurisée. Nous respectons le RGPD et ne partageons jamais vos données avec des tiers.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Final */}
      <FadeIn delay={0} y={20} duration={0.6}>
        <section className="relative px-4 py-16 sm:py-20 md:py-24">
          <div 
            className="mx-auto max-w-4xl rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden glow"
            style={{
              background: "linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)",
              border: "1px solid rgba(46,108,246,0.3)",
              boxShadow: "0 8px 32px rgba(46,108,246,0.2)",
            }}
          >
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
              Prêt à simplifier votre comptabilité ?
            </h2>
            <p className="mb-8 text-gray-300 sm:text-lg">
              Rejoignez des milliers de micro-entrepreneurs qui font confiance à Comptalyze.
            </p>
            <ScaleOnHover>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-medium text-white transition-all duration-200 glow"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 8px 28px rgba(46,108,246,0.4)",
                  }}
                >
                  Commencer gratuitement
                </Link>
              </motion.div>
            </ScaleOnHover>
          </div>
        </section>
      </FadeIn>

      {/* Trust Badge - Données URSSAF */}
      <FadeIn delay={0} y={10} duration={0.5}>
        <section className="relative px-4 py-8 border-t" style={{ borderColor: "#1f232b" }}>
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: "#00D084" }} />
                <span>Basé sur les données officielles de l'URSSAF</span>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* FOOTER */}
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

      {/* Feedback Button Sticky */}
      <FeedbackButton />
    </main>
  );
}
