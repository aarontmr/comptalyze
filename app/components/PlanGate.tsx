/**
 * HOC pour protéger les features selon le plan de l'utilisateur
 * Affiche un overlay avec upgrade prompt si plan insuffisant
 * 
 * Source de vérité : user_profiles en DB (via getUserPlan)
 */

import { ReactNode } from 'react';
import { getUserPlan } from '@/app/lib/billing/getUserPlan';
import { getPlan, type PlanId } from '@/app/lib/billing/plans';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

interface PlanGateProps {
  requiredPlan: PlanId;
  feature?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Composant Server pour gating par plan
 * Utilise la DB comme source de vérité (pas les JWT metadata)
 */
export default async function PlanGate({
  requiredPlan,
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: PlanGateProps) {
  // Récupérer l'utilisateur courant
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Pas connecté = pas d'accès
    if (fallback) return <>{fallback}</>;
    if (showUpgradePrompt) {
      return <UpgradePrompt requiredPlan={requiredPlan} feature={feature} />;
    }
    return null;
  }
  
  // Récupérer le plan depuis la DB
  const userPlan = await getUserPlan(user.id);
  
  // Hiérarchie des plans
  const planHierarchy: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };
  
  const hasAccess = planHierarchy[userPlan.effectivePlan] >= planHierarchy[requiredPlan];
  
  // Si l'utilisateur a accès, afficher le contenu
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Sinon, afficher le fallback ou l'upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgradePrompt) {
    return <UpgradePrompt requiredPlan={requiredPlan} feature={feature} />;
  }
  
  return null;
}

/**
 * Composant d'upgrade prompt
 */
function UpgradePrompt({ requiredPlan, feature }: { requiredPlan: PlanId; feature?: string }) {
  const planDetails = getPlan(requiredPlan);
  
  return (
    <div className="relative">
      {/* Overlay d'upgrade */}
      <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8 min-h-[300px]">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md mx-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: planDetails.color }}>
            Fonctionnalité {planDetails.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {feature 
              ? `${feature} est réservé(e) au plan ${planDetails.name}.`
              : `Cette fonctionnalité est réservée au plan ${planDetails.name}.`
            }
          </p>
          
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href={`/checkout/${planDetails.slug}`}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
              style={{
                background: planDetails.gradient || planDetails.color,
                boxShadow: `0 4px 14px ${planDetails.color}40`,
              }}
            >
              Passer à {planDetails.name}
            </Link>
            
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Comparer les plans
            </Link>
          </div>
          
          {planDetails.features.freeTrialDays > 0 && (
            <p className="text-sm text-gray-500 mt-4">
              ✨ Essai gratuit {planDetails.features.freeTrialDays} jours sans engagement
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

