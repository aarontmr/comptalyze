"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  LogIn,
  Menu,
  X,
  ChevronDown,
  Calculator,
  FileText,
  BarChart3,
  Database,
  ShoppingBag,
  Briefcase,
  Users,
  Store,
  BookOpen,
  HelpCircle,
  MessageCircle,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/public/logo.png";

// Structure de données de navigation
const navigationData = {
  fonctionnalites: {
    label: "Fonctionnalités",
    items: [
      {
        label: "Simulateur URSSAF",
        href: "/simulateur-urssaf",
        icon: Calculator,
        description: "Calculez vos cotisations en temps réel",
      },
      {
        label: "Factures",
        href: "/factures",
        icon: FileText,
        description: "Créez et gérez vos factures",
      },
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: BarChart3,
        description: "Vue d'ensemble de votre activité",
      },
      {
        label: "Statistiques",
        href: "/dashboard/statistiques",
        icon: BarChart3,
        description: "Analyses détaillées et projections",
      },
      {
        label: "Pré-remplissage URSSAF",
        href: "/dashboard/simulateur",
        icon: Database,
        description: "Déclarations pré-remplies automatiquement",
      },
    ],
  },
  pourQui: {
    label: "Pour qui ?",
    items: [
      {
        label: "E-commerce",
        href: "/pour-qui/e-commerce",
        icon: ShoppingBag,
        description: "Parfait pour les boutiques en ligne",
      },
      {
        label: "Freelances",
        href: "/pour-qui/freelances",
        icon: Briefcase,
        description: "Gérez votre activité freelance",
      },
      {
        label: "Micro-entrepreneurs",
        href: "/logiciel-micro-entreprise",
        icon: Users,
        description: "Solution complète pour micro-entrepreneurs",
      },
      {
        label: "Services",
        href: "/pour-qui/services",
        icon: Store,
        description: "Idéal pour les prestations de services",
      },
    ],
  },
  ressources: {
    label: "Ressources",
    items: [
      {
        label: "Blog",
        href: "/blog",
        icon: BookOpen,
        description: "Articles et guides comptables",
      },
      {
        label: "Guides micro-entreprise",
        href: "/blog/guide-comptabilite-micro-entreprise",
        icon: BookOpen,
        description: "Tout savoir sur la micro-entreprise",
      },
      {
        label: "Aide",
        href: "/dashboard/help",
        icon: HelpCircle,
        description: "Centre d'aide et support",
      },
      {
        label: "FAQ",
        href: "/faq",
        icon: MessageCircle,
        description: "Questions fréquentes",
      },
    ],
  },
  tarifs: {
    label: "Tarifs",
    href: "/pricing",
  },
};

interface HeaderProps {
  user?: any;
}

