import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2025-10-29.clover' })
  : null;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 });
    }

    // Récupérer les données utilisateur actuelles
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const metadata = userData.user.user_metadata || {};
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('plan_status, trial_plan, trial_ends_at, stripe_subscription_id')
      .eq('id', userId)
      .single();

    const metadataTrialActive = metadata.premium_trial_active === true;
    const metadataTrialStarted = !!metadata.premium_trial_started_at && (!metadata.premium_trial_ends_at || new Date(metadata.premium_trial_ends_at) > new Date());
    const profileTrialActive =
      userProfile?.plan_status === 'trialing' ||
      (userProfile?.trial_plan && (!userProfile.trial_ends_at || new Date(userProfile.trial_ends_at) > new Date()));

    // Vérifier si l'utilisateur a un essai actif
    if (!metadataTrialActive && !metadataTrialStarted && !profileTrialActive) {
      return NextResponse.json({ 
        error: "Vous n'avez pas d'essai gratuit actif" 
      }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const trialStart = metadata.premium_trial_started_at || nowIso;
    const stripeSubscriptionId =
      metadata.stripe_subscription_id ||
      userProfile?.stripe_subscription_id ||
      null;

    if (stripeSubscriptionId && stripe) {
      try {
        await stripe.subscriptions.cancel(stripeSubscriptionId);
        console.log(`🛑 Abonnement Stripe ${stripeSubscriptionId} annulé pour user ${userId}`);
      } catch (stripeError: any) {
        if (stripeError.code !== 'resource_missing') {
          console.error('❌ Erreur Stripe lors de l’annulation du trial:', stripeError);
          return NextResponse.json({ error: "Erreur lors de l'annulation dans Stripe" }, { status: 500 });
        }
        console.warn(`⚠️ Abonnement Stripe ${stripeSubscriptionId} introuvable, poursuite de l'annulation locale.`);
      }
    }

    // Retirer l'accès Premium et marquer l'essai comme consommé
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...metadata,
        premium_trial_started_at: trialStart,
        premium_trial_ends_at: nowIso,
        premium_trial_active: false,
        premium_trial_cancelled_at: nowIso,
        is_premium: false,
        is_pro: false,
        subscription_plan: null,
        subscription_status: stripeSubscriptionId ? 'canceled' : 'trial_cancelled',
        stripe_subscription_id: stripeSubscriptionId ? null : metadata.stripe_subscription_id,
      },
    });

    await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          plan: 'free',
          plan_status: 'trial_cancelled',
          trial_plan: null,
          trial_ends_at: nowIso,
          stripe_subscription_id: null,
          updated_at: nowIso,
        },
        { onConflict: 'id' }
      );

    console.log(`❌ Essai gratuit Premium annulé pour ${userId}`);

    return NextResponse.json({ 
      success: true,
      message: "Votre essai gratuit a été annulé."
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'annulation de l\'essai:', error);
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 });
  }
}

