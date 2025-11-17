/**
 * ============================================================================
 * WEBHOOK STRIPE - HANDLER IDEMPOTENT & ROBUSTE
 * ============================================================================
 * 
 * Gère tous les événements Stripe liés aux abonnements
 * 
 * Événements gérés :
 * - checkout.session.completed : Activation de l'abonnement
 * - customer.subscription.updated : Changements de statut
 * - customer.subscription.deleted : Annulation
 * - invoice.payment_succeeded : Paiements réussis (renouvellements)
 * 
 * Idempotence : Chaque événement n'est traité qu'une seule fois
 * Source de vérité : Table user_profiles en DB
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Vérifie si un événement a déjà été traité (idempotence)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single();
  
  return !!data;
}

/**
 * Marque un événement comme traité
 */
async function markEventProcessed(event: Stripe.Event): Promise<void> {
  await supabaseAdmin
    .from('webhook_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
      processed_at: new Date().toISOString(),
    });
}

/**
 * Extrait le plan depuis un price_id ou metadata
 */
function extractPlan(priceId: string | undefined, metadata: any): 'pro' | 'premium' {
  // 1) Essayer depuis metadata
  if (metadata?.plan && ['pro', 'premium'].includes(metadata.plan)) {
    return metadata.plan as 'pro' | 'premium';
  }
  
  // 2) Essayer depuis les env vars
  const premiumPriceIds = [
    process.env.STRIPE_PRICE_PREMIUM,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    process.env.STRIPE_PRICE_PREMIUM_YEARLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY,
  ].filter(Boolean);
  
  if (priceId && premiumPriceIds.includes(priceId)) {
    return 'premium';
  }
  
  // 3) Par défaut pro
  return 'pro';
}

/**
 * Récupère le userId depuis différentes sources
 */
function getUserId(
  session: Stripe.Checkout.Session | null,
  subscription: Stripe.Subscription | null
): string | null {
  // Priorité : client_reference_id > metadata.userId > metadata.client_reference_id
  return (
    session?.client_reference_id ||
    session?.metadata?.userId ||
    subscription?.metadata?.userId ||
    subscription?.metadata?.client_reference_id ||
    null
  );
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * 1) checkout.session.completed - Création de l'abonnement
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 checkout.session.completed:', session.id);
  
  const userId = getUserId(session, null);
  
  if (!userId) {
    console.error('❌ UserId manquant dans session:', session.id);
    return;
  }
  
  // Récupérer la subscription pour obtenir les détails
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.warn('⚠️ Pas de subscription_id dans la session:', session.id);
    return;
  }
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = extractPlan(subscription.items.data[0]?.price.id, subscription.metadata);
  
  console.log('📋 Subscription details:', {
    id: subscription.id,
    status: subscription.status,
    trial_end: subscription.trial_end,
    plan,
  });
  
  // Déterminer le statut
  const planStatus = subscription.status === 'canceled' ? 'canceled' : 'active';
  const trialPlan: string | null = null;
  const trialEndsAt: string | null = null;
  
  // Upsert dans user_profiles
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .upsert(
      {
        id: userId,
        plan: planStatus === 'active' ? plan : 'free',
        plan_status: planStatus,
        trial_plan: trialPlan,
        trial_ends_at: trialEndsAt,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    );
  
  if (error) {
    console.error('❌ Erreur upsert user_profiles:', error);
    throw error;
  }
  
  // Mettre à jour aussi les métadonnées de l'abonnement pour les événements futurs
  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      userId,
      plan,
    },
  });
  
  console.log(`✅ User ${userId} mis à jour: plan_status=${planStatus}`);
  
  // Traiter le parrainage si l'utilisateur vient de s'abonner
  await processReferralReward(userId, plan);
}

/**
 * Traite les récompenses de parrainage quand un filleul s'abonne
 */
