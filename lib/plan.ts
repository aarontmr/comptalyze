import { createClient } from '@supabase/supabase-js';
import type { User, SupabaseClient } from '@supabase/supabase-js';

export type Plan = 'free' | 'pro' | 'premium';

/**
 * Récupère le plan d'un utilisateur depuis la table subscriptions
 * Utilise les variables d'environnement NEXT_PUBLIC_STRIPE_PRICE_PRO et NEXT_PUBLIC_STRIPE_PRICE_PREMIUM
 * pour déterminer le plan à partir du price_id
 */
export async function getUserPlan(
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<Plan> {
  try {
    // Récupérer l'abonnement depuis la table subscriptions
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, price_id')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      // Si pas d'abonnement dans la table, vérifier user_metadata (compatibilité)
      return 'free';
    }

    // Vérifier si l'abonnement est actif ou en période d'essai
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    if (!isActive) {
      return 'free';
    }

    // Déterminer le plan depuis le price_id
    const priceId = subscription.price_id;
    const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO;
    const premiumPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || process.env.STRIPE_PRICE_PREMIUM;

    // Accepter 'premium_test' et 'pro_test' pour les tests en développement
    if (priceId === premiumPriceId || priceId === 'premium_test') {
      return 'premium';
    } else if (priceId === proPriceId || priceId === 'pro_test') {
      return 'pro';
    }

    // Par défaut, si on a un status actif mais price_id inconnu, retourner 'free'
    return 'free';
  } catch (error) {
    console.error('Erreur lors de la récupération du plan:', error);
    return 'free';
  }
}

/**
 * Version serveur qui utilise le service role key pour vérifier le plan
 * Utilise aussi user_metadata comme fallback pour compatibilité
 */
export async function getUserPlanServer(
  userId: string,
  userMetadata?: Record<string, any>
): Promise<Plan> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // Fallback sur user_metadata si disponible
    if (userMetadata) {
      const plan = userMetadata.subscription_plan;
      if (plan === 'premium' || userMetadata.is_premium === true) {
        return 'premium';
      } else if (plan === 'pro' || userMetadata.is_pro === true) {
        return 'pro';
      }
    }
    return 'free';
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, price_id')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      // Fallback sur user_metadata pour compatibilité
      if (userMetadata) {
        const plan = userMetadata.subscription_plan;
        if (plan === 'premium' || userMetadata.is_premium === true) {
          return 'premium';
        } else if (plan === 'pro' || userMetadata.is_pro === true) {
          return 'pro';
        }
      }
      return 'free';
    }

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    if (!isActive) {
      return 'free';
    }

    const priceId = subscription.price_id;
    const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO;
    const premiumPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || process.env.STRIPE_PRICE_PREMIUM;

    // Accepter 'premium_test' et 'pro_test' pour les tests en développement
    if (priceId === premiumPriceId || priceId === 'premium_test') {
      return 'premium';
    } else if (priceId === proPriceId || priceId === 'pro_test') {
      return 'pro';
    }

    return 'free';
  } catch (error) {
    console.error('Erreur lors de la récupération du plan serveur:', error);
    // Fallback sur user_metadata
    if (userMetadata) {
      const plan = userMetadata.subscription_plan;
      if (plan === 'premium' || userMetadata.is_premium === true) {
        return 'premium';
      } else if (plan === 'pro' || userMetadata.is_pro === true) {
        return 'pro';
      }
    }
    return 'free';
  }
}

/**
 * Vérifie si l'utilisateur a accès à une fonctionnalité
 */
export function hasFeature(plan: Plan, feature: 'export_pdf' | 'monthly_reminders' | 'ai_advice'): boolean {
  switch (feature) {
    case 'export_pdf':
      return plan === 'pro' || plan === 'premium';
    case 'monthly_reminders':
    case 'ai_advice':
      return plan === 'premium';
    default:
      return false;
  }
}

