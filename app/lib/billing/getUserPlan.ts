/**
 * Helper pour récupérer le plan actif d'un utilisateur (avec gestion des trials)
 * 
 * Source de vérité : user_profiles en DB
 */

import { createClient } from '@supabase/supabase-js';
import type { PlanId } from './plans';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client admin pour les server components
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface UserPlan {
  plan: PlanId;
  planStatus: 'none' | 'trialing' | 'active' | 'canceled' | 'past_due' | 'unpaid';
  isTrialing: boolean;
  trialPlan: PlanId | null;
  trialEndsAt: Date | null;
  effectivePlan: PlanId; // Plan effectif (trial_plan si en trial, sinon plan)
}

/**
 * Récupère le plan d'un utilisateur depuis la DB (server-side)
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('plan, plan_status, trial_plan, trial_ends_at')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    console.error('Erreur récupération user_profiles:', error);
    // Fallback: free
    return {
      plan: 'free',
      planStatus: 'none',
      isTrialing: false,
      trialPlan: null,
      trialEndsAt: null,
      effectivePlan: 'free',
    };
  }
  
  const now = new Date();
  const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
  const isTrialing = !!(data.plan_status === 'trialing' && trialEndsAt && trialEndsAt > now);
  
  // Plan effectif = trial_plan si en trial actif, sinon plan payant
  const effectivePlan = (isTrialing && data.trial_plan ? data.trial_plan : data.plan) as PlanId;
  
  return {
    plan: data.plan as PlanId,
    planStatus: data.plan_status as any,
    isTrialing: isTrialing as boolean,
    trialPlan: data.trial_plan as PlanId | null,
    trialEndsAt,
    effectivePlan,
  };
}

/**
 * Vérifie si un utilisateur a accès à un plan spécifique
 */
export async function hasAccess(userId: string, requiredPlan: PlanId): Promise<boolean> {
  const userPlan = await getUserPlan(userId);
  
  const hierarchy: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };
  
  return hierarchy[userPlan.effectivePlan] >= hierarchy[requiredPlan];
}

