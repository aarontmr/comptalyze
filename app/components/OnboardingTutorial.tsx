"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { getUserSubscription } from "@/lib/subscriptionUtils";
import { User } from "@supabase/supabase-js";
import { X, ChevronRight, ChevronLeft, CheckCircle, Calculator, FileText, BarChart3, LayoutDashboard, TrendingUp, DollarSign, PieChart, Percent, Receipt, Download, Calendar as CalendarIcon, Bot } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  targetSelector?: string; // Pour pointer vers un élément spécifique
  position?: "top" | "bottom" | "left" | "right" | "center";
  requiresPro?: boolean;
  requiresPremium?: boolean;
}

interface OnboardingTutorialProps {
  user: User | null;
  onComplete: () => void;
}

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function OnboardingTutorial({ user, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [elementPosition, setElementPosition] = useState<ElementPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà complété le tutoriel
    const checkTutorialStatus = async () => {
      if (!user) return;

      const metadata = user.user_metadata || {};
      const hasCompletedTutorial = metadata.onboarding_completed === true;

      // Le tutoriel s'affiche dans ces cas :
      // 1. Première inscription : onboarding_completed n'existe pas encore
      // 2. Première connexion : onboarding_completed n'est pas défini
      // 3. Utilisateur qui n'a jamais vu le tutoriel : onboarding_completed !== true
      if (!hasCompletedTutorial) {
        // Attendre un peu pour que le DOM soit chargé
        setTimeout(() => {
          setIsVisible(true);
        }, 500);
      }
    };

    checkTutorialStatus();
  }, [user]);

  // Récupérer le plan de l'utilisateur pour filtrer les étapes
  const subscription = getUserSubscription(user);

  const allSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Bienvenue sur Comptalyze ! 👋",
      description:
        "Ce tutoriel rapide va vous guider à travers les fonctionnalités principales de votre dashboard. Vous pourrez le refermer à tout moment.",
      icon: CheckCircle,
      position: "center",
    },
    {
      id: "overview",
      title: "Aperçu du dashboard",
      description:
        "Cette page vous donne une vue d'ensemble de votre activité : chiffre d'affaires total, revenu net, et cotisations URSSAF. Toutes vos données sont automatiquement calculées et mises à jour.",
      icon: LayoutDashboard,
      targetSelector: "[data-tutorial='overview']",
      position: "bottom",
    },
    {
      id: "stats-cards",
      title: "Vos statistiques en un coup d'œil",
      description:
        "Ces cartes affichent vos indicateurs clés : CA total, revenu net après cotisations, et montant total des cotisations URSSAF. Plus vous ajoutez d'enregistrements, plus ces statistiques sont précises.",
      icon: TrendingUp,
      targetSelector: "[data-tutorial='stats-cards']",
      position: "bottom",
    },
    {
      id: "calculator",
      title: "Simulateur URSSAF",
      description:
        "Utilisez le simulateur pour calculer vos cotisations en temps réel. Entrez votre chiffre d'affaires, choisissez votre activité, et obtenez instantanément vos cotisations et votre revenu net.",
      icon: Calculator,
      targetSelector: "[data-tutorial='calculator']",
      position: "right",
    },
    {
      id: "tva",
      title: "Simulateur TVA (Pro)",
      description:
        "Si vous êtes assujetti à la TVA, utilisez notre simulateur pour calculer facilement votre TVA collectée et déductible selon votre régime fiscal.",
      icon: Percent,
      targetSelector: "[data-tutorial='tva']",
      position: "right",
      requiresPro: true,
    },
    {
      id: "charges",
      title: "Gestion des Charges (Pro)",
      description:
        "Enregistrez et suivez toutes vos charges professionnelles pour optimiser votre comptabilité et réduire vos impôts.",
      icon: Receipt,
      targetSelector: "[data-tutorial='charges']",
      position: "right",
      requiresPro: true,
    },
    {
      id: "invoices",
      title: "Gestion des factures (Pro/Premium)",
      description:
        "Créez, gérez et envoyez des factures professionnelles directement depuis Comptalyze. Exportez-les en PDF et envoyez-les par email en un clic.",
      icon: FileText,
      targetSelector: "[data-tutorial='invoices']",
      position: "right",
      requiresPro: true,
    },
    {
      id: "export",
      title: "Export Comptable (Pro)",
      description:
        "Exportez toutes vos données comptables au format CSV ou PDF pour votre comptable ou vos archives. Simplifiez votre gestion administrative !",
      icon: Download,
      targetSelector: "[data-tutorial='export']",
      position: "right",
      requiresPro: true,
    },
    {
      id: "calendrier",
      title: "Calendrier Fiscal (Premium)",
      description:
        "Ne manquez plus jamais une échéance ! Le calendrier fiscal vous rappelle toutes vos obligations : déclarations URSSAF, TVA, impôts sur le revenu.",
      icon: CalendarIcon,
      targetSelector: "[data-tutorial='calendrier']",
      position: "right",
      requiresPremium: true,
    },
    {
      id: "statistics",
      title: "Statistiques avancées (Premium)",
      description:
        "Accédez à des graphiques détaillés et des analyses avancées pour suivre l'évolution de votre activité dans le temps. Prenez les meilleures décisions pour votre entreprise.",
      icon: BarChart3,
      targetSelector: "[data-tutorial='statistics']",
      position: "right",
      requiresPremium: true,
    },
    {
      id: "chatbot",
      title: "ComptaBot - Votre Assistant IA (Premium)",
      description:
        "Posez toutes vos questions à ComptaBot, votre assistant intelligent disponible 24/7. Il vous aide à optimiser vos cotisations, comprendre vos obligations fiscales et bien plus !",
      icon: Bot,
      targetSelector: ".chatbot-float-button",
      position: "left",
      requiresPremium: true,
    },
    {
      id: "navigation",
      title: "Navigation",
      description:
        "Utilisez le menu latéral pour naviguer entre les différentes sections. Le menu s'adapte automatiquement selon votre plan d'abonnement.",
      icon: LayoutDashboard,
      targetSelector: "[data-tutorial='navigation']",
      position: "right",
    },
    {
      id: "complete",
      title: "C'est parti ! 🚀",
      description:
        "Vous êtes maintenant prêt à utiliser Comptalyze. N'hésitez pas à explorer toutes les fonctionnalités. Si vous avez besoin d'aide, notre équipe support est là pour vous !",
      icon: CheckCircle,
      position: "center",
    },
  ];

  // Filtrer les étapes selon le plan de l'utilisateur ET valider que les selectors existent
  // Les étapes avec requiresPremium sont affichées uniquement aux utilisateurs Premium
  // Les étapes avec requiresPro sont affichées aux utilisateurs Pro ET Premium
  // Les autres étapes sont affichées à tous les utilisateurs (gratuit, pro, premium)
  const steps = allSteps.filter((step) => {
    // Filtrer selon le plan
    if (step.requiresPremium && !subscription.isPremium) return false;
    if (step.requiresPro && !subscription.isPro && !subscription.isPremium) return false;
    
    // Si l'étape a un targetSelector, vérifier qu'il existe (après un délai pour le DOM)
    // On ne vérifie pas ici car le DOM n'est peut-être pas encore chargé
    // La vérification se fera dans useEffect
    return true;
  });

  // Mettre à jour la position de l'élément ciblé et de la tooltip
  useEffect(() => {
    if (!isVisible) return;

    const step = steps[currentStep];
    if (!step.targetSelector) {
      setTargetElement(null);
      setElementPosition(null);
      setTooltipPosition(null);
      return;
    }

    // Stocker le selector dans une constante pour garantir le type
    const targetSelector = step.targetSelector;

    const updatePositions = () => {
      const element = document.querySelector(targetSelector) as HTMLElement;
      if (!element) {
        // Si l'élément n'existe pas, passer automatiquement à l'étape suivante après un délai
        console.warn(`Élément tutoriel non trouvé: ${targetSelector}. Passage à l'étape suivante.`);
        setTargetElement(null);
        setElementPosition(null);
        setTooltipPosition(null);
        
        // Attendre un peu pour laisser le temps au DOM de se charger, sinon passer à l'étape suivante
        const retryTimeout = setTimeout(() => {
          const retryElement = document.querySelector(targetSelector) as HTMLElement;
          if (!retryElement && currentStep < steps.length - 1) {
            // Si toujours pas trouvé, passer à l'étape suivante automatiquement
            setCurrentStep(prev => prev + 1);
          }
        }, 2000);
        
        return () => clearTimeout(retryTimeout);
      }

      // Ajouter un z-index élevé à l'élément pour qu'il reste visible
      element.style.zIndex = "9999";
      element.style.position = "relative";

      setTargetElement(element);

      // Obtenir la position de l'élément
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      const position: ElementPosition = {
        top: rect.top + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
        height: rect.height,
      };

      setElementPosition(position);

      // Calculer la position de la tooltip avec responsive
      const isMobile = window.innerWidth < 640;
      const tooltipWidth = isMobile ? window.innerWidth - 32 : 400; // Responsive width
      const tooltipHeight = Math.min(500, window.innerHeight - 100); // Hauteur max adaptative
      const gap = isMobile ? 10 : 20; // Espacement réduit sur mobile

      let top = 0;
      let left = 0;

      // Sur mobile, afficher au centre pour éviter les problèmes de positionnement
      if (isMobile) {
        top = window.innerHeight / 2 + scrollY;
        left = window.innerWidth / 2;
      } else {
        // Desktop: positionnement normal
        switch (step.position) {
          case "top":
            top = position.top - tooltipHeight - gap;
            left = position.left + position.width / 2;
            break;
          case "bottom":
            top = position.top + position.height + gap;
            left = position.left + position.width / 2;
            break;
          case "left":
            top = position.top + position.height / 2;
            left = position.left - tooltipWidth - gap;
            break;
          case "right":
            top = position.top + position.height / 2;
            left = position.left + position.width + gap;
            break;
          default:
            top = position.top + position.height / 2;
            left = position.left + position.width + gap;
        }

        // Ajuster pour éviter de sortir de l'écran et garantir que les boutons sont visibles
        const padding = 20;
        const minBottomSpace = 120; // Espace minimum en bas pour les boutons
        
        // Ajuster horizontalement
        if (left < padding) left = padding;
        if (left + tooltipWidth > window.innerWidth - padding) {
          left = window.innerWidth - tooltipWidth - padding;
        }
        
        // Ajuster verticalement - garantir que le tooltip ne sort pas en haut
        if (top < scrollY + padding) {
          top = scrollY + padding;
        }
        
        // Garantir que le tooltip ne sort pas en bas (avec espace pour les boutons)
        const maxTop = window.innerHeight + scrollY - tooltipHeight - minBottomSpace;
        if (top > maxTop) {
          top = Math.max(scrollY + padding, maxTop);
        }
        
        // Si le tooltip est trop haut, le centrer verticalement
        if (top < scrollY + 100 && position.top + position.height < window.innerHeight / 2) {
          top = window.innerHeight / 2 + scrollY - tooltipHeight / 2;
        }
      }

      setTooltipPosition({ top, left });

      // Scroller vers l'élément si nécessaire de manière plus douce
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }, 150);
    };

    // Attendre un peu pour que le DOM soit prêt
    const timeout = setTimeout(updatePositions, 300);

    // Mettre à jour lors du scroll ou du resize
    window.addEventListener("scroll", updatePositions);
    window.addEventListener("resize", updatePositions);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", updatePositions);
      window.removeEventListener("resize", updatePositions);
    };
  }, [currentStep, isVisible, steps]);

  // Nettoyer le z-index de l'élément ciblé quand il change ou quand le tutoriel se ferme
  useEffect(() => {
    return () => {
      if (targetElement) {
        targetElement.style.zIndex = "";
        targetElement.style.position = "";
      }
    };
  }, [targetElement, isVisible]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await completeTutorial();
  };

  const completeTutorial = async () => {
    if (!user) return;

    try {
      // Mettre à jour les métadonnées utilisateur
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.auth.updateUser({
          data: {
            ...userData.user.user_metadata,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          },
        });
      }

      setIsVisible(false);
      onComplete();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du tutoriel:", error);
      // Continuer quand même
      setIsVisible(false);
      onComplete();
    }
  };

  if (!isVisible || !user) {
    return null;
  }

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const isCenter = step.position === "center" || !step.targetSelector;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay sombre avec trou pour l'élément ciblé */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            style={{
              zIndex: 9998,
              background: elementPosition
                ? `radial-gradient(circle at ${elementPosition.left + elementPosition.width / 2}px ${elementPosition.top + elementPosition.height / 2}px, 
                    transparent 0%, 
                    transparent ${Math.max(elementPosition.width, elementPosition.height) / 2 + 30}px, 
                    rgba(0, 0, 0, 0.5) ${Math.max(elementPosition.width, elementPosition.height) / 2 + 80}px,
                    rgba(0, 0, 0, 0.92) ${Math.max(elementPosition.width, elementPosition.height) / 2 + 120}px,
                    rgba(0, 0, 0, 0.92) 100%)`
                : "rgba(0, 0, 0, 0.92)",
              backdropFilter: "none",
            }}
            onClick={!isLastStep ? handleSkip : undefined}
          />

          {/* Highlight autour de l'élément ciblé */}
          {elementPosition && targetElement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed pointer-events-none"
              style={{
                zIndex: 10000,
                top: elementPosition.top - 4,
                left: elementPosition.left - 4,
                width: elementPosition.width + 8,
                height: elementPosition.height + 8,
                border: "3px solid",
                borderImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%) 1",
                borderRadius: "12px",
                boxShadow: "0 0 0 4px rgba(0, 208, 132, 0.3), 0 0 30px rgba(46, 108, 246, 0.5)",
              }}
            />
          )}

          {/* Tooltip du tutoriel */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed w-[calc(100vw-2rem)] sm:w-96 max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto"
            style={{
              zIndex: 10001,
              ...(isCenter || (typeof window !== 'undefined' && window.innerWidth < 640 && step.targetSelector)
                ? {
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    maxHeight: "90vh",
                  }
                : tooltipPosition
                ? {
                    top: `${Math.max(20, Math.min(tooltipPosition.top, window.innerHeight - 400))}px`,
                    left: `${Math.max(16, Math.min(tooltipPosition.left, window.innerWidth - 400))}px`,
                    maxHeight: `${window.innerHeight - Math.max(20, Math.min(tooltipPosition.top, window.innerHeight - 400)) - 40}px`,
                  }
                : {
                    top: "2rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    maxHeight: "calc(100vh - 4rem)",
                  })
            }}
          >
            <div
              className="bg-[#16181d] border rounded-2xl p-6 shadow-2xl flex flex-col"
              style={{
                borderColor: "rgba(46, 108, 246, 0.3)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(46, 108, 246, 0.2)",
                minHeight: "fit-content",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,208,132,0.2) 0%, rgba(46,108,246,0.2) 100%)",
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#00D084" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Étape {currentStep + 1} sur {steps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Fermer le tutoriel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-6 leading-relaxed flex-shrink-0">{step.description}</p>

              {/* Progress bar */}
              <div className="mb-6 flex-shrink-0">
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
                    }}
                  />
                </div>
              </div>

              {/* Actions - Toujours visible en bas */}
              <div className="flex items-center justify-between gap-3 mt-auto flex-shrink-0 pt-4 border-t" style={{ borderColor: "rgba(46, 108, 246, 0.2)" }}>
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {isLastStep ? "Fermer" : "Passer"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={isFirstStep}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      border: "1px solid #2b2f36",
                      backgroundColor: isFirstStep ? "transparent" : "#1b1f25",
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                      boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                    }}
                  >
                    {isLastStep ? "Commencer" : "Suivant"}
                    {!isLastStep && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Flèche pointant vers l'élément (si targetSelector) */}
            {step.targetSelector && elementPosition && tooltipPosition && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute pointer-events-none"
                style={{
                  top:
                    step.position === "bottom"
                      ? "-10px"
                      : step.position === "top"
                      ? "100%"
                      : step.position === "left"
                      ? `${elementPosition.height / 2 - 10}px`
                      : `${elementPosition.height / 2 - 10}px`,
                  left:
                    step.position === "right"
                      ? "-10px"
                      : step.position === "left"
                      ? "100%"
                      : step.position === "top" || step.position === "bottom"
                      ? `${tooltipPosition.left - elementPosition.left - elementPosition.width / 2 + 20}px`
                      : "50%",
                  transform:
                    step.position === "bottom"
                      ? "translateX(-50%) rotate(180deg)"
                      : step.position === "top"
                      ? "translateX(-50%)"
                      : step.position === "left"
                      ? "translateY(-50%) rotate(90deg)"
                      : "translateY(-50%) rotate(-90deg)",
                }}
              >
                <div
                  className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-transparent"
                  style={{
                    borderTopColor: "#16181d",
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
