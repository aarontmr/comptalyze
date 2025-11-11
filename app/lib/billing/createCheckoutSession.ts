/**
 * Helper pour créer une session Stripe Checkout avec période d'essai de 3 jours
 * 
 * Gère :
 * - Création/récupération du customer Stripe
 * - Configuration du trial automatique
 * - Métadonnées pour tracking webhook
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface CreateCheckoutParams {
  plan: 'pro' | 'premium';
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
  email: string;
  yearly?: boolean;
}

/**
 * Crée ou récupère un customer Stripe pour un utilisateur
 */
async function ensureStripeCustomer({
  userId,
  email,
}: {
  userId: string;
  email: string;
}): Promise<Stripe.Customer> {
  console.log(`🔍 Recherche customer Stripe pour userId: ${userId}`);

  // 1) Chercher dans user_profiles
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (profile?.stripe_customer_id) {
    console.log(`✅ Customer Stripe trouvé: ${profile.stripe_customer_id}`);
    try {
      const customer = await stripe.customers.retrieve(profile.stripe_customer_id);
      if (!customer.deleted) {
        return customer as Stripe.Customer;
      }
    } catch (err) {
      console.warn(`⚠️ Customer ${profile.stripe_customer_id} invalide, création d'un nouveau`);
    }
  }

  // 2) Créer un nouveau customer
  console.log(`➕ Création d'un nouveau customer Stripe pour ${email}`);
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
      source: 'comptalyze',
    },
  });

  // 3) Sauvegarder dans user_profiles
  await supabaseAdmin
    .from('user_profiles')
    .upsert(
      {
        id: userId,
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    );

  console.log(`✅ Customer créé et sauvegardé: ${customer.id}`);
  return customer;
}

/**
 * Crée une session Checkout avec trial de 3 jours
 */
export async function createCheckoutSession({
  plan,
  priceId,
  successUrl,
  cancelUrl,
  userId,
  email,
  yearly = false,
}: CreateCheckoutParams): Promise<{ url: string; sessionId: string }> {
  console.log(`💳 Création d'une session Checkout pour ${plan} (${yearly ? 'annuel' : 'mensuel'})`);

  // Validation
  if (!priceId || !priceId.startsWith('price_')) {
    throw new Error(`Price ID invalide: ${priceId}`);
  }

  if (!['pro', 'premium'].includes(plan)) {
    throw new Error(`Plan invalide: ${plan}`);
  }

  // Récupérer/créer le customer
  const customer = await ensureStripeCustomer({ userId, email });

  // Créer la session avec trial
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customer.id,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // 🎯 KEY: Activer l'essai gratuit de 3 jours
    subscription_data: {
      trial_period_days: 3,
      metadata: {
        userId,
        plan,
        billing_cycle: yearly ? 'yearly' : 'monthly',
      },
    },
    // Collecter le moyen de paiement uniquement si nécessaire
    payment_method_collection: 'if_required',
    // Permettre les codes promo
    allow_promotion_codes: true,
    // URLs de redirection
    success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: cancelUrl,
    // Métadonnées pour le webhook
    metadata: {
      userId,
      plan,
      billing_cycle: yearly ? 'yearly' : 'monthly',
    },
    // Configuration supplémentaire
    automatic_tax: { enabled: true },
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
    },
  });

  if (!session.url) {
    throw new Error('Impossible de créer la session Stripe');
  }

  console.log(`✅ Session créée: ${session.id}`);
  console.log(`🎁 Trial de 3 jours activé pour ${plan}`);

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Récupère les informations d'un abonnement Stripe
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Annule un abonnement à la fin de la période
 */
export async function cancelSubscriptionAtPeriodEnd(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Réactive un abonnement annulé
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

