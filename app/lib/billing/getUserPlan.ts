/**
 * Helper pour récupérer le plan actif d'un utilisateur
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
  planStatus: 'none' | 'active' | 'canceled' | 'past_due' | 'unpaid';
  effectivePlan: PlanId;
}

/**
 * Récupère le plan d'un utilisateur depuis la DB (server-side)
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('plan, plan_status')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    console.error('Erreur récupération user_profiles:', error);
    // Fallback: free
    return {
      plan: 'free',
      planStatus: 'none',
      effectivePlan: 'free',
    };
  }
  
  const planStatus = (data.plan_status as UserPlan['planStatus']) || 'none';
  const plan = (data.plan as PlanId) || 'free';
  
  return {
    plan,
    planStatus,
    effectivePlan: plan,
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