export default function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Détection du scroll pour le blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Nettoyer le timeout lors du démontage
  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownRefs.current).forEach((key) => {
        const ref = dropdownRefs.current[key];
        if (ref && !ref.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      });
    };

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeDropdown]);

  const handleDropdownToggle = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleDropdownMouseEnter = (key: string) => {
    // Annuler le timeout de fermeture si la souris revient
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setActiveDropdown(key);
  };

  const handleDropdownMouseLeave = (e: React.MouseEvent) => {
    // Vérifier si la souris quitte vraiment le conteneur (pas juste pour aller au menu)
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    // Si la souris va vers un élément enfant du conteneur, ne pas fermer
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    
    // Délai pour permettre la navigation vers le dropdown
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      leaveTimeoutRef.current = null;
    }, 400);
  };

  const handleDropdownContentMouseEnter = (key: string) => {
    // Annuler le timeout quand la souris entre dans le contenu du menu
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setActiveDropdown(key);
  };

  // Fonction pour obtenir le href en fonction de l'état de connexion
  const getHref = (originalHref: string, requiresAuth: boolean = false) => {
    if (requiresAuth && !user) {
      return "/login";
    }
    return originalHref;
  };

  // Vérifier si la bannière est visible
  const [bannerVisible, setBannerVisible] = useState(false);
  
  useEffect(() => {
    const checkBanner = () => {
      const banner = document.querySelector('[data-google-ads-banner]');
      setBannerVisible(banner !== null && banner.getBoundingClientRect().height > 0);
    };
    
    checkBanner();
    const interval = setInterval(checkBanner, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl border-b"
          : "border-b"
      } ${bannerVisible ? "top-[48px] sm:top-[56px]" : "top-0"}`}
      style={{
        backgroundColor: scrolled
          ? "rgba(13, 15, 20, 0.8)"
          : "#0D0F14",
        borderColor: "#1f232b",
      }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center z-50 flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Image
              src={logo}
              alt="Comptalyze"
              width={140}
              height={35}
              className="h-6 sm:h-7 md:h-8 lg:h-9 w-auto max-w-[100px] sm:max-w-[110px] md:max-w-[120px] lg:max-w-[140px] transition-opacity hover:opacity-90 object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Fonctionnalités */}
            <div
              className="relative"
              ref={(el) => { dropdownRefs.current["fonctionnalites"] = el; }}
              onMouseEnter={() => {
                if (leaveTimeoutRef.current) {
                  clearTimeout(leaveTimeoutRef.current);
                  leaveTimeoutRef.current = null;
                }
                setActiveDropdown("fonctionnalites");
              }}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                onClick={() => handleDropdownToggle("fonctionnalites")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
                style={{ color: "#FFFFFFCC" }}
              >
                {navigationData.fonctionnalites.label}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === "fonctionnalites" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {activeDropdown === "fonctionnalites" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-72 rounded-xl p-2 shadow-2xl"
                    style={{
                      backgroundColor: "#16181d",
                      border: "1px solid #1f232b",
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                      paddingTop: "8px",
                      marginTop: "0px",
                    }}
                    onMouseEnter={() => handleDropdownContentMouseEnter("fonctionnalites")}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    {navigationData.fonctionnalites.items.map((item, idx) => {
                      const Icon = item.icon;
                      // Les fonctionnalités nécessitent une authentification
                      const requiresAuth = true;
                      return (
                        <Link
                          key={idx}
                          href={getHref(item.href, requiresAuth)}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 group"
                        >
                          <div className="mt-0.5 p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                            <Icon className="w-4 h-4" style={{ color: "#00E676" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white mb-0.5">
                              {item.label}
                            </div>
                            <div className="text-xs" style={{ color: "#FFFFFF99" }}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pour qui ? */}
            <div
              className="relative"
              ref={(el) => { dropdownRefs.current["pourQui"] = el; }}
              onMouseEnter={() => {
                if (leaveTimeoutRef.current) {
                  clearTimeout(leaveTimeoutRef.current);
                  leaveTimeoutRef.current = null;
                }
                setActiveDropdown("pourQui");
              }}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                onClick={() => handleDropdownToggle("pourQui")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
                style={{ color: "#FFFFFFCC" }}
              >
                {navigationData.pourQui.label}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === "pourQui" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {activeDropdown === "pourQui" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-72 rounded-xl p-2 shadow-2xl"
                    style={{
                      backgroundColor: "#16181d",
                      border: "1px solid #1f232b",
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                      paddingTop: "8px",
                      marginTop: "0px",
                    }}
                    onMouseEnter={() => handleDropdownContentMouseEnter("pourQui")}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    {navigationData.pourQui.items.map((item, idx) => {
                      const Icon = item.icon;
                      // Les liens "Pour qui ?" sont publics
                      const requiresAuth = false;
                      return (
                        <Link
                          key={idx}
                          href={getHref(item.href, requiresAuth)}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 group"
                        >
                          <div className="mt-0.5 p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                            <Icon className="w-4 h-4" style={{ color: "#2979FF" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white mb-0.5">
                              {item.label}
                            </div>
                            <div className="text-xs" style={{ color: "#FFFFFF99" }}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ressources */}
            <div
              className="relative"
              ref={(el) => { dropdownRefs.current["ressources"] = el; }}
              onMouseEnter={() => {
                if (leaveTimeoutRef.current) {
                  clearTimeout(leaveTimeoutRef.current);
                  leaveTimeoutRef.current = null;
                }
                setActiveDropdown("ressources");
              }}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                onClick={() => handleDropdownToggle("ressources")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
                style={{ color: "#FFFFFFCC" }}
              >
                {navigationData.ressources.label}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === "ressources" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {activeDropdown === "ressources" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-72 rounded-xl p-2 shadow-2xl"
                    style={{
                      backgroundColor: "#16181d",
                      border: "1px solid #1f232b",
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                      paddingTop: "8px",
                      marginTop: "0px",
                    }}
                    onMouseEnter={() => handleDropdownContentMouseEnter("ressources")}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    {navigationData.ressources.items.map((item, idx) => {
                      const Icon = item.icon;
                      // "Aide" nécessite une authentification (dashboard), "FAQ" est publique
                      const requiresAuth = item.href === "/dashboard/help";
                      return (
                        <Link
                          key={idx}
                          href={getHref(item.href, requiresAuth)}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 group"
                        >
                          <div className="mt-0.5 p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                            <Icon className="w-4 h-4" style={{ color: "#00E676" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white mb-0.5">
                              {item.label}
                            </div>
                            <div className="text-xs" style={{ color: "#FFFFFF99" }}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tarifs */}
            <Link
              href={navigationData.tarifs.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
              style={{ color: "#FFFFFFCC" }}
            >
              <DollarSign className="w-4 h-4" />
              {navigationData.tarifs.label}
            </Link>

            {/* Séparateur */}
            <div className="h-6 w-px mx-2" style={{ backgroundColor: "#1f232b" }} />

            {/* Actions */}
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #00E676 0%, #2979FF 100%)",
                  boxShadow: "0 4px 15px rgba(41, 121, 255, 0.3)",
                }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/5"
                  style={{ color: "#FFFFFFCC" }}
                >
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #00E676 0%, #2979FF 100%)",
                    boxShadow: "0 4px 20px rgba(41, 121, 255, 0.4)",
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Commencer gratuitement
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg transition-all hover:bg-white/5 active:bg-white/10"
            aria-label="Toggle menu"
            style={{ color: "#FFFFFFCC" }}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden ${bannerVisible ? "top-[104px] sm:top-[112px]" : "top-14 sm:top-16"}`}
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Menu Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed right-0 bottom-0 w-full sm:max-w-sm bg-[#0D0F14] border-l z-50 lg:hidden overflow-y-auto ${bannerVisible ? "top-[104px] sm:top-[112px]" : "top-14 sm:top-16"}`}
              style={{ borderColor: "#1f232b" }}
            >
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Fonctionnalités */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 px-2" style={{ color: "#FFFFFF99" }}>
                    Fonctionnalités
                  </div>
                  <div className="space-y-1">
                    {navigationData.fonctionnalites.items.map((item, idx) => {
                      const Icon = item.icon;
                      // Les fonctionnalités nécessitent une authentification
                      const requiresAuth = true;
                      return (
                        <Link
                          key={idx}
                          href={getHref(item.href, requiresAuth)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 active:bg-white/5 group"
                        >
                          <div className="p-1.5 rounded-lg bg-white/5 group-active:bg-white/10 transition-colors flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#00E676" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white">
                              {item.label}
                            </div>
                            <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "#FFFFFF99" }}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Pour qui ? */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 px-2" style={{ color: "#FFFFFF99" }}>
                    Pour qui ?
                  </div>
                  <div className="space-y-1">
                    {navigationData.pourQui.items.map((item, idx) => {
                      const Icon = item.icon;
                      // Les liens "Pour qui ?" sont publics
                      const requiresAuth = false;
                      return (
                        <Link
                          key={idx}
                          href={getHref(item.href, requiresAuth)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 active:bg-white/5 group"
                        >
                          <div className="p-1.5 rounded-lg bg-white/5 group-active:bg-white/10 transition-colors flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#2979FF" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white">
                              {item.label}
                            </div>
                            <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "#FFFFFF99" }}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Ressources */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 px-2" style={{ color: "#FFFFFF99" }}>
                    Ressources
                  </div>
                  <div className="space-y-1">
                    {navigationData.ressources.items.map((item, idx) => {
                      const Icon = item.icon;
                      // "Aide" nécessite une authentification (dashboard), "FAQ" est publique
                      const requiresAuth = item.href === "/dashboard/help";
                      return (
                        <Link
                          key={idx}
                          href={getHref(item.href, requiresAuth)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 active:bg-white/5 group"
                        >
                          <div className="p-1.5 rounded-lg bg-white/5 group-active:bg-white/10 transition-colors flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#00E676" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white">
                              {item.label}
                            </div>
                            <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "#FFFFFF99" }}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Tarifs */}
                <div>
                  <Link
                    href={navigationData.tarifs.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 active:bg-white/5"
                  >
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "#FFFFFFCC" }} />
                    <span className="text-sm font-medium text-white">Tarifs</span>
                  </Link>
                </div>

                {/* Séparateur */}
                <div className="h-px" style={{ backgroundColor: "#1f232b" }} />

                {/* Actions */}
                <div className="space-y-2.5 sm:space-y-3 pt-2">
                  {user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #00E676 0%, #2979FF 100%)",
                        boxShadow: "0 4px 20px rgba(41, 121, 255, 0.4)",
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium transition-all duration-200 active:bg-white/5"
                        style={{
                          border: "1px solid #1f232b",
                          color: "#FFFFFFCC",
                        }}
                      >
                        <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                        Se connecter
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98] shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #00E676 0%, #2979FF 100%)",
                          boxShadow: "0 4px 20px rgba(41, 121, 255, 0.4)",
                        }}
                      >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        Commencer gratuitement
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