async function processReferralReward(userId: string, plan: 'pro' | 'premium') {
  try {
    // Chercher un parrainage en attente pour cet utilisateur
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('referrals')
      .select('id, referrer_id, referral_code, status')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .single();

    if (referralError || !referral) {
      // Pas de parrainage en attente, c'est normal
      return;
    }

    // Calculer la récompense (exemple : 10% du prix du plan)
    // Vous pouvez ajuster ces montants selon vos besoins
    const rewardAmounts: Record<'pro' | 'premium', number> = {
      pro: 0.39, // 10% de 3.90€
      premium: 0.79, // 10% de 7.90€
    };

    const rewardAmount = rewardAmounts[plan] || 0;

    // Mettre à jour le parrainage
    const { error: updateError } = await supabaseAdmin
      .from('referrals')
      .update({
        status: 'completed',
        reward_type: 'credit',
        reward_amount: rewardAmount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour parrainage:', updateError);
      return;
    }

    console.log(`🎁 Récompense de parrainage attribuée: ${referral.referrer_id} a gagné ${rewardAmount}€ pour avoir parrainé ${userId} (plan ${plan})`);
  } catch (error) {
    console.error('❌ Erreur traitement parrainage:', error);
    // Ne pas bloquer le webhook en cas d'erreur de parrainage
  }
}

/**
 * 2) customer.subscription.updated - Changements d'état du subscription
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 customer.subscription.updated:', subscription.id, 'status:', subscription.status);
  
  const userId = getUserId(null, subscription);
  
  if (!userId) {
    console.warn('⚠️ UserId manquant dans subscription metadata:', subscription.id);
    return;
  }
  
  const plan = extractPlan(subscription.items.data[0]?.price.id, subscription.metadata);
  
  let planValue: 'free' | 'pro' | 'premium' = 'free';
  let planStatus: string = subscription.status;

  switch (subscription.status) {
    case 'active':
      planValue = plan;
      planStatus = 'active';
      console.log(`✅ Abonnement ${plan} actif`);
      break;
    case 'past_due':
    case 'unpaid':
      planValue = 'free';
      console.log(`⚠️ Problème de paiement: ${subscription.status}`);
      break;
    case 'canceled':
    case 'incomplete_expired':
      planValue = 'free';
      planStatus = 'canceled';
      console.log(`❌ Abonnement annulé ou expiré`);
      break;
    default:
      planValue = 'free';
      console.log(`ℹ️ Statut non géré: ${subscription.status}`);
  }
  
  // Upsert dans user_profiles
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .upsert(
      {
        id: userId,
        plan: planValue,
        plan_status: planStatus,
        trial_plan: null,
        trial_ends_at: null,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    );
  
  if (error) {
    console.error('❌ Erreur upsert user_profiles:', error);
    throw error;
  }
  
  console.log(`✅ User ${userId} mis à jour: plan=${planValue}, status=${planStatus}`);
}

/**
 * 3) customer.subscription.deleted - Annulation de l'abonnement
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ customer.subscription.deleted:', subscription.id);
  
  const userId = getUserId(null, subscription);
  
  if (!userId) {
    console.warn('⚠️ UserId manquant dans subscription metadata:', subscription.id);
    return;
  }
  
  // Downgrade vers free
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .upsert(
      {
        id: userId,
        plan: 'free',
        plan_status: 'canceled',
        trial_plan: null,
        trial_ends_at: null,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    );
  
  if (error) {
    console.error('❌ Erreur upsert user_profiles:', error);
    throw error;
  }
  
  console.log(`✅ User ${userId} downgradé vers free`);
}

/**
 * 4) invoice.payment_succeeded - Paiement réussi (renouvellement)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 invoice.payment_succeeded:', invoice.id);
  
  // Vérifier si c'est le premier paiement (renouvellement initial)
  const invoiceData = invoice as any;
  const subscriptionId = typeof invoiceData.subscription === 'string' 
    ? invoiceData.subscription 
    : invoiceData.subscription?.id;
    
  if (!subscriptionId) {
    console.log('ℹ️ Invoice sans subscription (paiement unique)');
    return;
  }
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
  const userId = getUserId(null, subscription);
  
  if (!userId) {
    console.warn('⚠️ UserId manquant dans subscription metadata:', subscription.id);
    return;
  }
  
  const plan = extractPlan(subscription.items.data[0]?.price.id, subscription.metadata);
  
  // Si premier paiement réussi, activer le plan
  if (subscription.status === 'active') {
    console.log(`✅ Premier paiement réussi pour ${plan}, activation du plan`);
    
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          plan: plan,
          plan_status: 'active',
          trial_plan: null,
          trial_ends_at: null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      );
    
    if (error) {
      console.error('❌ Erreur activation plan:', error);
      throw error;
    }
    
    console.log(`✅ Plan ${plan} activé pour user ${userId}`);
    
    // Traiter le parrainage si c'est le premier paiement
    await processReferralReward(userId, plan);
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  console.log('🎯 Webhook Stripe reçu');
  
  if (!signature) {
    console.error('❌ Signature manquante');
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }
  
  let event: Stripe.Event;
  
  // Vérifier la signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Signature vérifiée - Type:', event.type, 'ID:', event.id);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }
  
  // Vérifier l'idempotence
  try {
    const alreadyProcessed = await isEventProcessed(event.id);
    
    if (alreadyProcessed) {
      console.log(`⚠️ Événement ${event.id} déjà traité, skip`);
      return NextResponse.json({ received: true, skipped: true });
    }
  } catch (err) {
    console.error('❌ Erreur vérification idempotence:', err);
    // On continue quand même pour ne pas bloquer
  }
  
  // Traiter l'événement
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`ℹ️ Événement non géré: ${event.type}`);
    }
    
    // Marquer comme traité
    await markEventProcessed(event);
    
    console.log(`✅ Événement ${event.id} traité avec succès`);
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    
    // Ne pas marquer comme traité en cas d'erreur (retry automatique par Stripe)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

