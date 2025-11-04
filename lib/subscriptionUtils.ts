import { User } from '@supabase/supabase-js';

export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export interface UserSubscription {
  plan: SubscriptionPlan;
  isPro: boolean;
  isPremium: boolean;
  status: string | null;
  isTrial: boolean;
  trialEndsAt: string | null;
}

/**
 * Récupère le plan d'abonnement de l'utilisateur depuis ses métadonnées
 */
export function getUserSubscription(user: User | null | undefined): UserSubscription {
  if (!user) {
    return {
      plan: 'free',
      isPro: false,
      isPremium: false,
      status: null,
      isTrial: false,
      trialEndsAt: null,
    };
  }

  const metadata = user.user_metadata || {};
  const subscriptionPlan = metadata.subscription_plan as string;
  const isPro = metadata.is_pro === true;
  const isPremium = metadata.is_premium === true;
  const status = metadata.subscription_status || null;
  const trialEndsAt = metadata.premium_trial_ends_at || null;
  const trialActive = metadata.premium_trial_active === true;
  
  // Vérifier si l'essai est toujours valide
  let isTrial = false;
  if (trialActive && trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    isTrial = now < trialEnd;
    
    // Si l'essai est expiré, ne pas considérer comme Premium
    if (!isTrial && !metadata.stripe_subscription_id) {
      // L'essai est expiré, ne pas retourner Premium
      return {
        plan: 'free',
        isPro: false,
        isPremium: false,
        status: null,
        isTrial: false,
        trialEndsAt: null,
      };
    }
  }

  // Déterminer le plan
  let plan: SubscriptionPlan = 'free';
  let finalIsPremium = isPremium;
  
  // Un utilisateur est Premium si :
  // - is_premium est true ET (a un essai actif OU a un abonnement Stripe OU statut est 'active')
  if (isPremium) {
    finalIsPremium = isTrial || !!metadata.stripe_subscription_id || status === 'active';
  }
  
  if (subscriptionPlan === 'premium' || finalIsPremium) {
    plan = 'premium';
  } else if (subscriptionPlan === 'pro' || isPro) {
    plan = 'pro';
  }

  return {
    plan,
    isPro,
    isPremium: finalIsPremium,
    status,
    isTrial,
    trialEndsAt,
  };
}

/**
 * Vérifie si l'utilisateur a accès à une fonctionnalité selon son plan
 */
export function hasFeatureAccess(user: User | null | undefined, feature: 'unlimited_calculations' | 'export_pdf' | 'urssaf_reminders' | 'priority_support'): boolean {
  const subscription = getUserSubscription(user);

  switch (feature) {
    case 'unlimited_calculations':
      // Pro et Premium ont des calculs illimités
      return subscription.plan === 'pro' || subscription.plan === 'premium';
    
    case 'export_pdf':
      // Pro et Premium peuvent exporter en PDF
      return subscription.plan === 'pro' || subscription.plan === 'premium';
    
    case 'urssaf_reminders':
      // Seulement Premium
      return subscription.plan === 'premium';
    
    case 'priority_support':
      // Seulement Premium
      return subscription.plan === 'premium';
    
    default:
      return false;
  }
}

