"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { CheckCircle2, Circle, Calculator, FileText, BarChart3, TrendingUp, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  checkFunction: (user: User) => Promise<boolean>;
}

interface OnboardingChecklistProps {
  user: User | null;
  onComplete?: () => void;
}

export default function OnboardingChecklist({ user, onComplete }: OnboardingChecklistProps) {
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  const checklistItems: ChecklistItem[] = [
    {
      id: "first_calculation",
      label: "Effectuer votre premier calcul URSSAF",
      description: "Calculez vos cotisations pour comprendre votre revenu net",
      icon: Calculator,
      href: "/dashboard/simulateur",
      checkFunction: async (user) => {
        const { data } = await supabase
          .from("ca_records")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);
        return (data?.length || 0) > 0;
      },
    },
    {
      id: "create_invoice",
      label: "Créer votre première facture",
      description: "Générez une facture professionnelle en quelques clics",
      icon: FileText,
      href: "/dashboard/factures/nouvelle",
      checkFunction: async (user) => {
        const { data } = await supabase
          .from("invoices")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);
        return (data?.length || 0) > 0;
      },
    },
    {
      id: "view_stats",
      label: "Consulter vos statistiques",
      description: "Découvrez l'évolution de votre activité",
      icon: BarChart3,
      href: "/dashboard/statistiques",
      checkFunction: async (user) => {
        // Vérifier si l'utilisateur a visité la page statistiques
        const { data } = await supabase
          .from("user_onboarding_progress")
          .select("checklist_progress")
          .eq("user_id", user.id)
          .single();
        return data?.checklist_progress?.view_stats === true;
      },
    },
    {
      id: "explore_features",
      label: "Explorer les fonctionnalités Premium",
      description: "Découvrez ce que vous pouvez faire avec Premium",
      icon: Sparkles,
      href: "/pricing",
      checkFunction: async (user) => {
        const { data } = await supabase
          .from("user_onboarding_progress")
          .select("checklist_progress")
          .eq("user_id", user.id)
          .single();
        return data?.checklist_progress?.explore_features === true;
      },
    },
  ];

  // Fonction pour vérifier toutes les tâches (mémorisée avec useCallback)
  const checkAllItems = useCallback(async () => {
    if (!user) return;

    const progress: Record<string, boolean> = {};

    for (const item of checklistItems) {
      try {
        progress[item.id] = await item.checkFunction(user);
      } catch (error) {
        console.error(`Error checking ${item.id}:`, error);
        progress[item.id] = false;
      }
    }

    setChecklistProgress((prev) => {
      // Ne mettre à jour que si quelque chose a changé
      const hasChanged = Object.keys(progress).some(
        (key) => prev[key] !== progress[key]
      );
      if (hasChanged || Object.keys(prev).length === 0) {
        return progress;
      }
      return prev;
    });
    setLoading(false);

    // Vérifier si l'onboarding doit être affiché
    const { data } = await supabase
      .from("user_onboarding_progress")
      .select("completed_at")
      .eq("user_id", user.id)
      .single();

    if (!data?.completed_at) {
      setIsVisible(true);
    }
  }, [user]);

  // Vérification initiale et mise en place du système de mise à jour automatique
  useEffect(() => {
    if (!user) return;

    // Vérification initiale
    checkAllItems();

    // Mettre en place l'écoute en temps réel avec Supabase Realtime
    const channel = supabase
      .channel(`onboarding-checklist-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ca_records",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Quand un enregistrement CA est créé/modifié, vérifier à nouveau
          checkAllItems();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoices",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Quand une facture est créée/modifiée, vérifier à nouveau
          checkAllItems();
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Vérification périodique toutes les 5 secondes (pour les cas où Realtime ne fonctionne pas)
    checkIntervalRef.current = setInterval(() => {
      checkAllItems();
    }, 5000);

    // Nettoyage
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, checkAllItems]);

  // Vérifier aussi quand l'utilisateur change de page (pour détecter les visites)
  useEffect(() => {
    if (!user || !pathname) return;

    // Si l'utilisateur visite la page statistiques, marquer comme complété
    if (pathname === "/dashboard/statistiques") {
      supabase
        .from("user_onboarding_progress")
        .upsert(
          {
            user_id: user.id,
            checklist_progress: {
              view_stats: true,
            },
          },
          {
            onConflict: "user_id",
          }
        )
        .then(() => {
          checkAllItems();
        });
    }

    // Si l'utilisateur visite la page pricing, marquer comme complété
    if (pathname === "/pricing") {
      supabase
        .from("user_onboarding_progress")
        .upsert(
          {
            user_id: user.id,
            checklist_progress: {
              explore_features: true,
            },
          },
          {
            onConflict: "user_id",
          }
        )
        .then(() => {
          checkAllItems();
        });
    }
  }, [pathname, user, checkAllItems]);

  const handleItemClick = async (item: ChecklistItem) => {
    if (!user) return;

    // Marquer comme visité dans la base de données
    await supabase
      .from("user_onboarding_progress")
      .upsert({
        user_id: user.id,
        checklist_progress: {
          ...checklistProgress,
          [item.id === "view_stats" ? "view_stats" : item.id === "explore_features" ? "explore_features" : ""]: true,
        },
      }, {
        onConflict: "user_id",
      });
  };

  const handleComplete = async () => {
    if (!user) return;

    await supabase
      .from("user_onboarding_progress")
      .upsert({
        user_id: user.id,
        completed_at: new Date().toISOString(),
        checklist_progress: checklistProgress,
      }, {
        onConflict: "user_id",
      });

    setIsVisible(false);
    onComplete?.();
  };

  const completedCount = Object.values(checklistProgress).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const allCompleted = completedCount === totalCount;

  // Animation quand une tâche est complétée
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const prevProgressRef = useRef<Record<string, boolean>>({});
  
  useEffect(() => {
    // Détecter les nouvelles tâches complétées en comparant avec l'état précédent
    Object.keys(checklistProgress).forEach((key) => {
      const wasCompleted = prevProgressRef.current[key] || false;
      const isNowCompleted = checklistProgress[key] || false;
      
      // Si la tâche vient d'être complétée (était false, maintenant true)
      if (!wasCompleted && isNowCompleted) {
        setJustCompleted(key);
        setTimeout(() => setJustCompleted(null), 2000);
      }
    });
    
    // Mettre à jour la référence pour la prochaine vérification
    prevProgressRef.current = { ...checklistProgress };
  }, [checklistProgress]);

  if (!isVisible || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 right-4 z-50 max-w-md w-full mx-4"
      >
        <div
          className="rounded-2xl p-6 shadow-2xl border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Checklist de démarrage
              </h3>
              <p className="text-sm text-gray-400">
                {completedCount} / {totalCount} étapes complétées
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
              style={{ color: "#9ca3af" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {checklistItems.map((item) => {
              const Icon = item.icon;
              const isCompleted = checklistProgress[item.id] || false;

              const isJustCompleted = justCompleted === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: isJustCompleted ? 1.05 : 1,
                  }}
                  transition={{
                    scale: { duration: 0.3, type: "spring" }
                  }}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    isCompleted ? "bg-green-500/10" : "bg-gray-800/50"
                  }`}
                >
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#00D084]" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => handleItemClick(item)}
                        className="block"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${isCompleted ? "text-[#00D084]" : "text-gray-400"}`} />
                          <span className={`text-sm font-medium ${isCompleted ? "text-gray-300 line-through" : "text-white"}`}>
                            {item.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </Link>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${isCompleted ? "text-[#00D084]" : "text-gray-400"}`} />
                          <span className={`text-sm font-medium ${isCompleted ? "text-gray-300 line-through" : "text-white"}`}>
                            {item.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {allCompleted && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleComplete}
              className="w-full px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
              }}
            >
              Parfait ! J'ai terminé
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


