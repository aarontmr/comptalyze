import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Route pour annuler l'abonnement d'un utilisateur
 * 
 * Usage : POST /api/cancel-subscription
 * Body: { "userId": "user-uuid" }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 });
    }

    // Récupérer l'utilisateur et ses métadonnées
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const stripeSubscriptionId = userData.user.user_metadata?.stripe_subscription_id;

    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'Aucun abonnement actif trouvé' }, { status: 400 });
    }

    // Annuler l'abonnement dans Stripe (immédiatement)
    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (stripeError: any) {
      // Si l'abonnement n'existe plus dans Stripe, on continue quand même
      if (stripeError.code !== 'resource_missing') {
        console.error('Erreur Stripe lors de l\'annulation:', stripeError);
        return NextResponse.json({ error: 'Erreur lors de l\'annulation avec Stripe' }, { status: 500 });
      }
    }

    // Mettre à jour la table subscriptions
    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: 'canceled',
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    // Retirer le statut premium/pro dans les métadonnées
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        subscription_plan: null,
        is_pro: false,
        is_premium: false,
        subscription_status: 'canceled',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'annulation:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

