/**
 * Configuration centralisée des plans et features
 */

export type PlanId = 'free' | 'pro' | 'premium';

export interface PlanFeatures {
  invoicesLimit: number | null; // null = illimité
  simulationsLimit: number | null;
  exportComptable: boolean;
  comptabot: boolean;
  urssafReminders: boolean;
  advancedStats: boolean;
  integrations: boolean;
  prioritySupport: boolean;
  freeTrialDays: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  slug: string;
  color: string;
  gradient?: string;
  priceMonthly: number;
  priceYearly: number;
  features: PlanFeatures;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    slug: 'free',
    color: '#6B7280',
    priceMonthly: 0,
    priceYearly: 0,
    features: {
      invoicesLimit: 5,
      simulationsLimit: 3,
      exportComptable: false,
      comptabot: false,
      urssafReminders: false,
      advancedStats: false,
      integrations: false,
      prioritySupport: false,
      freeTrialDays: 0,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    color: '#00D084',
    gradient: 'linear-gradient(135deg, #00D084, #2E6CF6)',
    priceMonthly: 19,
    priceYearly: 190, // ~16€/mois
    features: {
      invoicesLimit: null,
      simulationsLimit: null,
      exportComptable: true,
      comptabot: false,
      urssafReminders: false,
      advancedStats: false,
      integrations: true,
      prioritySupport: false,
      freeTrialDays: 3,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    slug: 'premium',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
    priceMonthly: 39,
    priceYearly: 390, // ~32€/mois
    features: {
      invoicesLimit: null,
      simulationsLimit: null,
      exportComptable: true,
      comptabot: true,
      urssafReminders: true,
      advancedStats: true,
      integrations: true,
      prioritySupport: true,
      freeTrialDays: 3,
    },
  },
};

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

/**
 * Vérifie si un plan a accès à une feature
 */
export function hasFeatureAccess(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  const hierarchy: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };
  
  return hierarchy[currentPlan] >= hierarchy[requiredPlan];
}
