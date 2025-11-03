import { User } from '@supabase/supabase-js';

export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export interface UserSubscription {
  plan: SubscriptionPlan;
  isPro: boolean;
  isPremium: boolean;
  status: string | null;
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
    };
  }

  const metadata = user.user_metadata || {};
  const subscriptionPlan = metadata.subscription_plan as string;
  const isPro = metadata.is_pro === true;
  const isPremium = metadata.is_premium === true;
  const status = metadata.subscription_status || null;

  // Déterminer le plan
  let plan: SubscriptionPlan = 'free';
  if (subscriptionPlan === 'premium' || isPremium) {
    plan = 'premium';
  } else if (subscriptionPlan === 'pro' || isPro) {
    plan = 'pro';
  }

  return {
    plan,
    isPro,
    isPremium,
    status,
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

