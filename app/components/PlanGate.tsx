/**
 * HOC pour protéger les features selon le plan de l'utilisateur
 * Affiche un overlay avec upgrade prompt si plan insuffisant
 */

'use client';

import { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { getPlan, hasFeatureAccess, PlanId } from '@/app/lib/billing/plans';
import Link from 'next/link';

interface PlanGateProps {
  user: User | null | undefined;
  requiredPlan: PlanId;
  feature?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export default function PlanGate({
  user,
  requiredPlan,
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: PlanGateProps) {
  const subscription = getUserSubscription(user);
  const currentPlan = subscription.plan;
  
  // Hiérarchie des plans
  const planHierarchy: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };
  
  const hasAccess = planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
  
  // Si l'utilisateur a accès, afficher le contenu
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Sinon, afficher le fallback ou l'upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgradePrompt) {
    const planDetails = getPlan(requiredPlan);
    
    return (
      <div className="relative">
        {/* Contenu flouté */}
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay d'upgrade */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md mx-4 text-center">
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
            
            <div className="flex gap-3 justify-center">
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
  
  return null;
}

/**
 * Version simple qui retourne un boolean
 * Utile pour les conditions if/else
 */
export function useHasAccess(user: User | null | undefined, requiredPlan: PlanId): boolean {
  const subscription = getUserSubscription(user);
  const currentPlan = subscription.plan;
  
  const planHierarchy: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };
  
  return planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
}

