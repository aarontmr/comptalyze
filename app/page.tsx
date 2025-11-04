"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LayoutDashboard, LogIn, UserPlus, Shield, TrendingUp, Percent, BarChart3, FileText, Calculator, Lock, Info, Check } from "lucide-react";
import { FadeIn, Stagger, ScaleOnHover, fadeInVariant } from "@/app/components/anim/Motion";
import Counter from "@/app/components/anim/Counter";
import GradientBlob from "@/app/components/anim/GradientBlob";
import { motion } from "framer-motion";
import ExtraInfoCards from "@/app/components/landing/ExtraInfoCards";
import LandingPreviewsSection from "@/app/components/landing/LandingPreviewsSection";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

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

  const handleCheckout = async (plan: "pro" | "premium") => {
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      alert("Vous devez être connecté pour souscrire à un abonnement. Redirection vers la page de connexion...");
      window.location.href = "/login";
      return;
    }

    try {
      setLoading(plan);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Une erreur est survenue lors de la création de la session de paiement";
        alert(`Erreur: ${errorMessage}`);
        console.error("Erreur API checkout:", data);
        return;
      }

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("Erreur: Aucune URL de redirection reçue du serveur.");
        console.error("Réponse API sans URL:", data);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel API:", error);
      alert("Une erreur est survenue lors de la connexion au serveur. Vérifiez votre connexion internet.");
    } finally {
      setLoading(null);
    }
  };

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
                width={140}
                height={35}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                  }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      border: "1px solid #2b2f36",
                      backgroundColor: "#14161b",
                    }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{
                      border: "1px solid #2b2f36",
                      backgroundColor: "#14161b",
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

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
      <section className="relative px-4 pt-12 pb-8 sm:pt-16 sm:pb-10 md:pt-20 md:pb-12 overflow-hidden">
        <GradientBlob />
        <div className="mx-auto max-w-5xl text-center relative z-10">
          <FadeIn delay={0.1} y={12}>
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl leading-tight">
              Simplifiez votre comptabilité de micro-entrepreneur.
            </h1>
          </FadeIn>
          <FadeIn delay={0.2} y={12}>
            <p className="mt-4 text-base text-gray-300 sm:text-lg md:text-xl">
              Comptalyze calcule automatiquement vos cotisations URSSAF et vos projections de revenus, en quelques secondes.
            </p>
          </FadeIn>
          <FadeIn delay={0.3} y={12}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ScaleOnHover>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-200 glow"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                    boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                  }}
                >
                  Essayer gratuitement
                </Link>
              </ScaleOnHover>
              <ScaleOnHover>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors"
                  style={{ border: "1px solid #2b2f36", backgroundColor: "#14161b" }}
                >
                  Voir les tarifs
                </Link>
              </ScaleOnHover>
            </div>
          </FadeIn>

          {/* Social Proof */}
          <FadeIn delay={0.4} y={12} duration={0.5}>
            <div className="mt-12 mx-auto max-w-4xl">
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
                  className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, #2E6CF6 0%, transparent 70%)",
                  }}
                />
                <div 
                  className="absolute -top-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, #00D084 0%, transparent 70%)",
                  }}
                />
              </div>
            </div>
          </FadeIn>
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
          
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Carte 1: Taux de cotisations */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <motion.div 
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
                  {/* Gradient top border */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  
                  <div className="mt-2 mb-4">
                    <Percent 
                      className="w-6 h-6"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Taux de cotisations</h3>
                  <p className="text-sm text-gray-400">
                    <strong className="text-gray-300">12,3%</strong> pour les ventes, <strong className="text-gray-300">21,1%</strong> pour les activités libérales, <strong className="text-gray-300">21,2%</strong> pour les services.
                  </p>
                </motion.div>
              </ScaleOnHover>
            </motion.div>

            {/* Carte 2: Plafonds de CA */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <motion.div 
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
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  
                  <div className="mt-2 mb-4">
                    <BarChart3 
                      className="w-6 h-6"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Plafonds de chiffre d'affaires</h3>
                  <p className="text-sm text-gray-400">
                    <strong className="text-gray-300">77 700 €</strong> pour les services, <strong className="text-gray-300">188 700 €</strong> pour les ventes. Au-delà, vous basculez vers le régime réel simplifié.
                  </p>
                </motion.div>
              </ScaleOnHover>
            </motion.div>

            {/* Carte 3: Obligations */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <motion.div 
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
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  
                  <div className="mt-2 mb-4">
                    <FileText 
                      className="w-6 h-6"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Obligations déclaratives</h3>
                  <p className="text-sm text-gray-400">
                    Déclaration URSSAF mensuelle ou trimestrielle. Compte bancaire dédié obligatoire si CA &gt; 10 000 €/an.
                  </p>
                </motion.div>
              </ScaleOnHover>
            </motion.div>

            {/* Carte 4: Exemple concret */}
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <motion.div 
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
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                  
                  <div className="mt-2 mb-4">
                    <Calculator 
                      className="w-6 h-6"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Exemple concret</h3>
                  <p className="text-sm text-gray-400">
                    Avec <strong className="text-gray-300">2 000 €</strong> de CA (activité libérale) : <strong className="text-gray-300">424 €</strong> de cotisations, soit <strong className="text-gray-300">1 576 €</strong> net.
                  </p>
                </motion.div>
              </ScaleOnHover>
            </motion.div>

            {/* Nouvelles cartes 5 et 6 */}
            <ExtraInfoCards />
          </Stagger>
        </div>
      </section>

      {/* APP PREVIEWS SECTION */}
      <LandingPreviewsSection />

      {/* FEATURES */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <FadeIn delay={0} y={8} duration={0.5}>
            <h2 className="mb-8 text-center text-2xl font-semibold sm:text-3xl">
              Pourquoi choisir Comptalyze ?
            </h2>
          </FadeIn>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <motion.div 
                  className="rounded-xl p-5 transition-all cursor-default"
                  style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <motion.div 
                    className="mb-3 text-2xl"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    ⚙️
                  </motion.div>
                  <h3 className="mb-1 font-medium">Calcul automatique des cotisations</h3>
                  <p className="text-sm text-gray-400">Entrez votre chiffre d'affaires, Comptalyze fait le reste.</p>
                </motion.div>
              </ScaleOnHover>
            </motion.div>
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <motion.div 
                  className="rounded-xl p-5 transition-all cursor-default"
                  style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <motion.div 
                    className="mb-3 text-2xl"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    📊
                  </motion.div>
                  <h3 className="mb-1 font-medium">Projections précises</h3>
                  <p className="text-sm text-gray-400">Visualisez vos revenus nets et vos cotisations à venir.</p>
                </motion.div>
              </ScaleOnHover>
            </motion.div>
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <motion.div 
                  className="rounded-xl p-5 transition-all cursor-default"
                  style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <motion.div 
                    className="mb-3 text-2xl"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    🔒
                  </motion.div>
                  <h3 className="mb-1 font-medium">Données sécurisées</h3>
                  <p className="text-sm text-gray-400">Vos informations restent privées et chiffrées.</p>
                </motion.div>
              </ScaleOnHover>
            </motion.div>
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <motion.div 
                  className="rounded-xl p-5 transition-all cursor-default"
                  style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
                  whileHover={{ 
                    boxShadow: "0 8px 24px rgba(46,108,246,0.15)",
                    borderColor: "rgba(46,108,246,0.3)"
                  }}
                >
                  <motion.div 
                    className="mb-3 text-2xl"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    💡
                  </motion.div>
                  <h3 className="mb-1 font-medium">Simple et rapide</h3>
                  <p className="text-sm text-gray-400">Pensé pour les micro-entrepreneurs, sans jargon.</p>
                </motion.div>
              </ScaleOnHover>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <FadeIn delay={0} y={8} duration={0.5}>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Des plans adaptés à votre activité
            </h2>
            <p className="mt-3 text-gray-300">Commencez gratuitement, passez au Pro quand vous en avez besoin.</p>
          </FadeIn>
        </div>

        <Stagger className="mx-auto mt-10 grid max-w-6xl gap-6 px-0 sm:grid-cols-2 lg:grid-cols-3">
          {/* Gratuit */}
          <motion.div variants={fadeInVariant}>
            <ScaleOnHover>
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                <div className="mb-2 text-sm text-gray-400">Gratuit</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">0 €</span>
                  <span className="text-gray-400">/mois</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                    <span>3 simulations par mois</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                    <span>Accès au simulateur URSSAF</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                    <span>Calcul des cotisations</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6b7280" }} />
                    <span>Projection annuelle</span>
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm transition-transform duration-200 hover:scale-[1.02]"
                  style={{ border: "1px solid #2b2f36", backgroundColor: "#0e0f12" }}
                >
                  Commencer gratuitement
                </Link>
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
                <div className="absolute right-4 top-4 rounded-md px-2 py-1 text-xs font-medium" style={{ backgroundColor: "#2E6CF6" }}>
                  Recommandé
                </div>
                <div className="mb-2 text-sm font-medium" style={{ color: "#60a5fa" }}>Pro</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">5,90 €</span>
                  <span className="text-gray-400">/mois</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Tout le plan Gratuit</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Simulations illimitées</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Export PDF par e-mail</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Sauvegarde en ligne illimitée</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Gestion des factures</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Génération PDF de factures</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Envoi de factures par e-mail</span>
                  </li>
                </ul>
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
                <div className="absolute right-4 top-4 rounded-md px-2 py-1 text-xs font-medium" style={{ background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)" }}>
                  Premium
                </div>
                <div className="mb-2 text-sm font-medium text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #00D084, #2E6CF6)" }}>
                  Premium
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">9,90 €</span>
                  <span className="text-gray-400">/mois</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Tout le plan Pro</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Rappels URSSAF automatiques par e-mail</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Assistant IA personnalisé (chatbot flottant)</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Conseils IA basés sur vos données</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Graphiques d'évolution du chiffre d'affaires</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Pré-remplissage automatique URSSAF</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-200">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00D084" }} />
                    <span>Historique complet et analyses</span>
                  </li>
                </ul>
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
      <section className="relative px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <FadeIn delay={0} y={8} duration={0.5}>
            <h2 className="mb-8 text-center text-2xl font-semibold sm:text-3xl">
              Ils utilisent déjà Comptalyze
            </h2>
          </FadeIn>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-xl p-6 transition-all" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <p className="text-sm text-gray-300">"Interface claire et résultats fiables. Je gagne un temps fou."</p>
                  <div className="mt-4 text-xs text-gray-500">— Julie, Graphiste</div>
                </div>
              </ScaleOnHover>
            </motion.div>
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-xl p-6 transition-all" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <p className="text-sm text-gray-300">"Parfait pour suivre mes cotisations et anticiper mes revenus."</p>
                  <div className="mt-4 text-xs text-gray-500">— Karim, Développeur</div>
                </div>
              </ScaleOnHover>
            </motion.div>
            <motion.div variants={fadeInVariant}>
              <ScaleOnHover>
                <div className="rounded-xl p-6 transition-all" style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}>
                  <p className="text-sm text-gray-300">"Enfin un outil simple, sans jargon, adapté aux micro-entrepreneurs."</p>
                  <div className="mt-4 text-xs text-gray-500">— Lucie, Consultante</div>
                </div>
              </ScaleOnHover>
            </motion.div>
          </Stagger>
        </div>
      </section>

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
